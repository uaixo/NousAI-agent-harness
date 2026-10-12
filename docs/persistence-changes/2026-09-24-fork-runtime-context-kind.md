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
## Compatibility

Existing records stay valid. The `runtime-context` kind keeps its declaration and its meaning, and logs recorded under it keep their snapshot suppression because the runtime-context projection matches both kinds. The added kind is attribution-only: a reader without this producer preserves the message and its JSON, and the kind imposes no validation, replay, or authority requirement.

<a id="verification"></a>
## Verification

pnpm run gen-persistence-catalog followed by pnpm run verify-persistence-changes: the four affected roots classify as an attribution-only source kind added, same-version allowed.

<a id="dev-note"></a>
## Dev Note

None.
