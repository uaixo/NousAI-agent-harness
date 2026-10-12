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
    previous: "2026-10-05-working-directory-attribution"
    after: "c93716ae33875c9dd62f6790c4f5711fa13d6de6acec4ca7b42b4d8136ad820e"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-05-working-directory-attribution"
    after: "4d239b851816b6499984b9c4e69e272660ecf3f293fa5137a320611f6a2cd2f0"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-07-title-reasoning-effort"
    after: "40924b7b9f986c188a73cffc8651b82b3bd9935731c7d913c4f44b8796949b60"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-05-working-directory-attribution"
    after: "205a6681c04cb8a14f927a3bc03d3695f51f888aa89257479a0348eea760385e"
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
