# basic-delivery 0.1

**English**

Ten delivery-readiness rules, each with one counterexample that must fail. The
pack contains rules only; it does not ship a runner or UI.

Install by unzipping this directory into `<bumao-core>/packs/rules/basic-delivery/0.1/`,
pointing the pack configuration at the directory that holds `manifest.json`,
then running `node verify.mjs --tag v0.1` here. All 10 counterexamples must
print `RED`.

The rules assume a small set of delivery conventions:

- `backup/` holds at least one non-empty backup file
- `SHA256SUMS` lists one `hash  path` line per shipped file
- `README.md` contains a `Version: 0.1` line
- `ROLLBACK.md` contains a concrete rollback command
- `release/` holds the `.zip` artifact and no `.bak` file

The tag can be supplied with `--tag v0.1` or the `BUMAO_TAG` environment
variable. Without a tag the version rule cannot judge and will fail.

**中文**

10 条交付就绪规则，每条配一个必然失败的反例。本包只有规则，不带运行器和界面。

解压到 `<bumao-core>/packs/rules/basic-delivery/0.1/`，把包配置指向放着
`manifest.json` 的那一层，然后在此目录运行 `node verify.mjs --tag v0.1`；
10 个反例必须全部报 `RED`。

规则约定：`backup/` 至少有一个非空备份文件；`SHA256SUMS` 每个交付文件一行
`哈希  路径`；`README.md` 有 `Version: 0.1` 一行；`ROLLBACK.md` 有可执行的
回滚命令；`release/` 放 `.zip` 交付物且不混入 `.bak`。

tag 用 `--tag v0.1` 或环境变量 `BUMAO_TAG` 传入；没有 tag 时版本规则无法判定，会报失败。
