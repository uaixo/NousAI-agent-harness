---
description: "Records a persistence type transition and its compatibility acknowledgement."
kind: persistence-change
---

# 2026-09-24-fork-runtime-context-kind

English | [中文](2026-09-24-fork-runtime-context-kind.zh.md)

## Summary

Adds this fork's `Runtime context` producer kind beside upstream's `runtime-context` on the user and developer source slots.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

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
## Compatibility

Existing records stay valid. The `runtime-context` kind keeps its declaration and its meaning, and logs recorded under it keep their snapshot suppression because the runtime-context projection matches both kinds. The added kind is attribution-only: a reader without this producer preserves the message and its JSON, and the kind imposes no validation, replay, or authority requirement.

<a id="verification"></a>
## Verification

pnpm run gen-persistence-catalog followed by pnpm run verify-persistence-changes: the four affected roots classify as an attribution-only source kind added, same-version allowed.

<a id="dev-note"></a>
## Dev Note

None.
