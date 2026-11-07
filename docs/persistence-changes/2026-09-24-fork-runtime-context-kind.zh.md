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
    previous: "2026-10-27-retry-control-input"
    after: "512e033eaa769259c7c1873a3af681c053b2751d0143712c8d79f89d65c43c24"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-27-retry-control-input"
    after: "6b15b3e09f05964baf457e13b8e6a273364586a41949822c7aeb13267abd78fa"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-27-retry-control-input"
    after: "6b0db8ac215a3fa4ac088dc8e639fd54a234c738d70faebcf49cc6253c8efb56"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-27-retry-control-input"
    after: "046badeb355e6d305e14e74dfbf728fc9704220ff6c1c983a0c3a419f8bb232f"
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
