# Agent Note: The runtime-context snapshot names itself for readers

Status: implemented

English | [中文](2026-08-15-runtime-context-producer-name.zh.md)

## Problem

Every session opens with a runtime-context snapshot — the file policy, the approval policy, the subagent delegation scope — and the Web transcript renders one collapsed `Context injection` row for it. That row named its producer `@deepseek-ai/dsh-system-prompt`, so the first thing a reader saw in every conversation was an npm package id.

The id was wrong on its own terms. No plugin of that name emits the snapshot: `RuntimeContextProjection` in `dsh-agent-loop` does, and the recorded name was never read as a module specifier by anything. It was already a label, and it was the only one in the product shaped like a package while every sibling producer recorded a short subsystem name — `compact`, `cordis-host-runner`, `tool-jobs`, `time-context`. A deployment that is not DeepSeek-branded also had a vendor scope printed in its transcript on every turn.

## Decision

`RuntimeContextProjection` records `Runtime context` as its producer name, so the transcript row reads `Context injection · Runtime context`.

The name is one constant in [`runtime-context.ts`](../../../../packages/core/agent-loop/src/runtime-context.ts) serving two roles at once: the human-facing producer name the client renders verbatim, and this projection's durable identity, which `isOwned` matches to find the snapshot it must supersede. Both roles move together by construction — there is one string — and every recorded fixture carrying the old value moves with it.

This is the remedy the [context-source marks decision](2026-08-04-web-context-source-and-steer-marks.md) named for exactly this row: a producer that wants a better label records one in its source fields. It stays a producer-side change on purpose. The client resolves producer names from the durable log alone and keeps no table of plugin ids, so a rename must never need a client release, and a resumed or foreign log must project the same way as a live one.

`Runtime context` is a display phrase where its siblings are kebab-case identifiers. That asymmetry is the point: the sibling values name plugins that exist, while this one names a subsystem that has no plugin to be named after, and its only consumer is a reader.

## Alternatives considered

**Map the id to a display name in the client.** A `plugin === '@deepseek-ai/dsh-system-prompt' → 'Runtime context'` case in `contextProvenance` is the smallest possible diff and touches no fixture. It is also the one option the context-source decision rules out by name: the client keeps no table of producer ids, because such a table drifts on every rename, needs a client release per producer, and cannot name a producer from a log this build has never seen.

**Add a separate human-label field to the `plugin` source.** Keeping the id durable and rendering a new optional `label` beside it preserves the field's "plugin id" reading. It widens the durable `MessageSourceMap` vocabulary for one producer, and it does not avoid the fixture churn it would be chosen to avoid: recorded logs written before the field exists carry no label, so every golden still re-renders the npm id. More durable surface, same edit, worse ratio.

**Record the real emitter, `@deepseek-ai/dsh-agent-loop`.** This makes the field honest as an id and is a one-line change. It leaves the transcript showing an npm package to every reader, which is the complaint, and it names an implementation package rather than the thing the snapshot is about.

**Drop the producer name from context rows.** Rendering the role alone removes the npm id without renaming anything. It also removes `AGENTS.md`, `skill-catalog`, and `goal` from their rows, since the client cannot special-case one producer — it would pay for one row's noise with every other row's attribution.

**Hide the runtime-context row from Chat.** The snapshot stays in the Trajectory tab and the durable log, so nothing model-visible is lost and the row stops recurring. It hides a real model-visible input from the surface where readers follow the conversation, which is a larger product decision than naming the row, and it is still available later if the row proves to be noise rather than context.

## Testing

- `packages/core/agent-loop` unit coverage pins the recorded source on a fresh snapshot and the `isOwned` replay path that restores, supersedes, and clears a retained one.
- `packages/client/ui-conversation` jsdom coverage pins the rendered accessible name of the row.
- The keyless assembled-Web goldens and the ACP, headless, JSON-RPC, and Python-SDK session logs carry the new producer name, so the assembled transcripts prove it rather than component tests alone.

## Consequences

- No producer in the product records an `@scope/package` name any more; the package-shaped names that remain are the plain `dsh-`-prefixed ones (`dsh-compaction-basic`, `dsh-session-title-llm`).
- The name is durable data, so a session log written before this change keeps the old value. `isOwned` does not match it: the projection treats such a session as having no retained snapshot and appends a current one on the next turn, and the superseded row keeps rendering its old name. This is the pre-release stance on on-disk formats, not a migration.
- The recorded producer name is now a reader-facing string. Changing it again is a transcript-visible edit, and it moves every recorded fixture with it.
