# basic-commit 0.1

**English**

Ten commit-hygiene rules, each with one counterexample that must fail. The
pack contains rules only; it does not ship a runner or UI.

Install by unzipping this directory into `<bumao-core>/packs/rules/basic-commit/0.1/`,
pointing the pack configuration at the directory that holds `manifest.json`,
then running `node verify.mjs` here (Node.js 18+ and git are required). All 10
counterexamples must print `RED`.

Rules cover:

- a missing `.gitignore`, and one that does not cover `*.tmp`, `*.bak`, `*~`
- `.tmp` / `.bak` / editor swap residue in the tree
- any file over 1 MiB (`1048576` bytes)
- private key blocks and AWS access-key / secret-access-key shapes
- compiled and binary artifacts such as `.exe`, `.dll`, `.so`, `.jar`, `.pyc`
- TODO / FIXME markers left in source
- the latest commit subject being empty or shorter than 10 characters
- merge conflict markers

Commit-message checks read the local git history; the verifier creates a real
git repository inside each temporary fixture.

**中文**

10 条提交卫生规则，每条配一个必然失败的反例。本包只有规则，不带运行器和界面。

解压到 `<bumao-core>/packs/rules/basic-commit/0.1/`，把包配置指向放着
`manifest.json` 的那一层，然后在此目录运行 `node verify.mjs`（需要 Node.js 18+
和 git）；10 个反例必须全部报 `RED`。

覆盖：`.gitignore` 缺失或未覆盖临时文件、`.tmp`／`.bak`／编辑器残留、超过 1 MiB
（`1048576` 字节）的文件、私钥头与 AK/SK 形态、`.exe`／`.dll`／`.so`／`.jar`／`.pyc`
等编译产物、源码里的 TODO／FIXME、最新提交标题为空或不足 10 个字符、合并冲突标记。

提交信息规则读取本地 git 历史；校验脚本会在每个临时样例里建立一个真实 git 仓库。
