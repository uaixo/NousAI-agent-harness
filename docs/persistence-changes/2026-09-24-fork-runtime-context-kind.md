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
    previous: "2026-10-22-action-card-status"
    after: "949ec950241f39efd610be97ef62077e3e5402e0b394286bfa881867b2513c97"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-22-action-card-status"
    after: "3707261f2e498fe335f9f5859b3752f33386783d08a62cb1ffa67bdbde5612d8"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-22-action-card-status"
    after: "5aefe008192931e2bdc8ee7c4b99005ab8bcd5474da3ff4d9f6aa242230a0048"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-22-action-card-status"
    after: "934ef25a62bc219ef59d1772a5be612c3652713b1c659ccd0eecb77e45f362e4"
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
