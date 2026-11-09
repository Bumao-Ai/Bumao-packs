# Security Policy

Please report vulnerabilities through a private security advisory on the
hosting repository. Do not open a public issue for a security report.

We will confirm receipt in the advisory thread and coordinate a fix before
any public disclosure.

---

# 安全政策（中文）

## 报告安全问题

请**不要**在公开 Issue 中披露漏洞细节。请通过托管仓库的私密安全报告通道提交：

- 打开仓库页面 → **Security** → **Advisories** → **Report a vulnerability**

我们会在该私密线程中确认收到，并在公开披露之前协调修复。

## 范围

- 闸门可被绕过、伪造或静默跳过（例如篡改判定结果、伪造 ALL PASS）。
- 防缩水机制失效（注释掉 `register()` 或改动 `set_expected()` 后仍能通过）。
- 规则装载、索引、审计中的路径穿越或任意文件读写。
- 控制台接口的未授权访问、命令注入、目录遍历。
- 仓库中意外包含真实路径、用户名、主机名、凭据或个人信息。
