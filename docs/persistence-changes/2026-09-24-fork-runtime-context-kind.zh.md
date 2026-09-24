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
    previous: "2026-09-16-session-format-v4"
    after: "68daa65c3752144c69709a07972079ecefcff6fcb7dd645ccc4fffcbadcc34f6"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-09-16-session-format-v4"
    after: "d4b9ee5ba65bb5c8e1f0371c16de0db2ade08dcdc3cd9640a199759b1120c38d"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-09-16-session-format-v4"
    after: "d0697cb0449a89b8d4514eb9b6334e4c0fdc2f2c783065303fbf7a7e33ac8a57"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-09-16-session-format-v4"
    after: "411b3d054360aa1ab28d03a6cbe943c7c33888325147632eb4284eafe425541b"
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
