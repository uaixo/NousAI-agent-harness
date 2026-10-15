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
## Compatibility

Existing records stay valid. The `runtime-context` kind keeps its declaration and its meaning, and logs recorded under it keep their snapshot suppression because the runtime-context projection matches both kinds. The added kind is attribution-only: a reader without this producer preserves the message and its JSON, and the kind imposes no validation, replay, or authority requirement.

<a id="verification"></a>
## Verification

pnpm run gen-persistence-catalog followed by pnpm run verify-persistence-changes: the four affected roots classify as an attribution-only source kind added, same-version allowed.

<a id="dev-note"></a>
## Dev Note

None.
