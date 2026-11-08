# Changelog

## Unreleased — 2026-11-08

English

- **License unified.** `LICENSE` is now byte-identical to the file used by the four main repositories (Apache-2.0, 11,336 B, sha256 `180ab2a186c91b04…`), with no extra copyright line and no leading blank line. `index.json` and all three `manifest.json` files declare `Apache-2.0`.
- **Pack self-check is green again.** `basic-repo` failed on its own baseline because the fixture README was checked out with CRLF, and `basic-delivery` failed because its `_baseline/SHA256SUMS` was stale. Both fixed; `node verify.mjs` now returns `RESULT: PASS` for all three packs (14/14, 10/10, 10/10).
- **Line endings pinned.** New `.gitattributes` (`* text=auto eol=lf`, `*.bat text eol=crlf`); the CRLF working-tree conversion that caused the false baseline failure no longer applies.
- **README rebuilt** to the same 11-section structure as the four main repositories, with measured values and a real terminal screenshot.
- **Missing repository files added:** `CHANGELOG.md`, `CONTRIBUTING.md`, `TRADEMARK.md`, `DCO`.

No rule, check or contract behaviour changed. `packs/rules/*/0.1/rules/*.json` is untouched.

中文

- **许可证统一。** `LICENSE` 现与四个主仓同一份（Apache-2.0，11,336 B，sha256 `180ab2a186c91b04…`），不再附额外版权行、不再有空首行；`index.json` 与三个 `manifest.json` 均声明 `Apache-2.0`。
- **包自检恢复全绿。** `basic-repo` 因 fixture README 被检出为 CRLF 导致基线误红；`basic-delivery` 因 `_baseline/SHA256SUMS` 过期而红。均已修复，三个包 `node verify.mjs` 现均为 `RESULT: PASS`（14/14、10/10、10/10）。
- **行尾固定。** 新增 `.gitattributes`（`* text=auto eol=lf`、`*.bat text eol=crlf`），消除 CRLF 工作区转换造成的基线误报。
- **README 重建**为与四主仓相同的 11 节结构，数字均实测，配真实终端截图。
- **补齐仓内必备文件：** `CHANGELOG.md`、`CONTRIBUTING.md`、`TRADEMARK.md`、`DCO`。

未改动任何规则、检查项或契约行为；`packs/rules/*/0.1/rules/*.json` 保持原样。

## 0.1 — 2026-11-08

English

Initial release. Three independent release lines, one per pack: `v0.1` (basic-repo), `basic-commit-0.1`, `basic-delivery-0.1`. No repo-wide single version line exists yet.

中文

首次发布。三条独立发布线，每包一条：`v0.1`（basic-repo）、`basic-commit-0.1`、`basic-delivery-0.1`。尚无整仓统一版本号。
