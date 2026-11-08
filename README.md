# bumao-packs

**English**

Optional rule packs and feature packs for Bumao Core — install what you need, keep the kernel minimal.

1. **What this is:** this repository holds packs you install into Bumao Core; the kernel itself is not here.
2. **Who it is for:** people who want checks and UI available as soon as a repository is set up.
3. **What it solves:** the kernel only judges; rules and features come from packs — installing nothing breaks nothing, installing gives you content.

> **Every pack ships counterexamples. Run them yourself and watch them go red — that is how you know a pack is not decoration.**

**中文**

内核的可选规则包与功能包，按需安装，内核保持最小。

1. **这是什么：**这里放的是给 Bumao Core 装的「包」，不是内核本身。
2. **给谁：**想让仓库一装起来就有检查项、有界面的人。
3. **解决什么：**内核只负责判定，规则和功能靠包补——不装不会坏，装了才有内容。

> **每个包都带反例，装完能自己跑红，证明它不是摆设。**

## Packs

| Pack | Version | Kind | Rules | Counterexamples | Requires contract | Archive |
|---|---|---|---|---|---|---|
| `basic-repo` | `0.1` | rules | 14 | 14 | `bumao.rule-pack/v1` | [basic-repo-0.1.zip](https://github.com/Bumao-Ai/bumao-packs/releases/download/v0.1/basic-repo-0.1.zip) |

`index.json` is the machine-readable catalog: pack id, version, contract, download URL, and SHA-256 for each archive.

### basic-repo 0.1

Starter checks that make sense for any repository: required files, directory naming, empty directories, license consistency, README references, temporary files, large files, and secret-looking strings.

All rules are machine-checkable, and each rule ships one counterexample that must fail.

## Manual install

No `bumao-pack install` command is provided yet. Three steps:

1. Download `basic-repo-0.1.zip` from the Release and unzip it into `<bumao-core>/packs/rules/basic-repo/0.1/`.
2. Point your Bumao Core pack configuration at that directory — the one containing `manifest.json` and `rules/`.
3. Run `node verify.mjs` inside that directory; all 14 counterexamples must print `RED`, then run one `check` against a real repository.

## Verify a download

Download the archive and `SHA256SUMS` from the Release, then compare:

```bash
sha256sum -c SHA256SUMS
```

On Windows PowerShell:

```powershell
(Get-FileHash .\basic-repo-0.1.zip -Algorithm SHA256).Hash.ToLower() -eq (Get-Content .\SHA256SUMS).Split()[0]
```

The expected digest is also recorded in `index.json`.

---

# bumao-packs（中文）

内核的可选规则包与功能包，按需安装，内核保持最小。

这里放的是给 Bumao Core 装的「包」，不是内核本身。给想让仓库一装起来就有检查项、有界面的人。内核只负责判定，规则和功能靠包补——不装不会坏，装了才有内容。

**每个包都带反例，装完能自己跑红，证明它不是摆设。**

## 包目录

| 包 | 版本 | 类型 | 规则数 | 反例数 | 依赖契约 | 下载 |
|---|---|---|---|---|---|---|
| `basic-repo` | `0.1` | 规则 | 14 | 14 | `bumao.rule-pack/v1` | [basic-repo-0.1.zip](https://github.com/Bumao-Ai/bumao-packs/releases/download/v0.1/basic-repo-0.1.zip) |

`index.json` 是给机器读的目录：包名、版本、依赖契约、下载地址、压缩包 SHA-256。

### basic-repo 0.1

起盘包：任何仓库都用得上的检查——必备文件、目录命名、空目录、许可证一致性、README 引用的文件、临时文件、大文件、疑似密钥。

所有规则都能机判。每条规则配一个必然失败的反例；跑不红就说明这条规则没用。

## 手动安装

今天不提供 `bumao-pack install` 命令，三步手动装：

1. 从 Release 下载 `basic-repo-0.1.zip`，解压到 `<bumao-core>/packs/rules/basic-repo/0.1/`。
2. 把 Bumao Core 的包配置指向这个目录——即放着 `manifest.json` 和 `rules/` 的那一层。
3. 在该目录运行 `node verify.mjs`，14 个反例必须全部报 `RED`；然后对一个真实仓库跑一次 `check`。

## 回验下载

从 Release 下载压缩包和 `SHA256SUMS`，按上面的命令比对哈希；`index.json` 里也记录了同一个摘要。

## License

MIT
