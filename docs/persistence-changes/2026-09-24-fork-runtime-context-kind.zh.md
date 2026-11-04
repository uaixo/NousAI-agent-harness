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
    previous: "2026-10-27-subagent-settlement-attribution"
    after: "df8f90d5e51683acccbe7c7960e9bae7697c2f8ea8b2dbe920b9b3b5af09fd41"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-27-subagent-settlement-attribution"
    after: "8a5ea04e33ce64f8734ef5a4ed94cdfc772941bf919aa4af913f15f340f9365b"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-27-subagent-settlement-attribution"
    after: "e24f3d5e4a0f8e81020dc5ad5d9f83beaa11ca9648d1e65f55b396ee2f7f1cda"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-27-subagent-settlement-attribution"
    after: "d546670538d944660b3081ad37135ed056d2da177806f8e4b98cec86485a5578"
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
