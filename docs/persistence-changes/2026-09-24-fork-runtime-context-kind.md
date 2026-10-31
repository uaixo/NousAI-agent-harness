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
    previous: "2026-10-13-liveshare-share-viewer-principal"
    after: "252867992c9f23e29922b7415875b9fa8fc1188cb486d77636a31412de0c6ef2"
    decision: same-version
  - root: "event:developer/message"
    previous: "2026-10-13-liveshare-share-viewer-principal"
    after: "4b91c512237e2ee1b66dad929bfa39cb8e471b368031bcefd79442444ab628fa"
    decision: same-version
  - root: "event:session/title-llm-request"
    previous: "2026-10-13-liveshare-share-viewer-principal"
    after: "76d261221bb4aebd0b9c49dfb1ac910a9d16f9d49ced4e78216b98da6b208ea0"
    decision: same-version
  - root: "event:user/message"
    previous: "2026-10-13-liveshare-share-viewer-principal"
    after: "9e28c492af63514b2cd771a29cd33a84e9c2e11624b80e2f456e7639765d8508"
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
