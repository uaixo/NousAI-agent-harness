---
description: "The NousAI-branded browser GUI: one installable patch layer that rebrands the dsh web surface and its model-facing product identity, for users composing a NousAI profile."
kind: "package-bundle"
---

# @deepseek-ai/dsh-nousai-web-app

English | [中文](README.zh.md)

## Summary

A web profile gains the NousAI product identity from this layer: the NousAI shell dist with the page title, favicon, PWA manifest, boot-page wordmark, and the NousAI brand marks, plus a model-facing persona that names the NousAI Harness — with no fork of any UI plugin. No shipped profile includes it; one `dsh plugin` command adds it over the stock `web` profile, and the same command removes it to return to the DeepSeek branding. The NousAI dist comes from `pnpm run build:web:nousai`; a composition boots without it, and the GUI serves request-time 404s until the dist exists. Vendor branding is deliberately untouched: the DeepSeek LLM provider name, `DEEPSEEK_API_KEY`, endpoints, and model names describe the model vendor, not the product.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

```text
dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app
dsh plugin --profile web remove @deepseek-ai/dsh-nousai-web-app
```

The reconcile step activates this package's [`cordis.patch.yml`](cordis.patch.yml) as a layer over the `dsh-base` and `dsh-web-app` layers; a package without that patch declaration would install as a plain plugin row instead. Dist existence is a request-time concern: the composition boots before `pnpm run build:web:nousai` has produced the dist, and the page 404s until that build runs in the checkout.

### What you get

The GUI serves the NousAI shell: page chrome, boot-page wordmark, and the sidebar and hero brand marks (the inserted [`ui-nousai-brand`](../../client/ui-nousai-brand/README.md) row fills the browser brand slots), with the DeepSeek-branded internal-testing notice shadowed out of onboarding. The model sees the NousAI persona and NousAI-worded surface context instead of the stock identity. The runtime glue restates the stock web glue's four config fields (`openBrowser`, `printUrl`, `surfaceContext`, `trustedHosts`); the generated [configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-nousai-web-app) is the exhaustive source for every accepted field.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The patch disables the stock `web-runtime` row (the frontend-static fallback seat is single-owner, so disable-then-insert rather than shadowing) and the `ui-brand-official` row (its official-build occupants would race this layer's NousAI occupants for the single-kind brand slots), inserts this package's `nousai-web-runtime` glue and the `ui-nousai-brand` browser row, and restates the `system-prompt` row with `includeHarnessIdentity: false` plus the NousAI persona. The glue plugin resolves the NousAI shell dist anchored on the `@deepseek-ai/dsh-web-frontend-nousai` package manifest — workspace knowledge of this bundle, never user config — and mounts the shared `applyWebRuntime` glue from [`dsh-web-app`](../web-app/README.md) with the NousAI identity: dist serving, the NousAI-worded `harness:source` and `app:web-surface` prompt sections, the `DSH_WEB_URL` bash variable, the URL line, and the default-browser handoff. The seat and readiness mechanics live in the shared glue so the two runtimes cannot drift.

### Source map

| File | Role |
|---|---|
| [`cordis.patch.yml`](cordis.patch.yml) | The patch: disabled stock runtime and official-brand rows, restated NousAI persona, inserted runtime and brand rows |
| [`src/index.ts`](src/index.ts) | The `nousai-web-runtime` glue plugin: dist resolution and the NousAI `applyWebRuntime` identity |
| [`src/invariant.ts`](src/invariant.ts) | Invariant companion: no runtime invariant; every contribution is registry-disposed |
| [`tests/nousai-web-app.spec.ts`](tests/nousai-web-app.spec.ts) | Dist resolution, prompt sections, URL-line readiness, roster identity |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages for the stock runtime this layer rides on and the branding pieces it mounts.

- [Bundle package map](../README.md) — the surfaces built on the same core.
- [dsh-web-app](../web-app/README.md) — the stock web surface and the shared runtime glue.
- [ui-nousai-brand](../../client/ui-nousai-brand/README.md) — the browser brand row this patch inserts.
- [frontend-static](../../host/frontend-static/README.md) — how the built frontend is served.
- [Generated configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-nousai-web-app) — every accepted config field and its source declaration.

-----

<a id="model-experience"></a>
## Model Experience

### Rebranded product identity

#### What the model sees

The fixed "powered by DeepSeek Harness" identity opener is suppressed (`includeHarnessIdentity: false`); the deployment persona names the NousAI Harness instead. When `surfaceContext` is true, the `harness:source` section and the `app:web-surface` section carry the same orientation as the stock bundle with NousAI wording, and `DSH_WEB_URL`'s description names the NousAI Harness Web GUI. Structure, section names, and orders are the stock bundle's.

#### Token effect

Identical shape to the stock web surface: one persona line, one source line, one prompt paragraph, two managed-environment variable lines; constant per process.

#### KV Cache effect

The sections sit near the system prompt's head and are stable for the life of the process, so they do not invalidate the cache across turns. Installing or removing this bundle changes the prompt prefix between processes, as any composition change does.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

These are current constraints of the rebrand layer, not a task backlog.

- **An unbuilt NousAI dist is a request-time 404, not a boot failure** — the resolver anchors on the `@deepseek-ai/dsh-web-frontend-nousai` manifest without checking the dist, so the composition boots and the page 404s until `pnpm run build:web:nousai` runs; there is no source-serving fallback and no fallback to the stock dist.
- **Placeholder brand art** — the NousAI marks in `apps/web-nousai/src/brand/` draw the wordmark letterforms with SVG text in the page font; final brand art should ship path letterforms.
- **No keyless web-snapshot scenario for this composition yet** — the assembled NousAI GUI is verified by unit specs and a manual composed boot; adding an `apps/web` snapshot scenario that layers this bundle is deferred.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
