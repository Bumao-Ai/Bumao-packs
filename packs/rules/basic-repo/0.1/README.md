# basic-repo 0.1

**English**

Fourteen starter rules for any repository, plus one failing counterexample per
rule. The pack contains rules only; it does not ship a runner or UI.

Install by unzipping this directory into `<bumao-core>/packs/rules/basic-repo/0.1/`,
pointing the pack configuration at the directory that holds `manifest.json`,
then running `node verify.mjs` here. All 14 counterexamples must print `RED`.

Rules cover:

- required files: README.md, LICENSE, NOTICE, SECURITY.md
- non-empty required files
- lowercase kebab-case directory names
- empty directory residue
- a license declaration in README.md and its agreement with LICENSE
- relative links and backticked file paths mentioned in README.md
- temporary files, files over 256 KiB, and secret-looking strings

Counterexamples live in `counterexamples/`. `_baseline` is the passing sample;
each other directory holds a `case.json` that names one rule and describes the
mutation that must make it fail.

**中文**

14 条起盘规则，每条配一个必然失败的反例。本包只有规则，不带运行器和界面。

解压到 `<bumao-core>/packs/rules/basic-repo/0.1/`，把包配置指向放着 `manifest.json`
的那一层，然后在此目录运行 `node verify.mjs`；14 个反例必须全部报 `RED`。

规则覆盖：必备文件、必备文件非空、目录小写 kebab-case、空目录残留、README
许可证声明与 LICENSE 一致、README 里的相对链接与反引号文件路径、临时文件、
超过 256 KiB 的大文件、疑似密钥。

反例在 `counterexamples/`：`_baseline` 是通过样例，其余每个目录的 `case.json`
写明目标规则和必须触发它的改动。
