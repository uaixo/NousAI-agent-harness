# Agent Note: NousAI rebrand as an installable bundle

Status: implemented

English | [中文](2026-08-15-nousai-rebrand-bundle.zh.md)

## Problem

A deployment wants the web GUI to carry NousAI product branding — logo, wordmark, page identity, first-run copy, and the model-facing product name — while the DeepSeek model vendor (provider name, `DEEPSEEK_API_KEY`, endpoints, model names) stays exactly what it is. The brand marks are hard ES imports inside `ui-sidebar` and `ui-conversation`, the page identity (title, favicon, PWA manifest, boot-page wordmark) ships inside the served `apps/web` dist before any plugin activates, and the testing notice is a default-priority slot registration — none of which a single runtime plugin can reach completely.

## Decision

The rebrand is one installable patch-layer bundle, `@deepseek-ai/dsh-nousai-web-app`, over three seams:

- **Shell swap.** `apps/web-nousai` (`@deepseek-ai/dsh-web-frontend-nousai`) rebuilds the stock shell with the NousAI page identity and — the load-bearing move — serves the NousAI marks as the `@deepseek-ai/dsh-client-ui-primitives` platform module via a build-time alias, so every plugin bundle (ui-sidebar wordmark, ui-conversation hero mark) rebrands with zero UI-plugin forks. The kernel boot page's `HARNESS` literal is swapped by a build transform because it is deliberately outside every plugin seam (shell self-sufficiency). The bundle's glue disables the stock `web-runtime` row and mounts `applyWebRuntime` — extracted into `dsh-web-app` as a shared, identity-parametrized helper — with the NousAI dist and wording.
- **Onboarding shadow.** `@deepseek-ai/dsh-client-ui-nousai-brand` shadows the `settings.onboarding` cell id `welcome-notice` at priority −1 with an immediately-completing step: the deployment ships no DeepSeek-branded testing notice, and the stock entry returns if the plugin unloads.
- **Model-facing identity.** The patch restates the `system-prompt` row with `includeHarnessIdentity: false` and a NousAI persona, and the glue registers NousAI-worded `harness:source` / `app:web-surface` sections and `DSH_WEB_URL` description.

Product-vs-vendor is the scope rule: strings naming the model vendor's API are not product branding and are untouched.

## Alternatives considered

**In-place rebrand of the stock packages.** The pre-release stance permits renaming freely, and editing `FishLogo`/`BrandWordmark`/`index.html` directly is less total code. It loses the requirement this feature exists for: stock DeepSeek branding and the NousAI skin coexisting as a composition choice per profile, with upstream untouched.

**Runtime slot shadowing of `sidebar`/`conversation`.** Priority-shadowing whole regions needs no dist fork, but a shadowing entry cannot redeclare the shipped entry's child slots while it lives, so `sidebar.workspaces`/`sidebar.settings`/footer contributions are forfeited; the served title, favicon, manifest, and boot page stay DeepSeek-branded regardless. Kept only as the mechanism for the onboarding cell, where the shadowed entry has no children.

**Forking ui-sidebar and ui-conversation into branded packages.** Disable-and-insert with child redeclaration re-attaches cross-plugin contributions, so it composes correctly — but it copies two large components to change two SVG references, and the hero mark would still need the conversation fork. The platform-module swap rebrands both from one seam.

**Theme tokens.** `ctx.theme.overrideTokens` recolors but cannot change SVG geometry, page identity, or copy; insufficient alone.

## Consequences

- `dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app` rebrands a profile completely; removing the bundle restores stock branding. Both shells build from the same vite config (`apps/web-nousai` imports `apps/web`'s), so shell changes cannot drift between brands.
- The shared `applyWebRuntime` in `dsh-web-app` is now the single owner of the web-runtime seat/readiness mechanics; a third brand is one identity object plus a dist.
- The NousAI dist is a second frontend build (`pnpm run build:web:nousai`), deliberately not chained into `pnpm run build`: opt-ins stay out of shipped defaults, at the cost of a fail-loud activation hint when unbuilt.
- The marks are placeholder art (SVG-text letterforms); real NousAI assets drop into `apps/web-nousai/src/brand/` without touching anything else.

## Testing

Unit specs cover both bundles' glue (branch-complete, per-file 100%) and the onboarding shadow's win/yield-back lifecycle. The assembled composition was verified by installing the bundle into a web profile (manifest dependency + `dsh.profile.bundles` layer) and booting keylessly: NousAI title, marks, and rail render; the testing notice is gone; the vendor API-key dialog is unchanged. A keyless `apps/web` snapshot scenario layering this bundle is deferred (named in the bundle README's Known Limitations).
