# Changelog

## 0.1.3 — 2026-11-11

English

- **Repository-wide release `v0.1.3`.** The tag version tracks documentation and catalog changes; pack contents remain at `0.1`.
- **`basic-repo` counterexample baseline is now Apache-2.0.** `counterexamples/_baseline/LICENSE` carries the Apache-2.0 text (11,339 B, appendix filled as `Copyright 2026 Bumao-Ai`) in place of the former MIT text, and `_baseline/README.md` declares `Apache-2.0`. No file in the repository is offered under MIT any more.
- **The licence-mismatch counterexample was inverted, not weakened.** `license-file-matches` now replaces LICENSE with MIT text while README keeps declaring Apache-2.0, so the mismatch still fires; its `expect_fail` is unchanged. MIT text therefore survives only as that case's mutation payload — test data, not a licence grant. `license-declared`'s setup wording follows the new baseline. No rule file, threshold, detector or `expect_fail` was edited.
- **`basic-repo` archive rebuilt.** SHA-256 `a252f2db…`, 22,597 B (was `5751aac1…`, 18,762 B). `basic-commit` and `basic-delivery` are byte-identical to `v0.1.2` (`d9123ee5…` 13,703 B and `04e78143…` 14,108 B). All three are re-attached to this tag and `index.json` points at `v0.1.3`.
- **Measured facts refreshed.** README commit count, last-commit date and release list now match the repository at `v0.1.3`.

Verify: `node packs/rules/<pack>/0.1/verify.mjs` → `RESULT: PASS` (14/14, 10/10, 10/10); the rebuilt `basic-repo-0.1.zip` was extracted into a clean directory and re-verified → `RESULT: PASS` (14/14, baseline clean); `sha256sum -c dist/SHA256SUMS` → all OK.

中文

- **整仓发行版 `v0.1.3`。** tag 版本随文档与目录更新，包内容仍为 `0.1`。
- **`basic-repo` 反例基线改为 Apache-2.0。** `counterexamples/_baseline/LICENSE` 由原 MIT 正文换成 Apache-2.0 正文（11,339 B，附录填 `Copyright 2026 Bumao-Ai`），`_baseline/README.md` 的声明行同步改为 `Apache-2.0`。仓内不再有任何以 MIT 授出的文件。
- **许可不一致反例是反向，不是削弱。** `license-file-matches` 改为「把 LICENSE 换成 MIT 正文、README 仍声明 Apache-2.0」，不一致照样触发，`expect_fail` 一字未动。MIT 正文因此只作为该用例的 mutation 载荷存在——是测试数据，不是许可授予。`license-declared` 的 setup 文案随基线更新。规则文件、阈值、检测器与 `expect_fail` 均未改动。
- **`basic-repo` 压缩件重打。** SHA-256 `a252f2db…`，22,597 B（原 `5751aac1…`，18,762 B）。`basic-commit` 与 `basic-delivery` 与 `v0.1.2` 逐字节相同（`d9123ee5…` 13,703 B、`04e78143…` 14,108 B）。三个包一并挂到本 tag，`index.json` 指向 `v0.1.3`。
- **实测数字刷新。** README 的提交次数、最近提交日期、发布列表与 `v0.1.3` 处的仓库状态一致。

验证：`node packs/rules/<包名>/0.1/verify.mjs` → `RESULT: PASS`（14/14、10/10、10/10）；重打的 `basic-repo-0.1.zip` 解包到干净目录复跑 → `RESULT: PASS`（14/14，基线干净）；`sha256sum -c dist/SHA256SUMS` → 全部 OK。

## 0.1.2 — 2026-11-09

English

- **Repository-wide release `v0.1.2`.** The tag version tracks documentation and catalog changes; pack contents remain at `0.1`.
- **Bilingual docs completed.** `CONTRIBUTING.md`, `NOTICE` and `SECURITY.md` now carry the full English section alongside the existing Chinese text.
- **Catalog and README links point at this release.** `index.json` and both README pack tables now use `releases/download/v0.1.2/`, so a download from the documentation resolves to the archives attached to this tag.
- **Measured facts refreshed.** README commit count, last-commit date and release list now match the repository at `v0.1.2`.
- **Pack archives are unchanged.** All three zips are byte-identical to `v0.1.1` — same SHA-256 (`5751aac1…`, `d9123ee5…`, `04e78143…`) and same sizes (18,762 / 13,703 / 14,108 B). No rule, check or contract behaviour changed.

Verify: `node packs/rules/<pack>/0.1/verify.mjs` → `RESULT: PASS` (14/14, 10/10, 10/10); `sha256sum -c dist/SHA256SUMS` → all OK.

中文

- **整仓发行版 `v0.1.2`。** tag 版本随文档与目录更新，包内容仍为 `0.1`。
- **双语文档补齐。** `CONTRIBUTING.md`、`NOTICE`、`SECURITY.md` 在原有中文之后补齐完整英文段落。
- **目录与 README 链接指向本版。** `index.json` 与中英文 README 的包清单统一改为 `releases/download/v0.1.2/`，从文档点下载即落到本 tag 所附资产。
- **实测数字刷新。** README 的提交次数、最近提交日期、发布列表与 `v0.1.2` 处的仓库状态一致。
- **包压缩件未变。** 三个 zip 与 `v0.1.1` 逐字节相同，SHA-256 一致（`5751aac1…`、`d9123ee5…`、`04e78143…`），体积一致（18,762／13,703／14,108 B）；规则、检查项与契约行为均未改动。

验证：`node packs/rules/<包名>/0.1/verify.mjs` → `RESULT: PASS`（14/14、10/10、10/10）；`sha256sum -c dist/SHA256SUMS` → 全部 OK。

## 0.1.1 — 2026-11-09

English

- **License unified.** `LICENSE` is now byte-identical to the file used by the four main repositories (Apache-2.0, 11,336 B, sha256 `180ab2a186c91b04…`), with no extra copyright line and no leading blank line. `index.json` and all three `manifest.json` files declare `Apache-2.0`.
- **Pack self-check is green again.** `basic-repo` failed on its own baseline because the fixture README was checked out with CRLF, and `basic-delivery` failed because its `_baseline/SHA256SUMS` was stale. Both fixed; `node verify.mjs` now returns `RESULT: PASS` for all three packs (14/14, 10/10, 10/10).
- **Line endings pinned.** New `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`); the CRLF working-tree conversion that caused the false baseline failure no longer applies.
- **README rebuilt** to the same 11-section structure as the four main repositories, with measured values and a real terminal screenshot.
- **Missing repository files added:** `CHANGELOG.md`, `CONTRIBUTING.md`, `TRADEMARK.md`, `DCO`.
- **Pack archives rebuilt for this release.** All three `manifest.json` files changed (`license` `MIT` → `Apache-2.0`), and `basic-delivery`'s `_baseline/SHA256SUMS` lost its trailing newline, so every pack zip is republished under `v0.1.1`; `index.json` `download_url` / `sha256` / `size_bytes` were updated accordingly (basic-repo 18,744 → 18,762 B, basic-commit 13,701 → 13,703 B, basic-delivery 14,109 → 14,108 B). The `v0.1`, `basic-commit-0.1` and `basic-delivery-0.1` releases remain in place, untouched.

No rule, check or contract behaviour changed. `packs/rules/*/0.1/rules/*.json` is untouched.

中文

- **许可证统一。** `LICENSE` 现与四个主仓同一份（Apache-2.0，11,336 B，sha256 `180ab2a186c91b04…`），不再附额外版权行、不再有空首行；`index.json` 与三个 `manifest.json` 均声明 `Apache-2.0`。
- **包自检恢复全绿。** `basic-repo` 因 fixture README 被检出为 CRLF 导致基线误红；`basic-delivery` 因 `_baseline/SHA256SUMS` 过期而红。均已修复，三个包 `node verify.mjs` 现均为 `RESULT: PASS`（14/14、10/10、10/10）。
- **行尾固定。** 新增 `.gitattributes`（`* text=auto eol=lf`、`*.bat text eol=crlf`），消除 CRLF 工作区转换造成的基线误报。
- **README 重建**为与四主仓相同的 11 节结构，数字均实测，配真实终端截图。
- **补齐仓内必备文件：** `CHANGELOG.md`、`CONTRIBUTING.md`、`TRADEMARK.md`、`DCO`。
- **本版重打并重发三个包的压缩件。** 三个 `manifest.json` 均有改动（`license` `MIT` → `Apache-2.0`），`basic-delivery` 的 `_baseline/SHA256SUMS` 去掉行尾换行，因此三个包全部在 `v0.1.1` 重发；`index.json` 的 `download_url`／`sha256`／`size_bytes` 同步更新（basic-repo 18,744 → 18,762 B，basic-commit 13,701 → 13,703 B，basic-delivery 14,109 → 14,108 B）。原 `v0.1`、`basic-commit-0.1`、`basic-delivery-0.1` 三个 Release 原样保留，未删除、未替换资产。

未改动任何规则、检查项或契约行为；`packs/rules/*/0.1/rules/*.json` 保持原样。

## 0.1 — 2026-11-08

English

Initial release. Three independent release lines, one per pack: `v0.1` (basic-repo), `basic-commit-0.1`, `basic-delivery-0.1`. No repo-wide single version line exists yet.

中文

首次发布。三条独立发布线，每包一条：`v0.1`（basic-repo）、`basic-commit-0.1`、`basic-delivery-0.1`。尚无整仓统一版本号。

---

## English

### 0.1.2 — 2026-11-09

- **Repository-wide release `v0.1.2`.** The tag version tracks documentation and catalog changes; pack contents remain at `0.1`.
- **Bilingual docs completed.** `CONTRIBUTING.md`, `NOTICE` and `SECURITY.md` now carry the full English section alongside the existing Chinese text.
- **Catalog and README links point at this release.** `index.json` and both README pack tables now use `releases/download/v0.1.2/`, so a download from the documentation resolves to the archives attached to this tag.
- **Measured facts refreshed.** README commit count, last-commit date and release list now match the repository at `v0.1.2`.
- **Pack archives are unchanged.** All three zips are byte-identical to `v0.1.1` — same SHA-256 (`5751aac1…`, `d9123ee5…`, `04e78143…`) and same sizes (18,762 / 13,703 / 14,108 B). No rule, check or contract behaviour changed.

Verify: `node packs/rules/<pack>/0.1/verify.mjs` → `RESULT: PASS` (14/14, 10/10, 10/10); `sha256sum -c dist/SHA256SUMS` → all OK.

### 0.1.1 — 2026-11-09

- **License unified.** `LICENSE` is now byte-identical to the file used by the four main repositories (Apache-2.0, 11,336 B, sha256 `180ab2a186c91b04…`), with no extra copyright line and no leading blank line. `index.json` and all three `manifest.json` files declare `Apache-2.0`.
- **Pack self-check is green again.** `basic-repo` failed on its own baseline because the fixture README was checked out with CRLF, and `basic-delivery` failed because its `_baseline/SHA256SUMS` was stale. Both fixed; `node verify.mjs` now returns `RESULT: PASS` for all three packs (14/14, 10/10, 10/10).
- **Line endings pinned.** New `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`); the CRLF working-tree conversion that caused the false baseline failure no longer applies.
- **README rebuilt** to the same 11-section structure as the four main repositories, with measured values and a real terminal screenshot.
- **Missing repository files added:** `CHANGELOG.md`, `CONTRIBUTING.md`, `TRADEMARK.md`, `DCO`.
- **Pack archives rebuilt for this release.** All three `manifest.json` files changed (`license` `MIT` → `Apache-2.0`), and `basic-delivery`'s `_baseline/SHA256SUMS` lost its trailing newline, so every pack zip is republished under `v0.1.1`; `index.json` `download_url` / `sha256` / `size_bytes` were updated accordingly (basic-repo 18,744 → 18,762 B, basic-commit 13,701 → 13,703 B, basic-delivery 14,109 → 14,108 B). The `v0.1`, `basic-commit-0.1` and `basic-delivery-0.1` releases remain in place, untouched.

No rule, check or contract behaviour changed. `packs/rules/*/0.1/rules/*.json` is untouched.

### 0.1 — 2026-11-08

Initial release. Three independent release lines, one per pack: `v0.1` (basic-repo), `basic-commit-0.1`, `basic-delivery-0.1`. No repo-wide single version line exists yet.
