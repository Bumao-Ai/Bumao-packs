#!/usr/bin/env node
// basic-delivery@0.1 verifier. Node.js 18+, no npm dependencies.
// Runs delivery checks against one clean baseline and one counterexample per
// rule. The named rule must fire in every counterexample.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const PACK_ROOT = path.dirname(fileURLToPath(import.meta.url));
const CASE_ROOT = path.join(PACK_ROOT, "counterexamples");
const BASELINE = path.join(CASE_ROOT, "_baseline");

const SUPPORTED_TYPES = new Set([
  "file_exists",
  "dir_exists",
  "dir_contains_file",
  "dir_has_nonempty_file",
  "sha256sums_match",
  "readme_version_matches_tag",
  "text_contains_command",
  "no_bak_in_dir",
]);

function join(root, rel) {
  return path.join(root, ...rel.split("/"));
}

function walk(root) {
  const files = [];
  const dirs = [];
  const rec = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        dirs.push(relPath);
        rec(path.join(dir, entry.name), relPath);
      } else if (entry.isFile()) {
        files.push(relPath);
      }
    }
  };
  rec(root, "");
  return { files, dirs };
}

function resolveFile(root, rel, caseSensitive = true) {
  const parts = rel.split("/").filter(Boolean);
  let cur = root;
  for (let i = 0; i < parts.length; i += 1) {
    let names;
    try {
      names = fs.readdirSync(cur);
    } catch {
      return false;
    }
    let actual = null;
    if (caseSensitive) {
      actual = names.includes(parts[i]) ? parts[i] : null;
    } else {
      actual = names.find((name) => name.toLowerCase() === parts[i].toLowerCase()) ?? null;
    }
    if (!actual) return false;
    cur = path.join(cur, actual);
    if (i < parts.length - 1 && !fs.statSync(cur).isDirectory()) return false;
  }
  return fs.existsSync(cur) && fs.statSync(cur).isFile();
}

function readTextFile(root, rel, maxBytes = 2 * 1024 * 1024) {
  if (!resolveFile(root, rel, true)) return null;
  const buf = fs.readFileSync(join(root, rel));
  if (buf.length > maxBytes || buf.includes(0)) return null;
  return buf.toString("utf8");
}

function format(template, ctx) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(ctx, key) ? String(ctx[key]) : match
  );
}

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function tagVersion(tag) {
  const match = /([0-9]+(?:\.[0-9]+){1,2})$/.exec(tag ?? "");
  return match ? match[1] : String(tag ?? "").replace(/^v/i, "");
}

function dirFileList(root, dir) {
  const prefix = dir ? `${dir}/` : "";
  return walk(root).files.filter((file) => (prefix ? file.startsWith(prefix) : true));
}

function matchesPattern(rel, pattern) {
  if (!pattern) return true;
  const regex = globToRegex(pattern);
  return regex.test(rel.split("/").pop());
}

function runRule(rule, root, options) {
  const check = rule.check;
  const { files, dirs } = walk(root);
  const contexts = [];
  const push = (ctx) => contexts.push(ctx);

  switch (check.type) {
    case "file_exists": {
      const caseSensitive = check.case_sensitive !== false;
      for (const rel of check.paths) {
        if (!resolveFile(root, rel, caseSensitive)) push({ path: rel });
      }
      break;
    }
    case "dir_exists": {
      if (!dirs.includes(check.dir)) push({ dir: check.dir });
      break;
    }
    case "dir_contains_file": {
      if (!dirs.includes(check.dir)) {
        push({ dir: check.dir, match: check.match });
        break;
      }
      const matched = dirFileList(root, check.dir).filter((file) => matchesPattern(file, check.match));
      if (matched.length === 0) push({ dir: check.dir, match: check.match });
      break;
    }
    case "dir_has_nonempty_file": {
      if (!dirs.includes(check.dir)) {
        push({ dir: check.dir, path: `${check.dir}/`, size: 0, limit: check.min_bytes });
        break;
      }
      const matched = dirFileList(root, check.dir).filter((file) => matchesPattern(file, check.match));
      const nonEmpty = matched.filter((file) => fs.statSync(join(root, file)).size >= check.min_bytes);
      if (nonEmpty.length === 0) {
        const first = matched[0] ?? `${check.dir}/`;
        const size = first === `${check.dir}/` ? 0 : fs.statSync(join(root, first)).size;
        push({ path: first, dir: check.dir, size, limit: check.min_bytes });
      }
      break;
    }
    case "sha256sums_match": {
      const text = readTextFile(root, check.file);
      if (!text) {
        push({ path: check.file, expected: "missing file", actual: "none" });
        break;
      }
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      let entries = 0;
      for (const line of lines) {
        const match = /^([0-9a-fA-F]{64})\s+[*]?(.+)$/.exec(line);
        if (!match) continue;
        entries += 1;
        const expected = match[1].toLowerCase();
        const rel = match[2].trim();
        if (/[\\]/.test(rel) || rel.startsWith("/") || rel.includes("..")) {
          push({ path: rel, expected, actual: "unsupported path" });
          continue;
        }
        if (!resolveFile(root, rel, true)) {
          push({ path: rel, expected, actual: "missing file" });
          continue;
        }
        const actual = sha256(fs.readFileSync(join(root, rel)));
        if (actual !== expected) push({ path: rel, expected, actual });
      }
      if (entries === 0) push({ path: check.file, empty: true });
      break;
    }
    case "readme_version_matches_tag": {
      const text = readTextFile(root, check.readme);
      const match = text ? /Version\s*[:=]\s*v?([0-9]+(?:\.[0-9]+){1,2})/i.exec(text) : null;
      const declared = match ? match[1] : null;
      const tag = options?.tag ?? null;
      if (!tag) {
        push({ declared: declared ?? "no version", tag: "no tag supplied" });
      } else if (!declared || declared !== tagVersion(tag)) {
        push({ declared: declared ?? "no version", tag });
      }
      break;
    }
    case "text_contains_command": {
      const text = readTextFile(root, check.file);
      if (!text) {
        push({ path: check.file, pattern: check.patterns.join(" | ") });
        break;
      }
      const found = check.patterns.some((pattern) => new RegExp(pattern, "i").test(text));
      if (!found) push({ path: check.file, pattern: check.patterns.join(" | ") });
      break;
    }
    case "no_bak_in_dir": {
      const scoped = check.dir ? files.filter((file) => file.startsWith(`${check.dir}/`)) : files;
      for (const file of scoped) {
        if (file.toLowerCase().endsWith(".bak")) push({ path: file, dir: check.dir });
      }
      break;
    }
    default:
      throw new Error(`Unsupported check type: ${check.type}`);
  }

  return contexts.map((ctx) => ({
    rule_id: rule.rule_id,
    severity: rule.severity,
    message: ctx.empty ? rule.message_empty ?? rule.message : format(rule.message, ctx),
  }));
}

function runRepo(root, rules, options) {
  return rules.flatMap((rule) => runRule(rule, root, options));
}

function loadRules() {
  const manifest = JSON.parse(fs.readFileSync(path.join(PACK_ROOT, "manifest.json"), "utf8"));
  if (manifest.schema !== "bumao.pack/v1") throw new Error(`Unexpected manifest schema: ${manifest.schema}`);
  const rules = [];
  const ids = new Set();
  for (const rel of manifest.rule_files) {
    const rule = JSON.parse(fs.readFileSync(path.join(PACK_ROOT, rel), "utf8"));
    if (rule.schema !== "bumao.rule/v1") throw new Error(`${rel}: unexpected rule schema`);
    if (!rule.rule_id) throw new Error(`${rel}: missing rule_id`);
    if (ids.has(rule.rule_id)) throw new Error(`${rel}: duplicate rule_id ${rule.rule_id}`);
    ids.add(rule.rule_id);
    if (!SUPPORTED_TYPES.has(rule.check?.type)) throw new Error(`${rel}: unsupported check type ${rule.check?.type}`);
    if (!["blocker", "major", "minor"].includes(rule.severity)) throw new Error(`${rel}: bad severity`);
    if (!rule.message) throw new Error(`${rel}: missing message`);
    rules.push(rule);
  }
  if (manifest.rule_count !== rules.length) {
    throw new Error(`manifest.rule_count ${manifest.rule_count} != ${rules.length} loaded rules`);
  }
  return { manifest, rules };
}

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function applyMutations(root, mutations) {
  for (const rel of mutations.delete ?? []) {
    fs.rmSync(join(root, rel), { recursive: true, force: true });
  }
  for (const rel of mutations.mkdir ?? []) {
    fs.mkdirSync(join(root, rel), { recursive: true });
  }
  for (const [rel, content] of Object.entries(mutations.write ?? {})) {
    const target = join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  for (const item of mutations.write_bytes ?? []) {
    const target = join(root, item.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.alloc(item.size, item.fill ?? "x"));
  }
}

function parseDefaultTag() {
  const equals = process.argv.find((arg) => arg.startsWith("--tag="));
  if (equals) return equals.slice("--tag=".length);
  const index = process.argv.indexOf("--tag");
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return process.env.BUMAO_TAG ?? "v0.1";
}

function main() {
  let loaded;
  try {
    loaded = loadRules();
  } catch (error) {
    console.error(`CONFIG ERROR: ${error.message}`);
    process.exit(2);
  }
  const { manifest, rules } = loaded;
  const ruleIds = new Set(rules.map((rule) => rule.rule_id));
  const defaultTag = parseDefaultTag();

  console.log(`basic-delivery ${manifest.version}: ${rules.length} rules, ${manifest.counterexample_count} counterexamples`);
  console.log(`tag for verification: ${defaultTag}`);
  console.log("");

  const failures = [];
  const baselineTmp = fs.mkdtempSync(path.join(os.tmpdir(), "basic-delivery-base-"));
  try {
    copyTree(BASELINE, baselineTmp);
    const baselineFindings = runRepo(baselineTmp, rules, { tag: defaultTag });
    if (baselineFindings.length === 0) {
      console.log("GREEN _baseline (0 findings)");
    } else {
      console.log(`MISS  _baseline (${baselineFindings.length} findings; it must stay clean)`);
      for (const finding of baselineFindings) console.log(`      ${finding.rule_id}: ${finding.message}`);
      failures.push("baseline must produce no findings");
    }
  } finally {
    fs.rmSync(baselineTmp, { recursive: true, force: true });
  }

  const caseDirs = fs
    .readdirSync(CASE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_baseline")
    .map((entry) => entry.name)
    .sort();

  if (caseDirs.length !== manifest.counterexample_count) {
    failures.push(`expected ${manifest.counterexample_count} counterexamples, found ${caseDirs.length}`);
  }

  const covered = new Set();
  let red = 0;
  for (const dirName of caseDirs) {
    const caseFile = path.join(CASE_ROOT, dirName, "case.json");
    if (!fs.existsSync(caseFile)) {
      failures.push(`${dirName}: case.json is missing`);
      console.log(`MISS  ${dirName} (no case.json)`);
      continue;
    }
    let spec;
    try {
      spec = JSON.parse(fs.readFileSync(caseFile, "utf8"));
    } catch (error) {
      failures.push(`${dirName}: case.json is invalid JSON (${error.message})`);
      console.log(`MISS  ${dirName} (invalid case.json)`);
      continue;
    }
    if (!ruleIds.has(spec.expect_fail)) {
      failures.push(`${dirName}: expect_fail names unknown rule ${spec.expect_fail}`);
      console.log(`MISS  ${dirName} (unknown rule ${spec.expect_fail})`);
      continue;
    }
    covered.add(spec.expect_fail);

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "basic-delivery-case-"));
    try {
      copyTree(BASELINE, tmp);
      applyMutations(tmp, spec.mutations ?? {});
      const findings = runRepo(tmp, rules, { tag: spec.tag ?? defaultTag });
      const target = findings.filter((finding) => finding.rule_id === spec.expect_fail);
      const isRed = target.length > 0;
      if (isRed) red += 1;
      console.log(
        `${isRed ? "RED " : "MISS"} ${dirName.padEnd(30)} ${spec.expect_fail} (${target.length} finding${target.length === 1 ? "" : "s"})`
      );
      if (!isRed) {
        const others = findings.length ? findings.map((finding) => finding.rule_id).join(", ") : "none";
        failures.push(`${dirName}: ${spec.expect_fail} did not fire; other findings: ${others}`);
        console.log(`      setup: ${spec.setup ?? ""}`);
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }

  for (const ruleId of ruleIds) {
    if (!covered.has(ruleId)) failures.push(`no counterexample covers ${ruleId}`);
  }

  console.log("");
  if (failures.length > 0) {
    console.log("RESULT: FAIL");
    for (const failure of failures) console.log(`- ${failure}`);
    process.exit(1);
  }
  console.log(
    `RESULT: PASS — ${red}/${caseDirs.length} counterexamples red, baseline clean, ${covered.size}/${rules.length} rules covered`
  );
}

main();
