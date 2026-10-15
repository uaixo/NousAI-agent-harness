---
description: "记录持久化类型更改及其兼容性确认。"
kind: persistence-change
---

# 2026-09-24-fork-runtime-context-kind

[English](2026-09-24-fork-runtime-context-kind.md) | 中文

## 概述

在 user 与 developer 的 source 槽位上，于上游的 `runtime-context` 之外新增本分支的 `Runtime context` 生产者 kind。

## 目录

- [声明](#declaration)
- [兼容性](#compatibility)
- [验证](#verification)
- [开发备注](#dev-note)

<a id="declaration"></a>
## 声明

```yaml persistence-change
schemaVersion: 1
id: 2026-09-24-fork-runtime-context-kind
baseline: false
changes:
  - root: "event:agent/inbox/spliced"
    previous: "2026-10-13-user-rpc-principal"
    after: "3eefa836dc6c2a7b27338dcf76117966eb9de1063f3afc6bdcef1094877491c2"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-13-user-rpc-principal"
    after: "f8a6d043e51d5d4f8450147792c96b74feff9b4dabd70022d7bbf4229a2caa52"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-13-user-rpc-principal"
    after: "49fe49435af64391bdbcc72d330d07c42936dbd1076206bda28b25c38e6ba954"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-13-user-rpc-principal"
    after: "d8af7e56560b153f7eb5ebced227af6908b95e4826eea32eb4264ee0eac98d94"
    decision: same-version
```

<a id="compatibility"></a>
## 兼容性

已有记录仍然有效。`runtime-context` kind 保留其声明与语义，以该 kind 记录的日志仍保持快照去重，因为 runtime-context 投影同时匹配两个 kind。新增的 kind 仅用于标注：没有该生产者的读取器仍保留消息及其 JSON，且该 kind 不引入校验、回放或权限要求。

<a id="verification"></a>
## 验证

先运行 pnpm run gen-persistence-catalog，再运行 pnpm run verify-persistence-changes：四个受影响的根均归类为仅标注的 source kind 新增，允许同版本。

<a id="dev-note"></a>
## 开发备注

无。
