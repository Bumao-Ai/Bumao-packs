#!/usr/bin/env node
// basic-commit@0.1 verifier. Node.js 18+ and git, no npm dependencies.
// Each fixture is copied from _baseline, given a real git history, mutated,
// and then checked. The named rule must fire in every counterexample.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const PACK_ROOT = path.dirname(fileURLToPath(import.meta.url));
const CASE_ROOT = path.join(PACK_ROOT, "counterexamples");
const BASELINE = path.join(CASE_ROOT, "_baseline");
const BASELINE_COMMIT = "Initial baseline fixture for basic-commit";

const SUPPORTED_TYPES = new Set([
  "file_exists",
  "gitignore_contains",
  "no_temp_files",
  "max_file_size",
  "no_secrets",
  "no_binary_files",
  "no_markers",
  "git_commit_subject",
  "no_conflict_markers",
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

function resolveFile(root, rel, caseSensitive) {
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

function readTextFile(root, rel, maxBytes = 1024 * 1024) {
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

function gitAt(root, args) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
}

function initFixture(root) {
  gitAt(root, ["init", "-q"]);
  gitAt(root, ["add", "-A"]);
  gitAt(root, [
    "-c", "user.name=Fixture",
    "-c", "user.email=fixture@example.com",
    "commit", "-q", "--allow-empty", "-m", BASELINE_COMMIT,
  ]);
}

function runRule(rule, root) {
  const check = rule.check;
  const { files } = walk(root);
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
    case "gitignore_contains": {
      const text = readTextFile(root, check.file);
      for (const pattern of check.patterns) {
        if (!text || !text.includes(pattern)) push({ pattern });
      }
      break;
    }
    case "no_temp_files": {
      const regexes = check.patterns.map(globToRegex);
      for (const file of files) {
        if (regexes.some((regex) => regex.test(file.split("/").pop()))) push({ path: file });
      }
      break;
    }
    case "max_file_size": {
      for (const file of files) {
        const size = fs.statSync(join(root, file)).size;
        if (size > check.max_bytes) push({ path: file, size, limit: check.max_bytes });
      }
      break;
    }
    case "no_secrets": {
      const compiled = check.patterns.map((item) => ({
        kind: item.kind,
        regex: new RegExp(item.regex),
      }));
      for (const file of files) {
        let buf;
        try {
          buf = fs.readFileSync(join(root, file));
        } catch {
          continue;
        }
        if (buf.length > check.max_scan_bytes || buf.includes(0)) continue;
        const lines = buf.toString("utf8").split(/\r?\n/);
        for (const { kind, regex } of compiled) {
          const index = lines.findIndex((line) => regex.test(line));
          if (index >= 0) push({ kind, path: file, line: index + 1 });
        }
      }
      break;
    }
    case "no_binary_files": {
      const extensions = check.extensions.map((ext) => ext.toLowerCase());
      for (const file of files) {
        const lower = file.toLowerCase();
        if (extensions.some((ext) => lower.endsWith(ext))) push({ path: file });
      }
      break;
    }
    case "no_markers": {
      const regex = new RegExp(`\\b(?:${check.markers.join("|")})\\b`);
      for (const file of files) {
        let buf;
        try {
          buf = fs.readFileSync(join(root, file));
        } catch {
          continue;
        }
        if (buf.length > check.max_scan_bytes || buf.includes(0)) continue;
        const lines = buf.toString("utf8").split(/\r?\n/);
        const index = lines.findIndex((line) => regex.test(line));
        if (index >= 0) {
          const marker = /\b(TODO|FIXME)\b/.exec(lines[index])?.[1] ?? check.markers[0];
          push({ marker, path: file, line: index + 1 });
        }
      }
      break;
    }
    case "git_commit_subject": {
      let subject = "";
      try {
        subject = gitAt(root, ["log", "-1", "--pretty=%s"]).trim();
      } catch {
        subject = "";
      }
      if (subject.length < check.min_subject_length) {
        push({ length: subject.length, min: check.min_subject_length });
      }
      break;
    }
    case "no_conflict_markers": {
      for (const file of files) {
        let buf;
        try {
          buf = fs.readFileSync(join(root, file));
        } catch {
          continue;
        }
        if (buf.length > check.max_scan_bytes || buf.includes(0)) continue;
        const lines = buf.toString("utf8").split(/\r?\n/);
        const index = lines.findIndex((line) => /^(?:<<<<<<<|>>>>>>>)/.test(line));
        if (index >= 0) push({ path: file, line: index + 1 });
      }
      break;
    }
    default:
      throw new Error(`Unsupported check type: ${check.type}`);
  }

  return contexts.map((ctx) => ({
    rule_id: rule.rule_id,
    severity: rule.severity,
    message: format(rule.message, ctx),
  }));
}

function runRepo(root, rules) {
  return rules.flatMap((rule) => runRule(rule, root));
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

function prepareFixture(root, spec) {
  copyTree(BASELINE, root);
  applyMutations(root, spec?.mutations ?? {});
  initFixture(root);
  if (spec?.commit) {
    gitAt(root, [
      "-c", "user.name=Fixture",
      "-c", "user.email=fixture@example.com",
      "commit", "-q", "--allow-empty", "--allow-empty-message",
      "-m", spec.commit.message ?? "",
    ]);
  }
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

  console.log(`basic-commit ${manifest.version}: ${rules.length} rules, ${manifest.counterexample_count} counterexamples`);
  console.log("");

  const failures = [];
  const baselineTmp = fs.mkdtempSync(path.join(os.tmpdir(), "basic-commit-base-"));
  try {
    prepareFixture(baselineTmp);
    const baselineFindings = runRepo(baselineTmp, rules);
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

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "basic-commit-case-"));
    try {
      prepareFixture(tmp, spec);
      const findings = runRepo(tmp, rules);
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
