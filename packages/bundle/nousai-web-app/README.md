# `@deepseek-ai/dsh-nousai-web-app`

English | [中文](README.zh.md)

The NousAI-branded browser-surface bundle: a product rebrand of the web GUI as one installable patch layer, with no fork of any UI plugin. [`cordis.patch.yml`](cordis.patch.yml) rides over [`dsh-web-app`](../web-app/README.md): it disables the stock `web-runtime` row, inserts this package's `nousai-web-runtime` glue and the [`ui-nousai-brand`](../../client/ui-nousai-brand/README.md) browser row, and restates the `system-prompt` row with `includeHarnessIdentity: false` plus a NousAI persona so the model-facing product identity matches the GUI. The glue plugin resolves the NousAI shell dist through `@deepseek-ai/dsh-web-frontend-nousai`'s exports (that shell serves the NousAI page title, favicon, PWA manifest, boot-page wordmark, and the NousAI marks as the `ui-primitives` platform module, which is how ui-sidebar's wordmark and ui-conversation's hero mark rebrand without forking) and mounts the shared `applyWebRuntime` glue from `dsh-web-app` with the NousAI identity: frontend-static dist serving, the NousAI-worded `harness:source` and `app:web-surface` prompt sections, the `DSH_WEB_URL` bash variable, and the `dsh web:` URL line. Vendor branding is deliberately untouched: the DeepSeek LLM provider name, `DEEPSEEK_API_KEY`, endpoints, and model names describe the model vendor, not the product. Install into a profile with `dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app`; the NousAI dist must be built first (`pnpm run build:web:nousai`).

## Model Experience

### Rebranded product identity

#### What the model sees

The fixed "powered by DeepSeek Harness" identity opener is suppressed (`includeHarnessIdentity: false`); the deployment persona names the NousAI Harness instead. When `surfaceContext` is true, the `harness:source` section and the `app:web-surface` section carry the same orientation as the stock bundle with NousAI wording, and `DSH_WEB_URL`'s description names the NousAI Harness Web GUI. Structure, section names, and orders are the stock bundle's.

#### Token effect

Identical shape to the stock web surface: one persona line, one source line, one prompt paragraph, two managed-environment variable lines; constant per process.

#### KV Cache effect

The sections sit near the system prompt's head and are stable for the life of the process, so they do not invalidate the cache across turns. Installing or removing this bundle changes the prompt prefix between processes, as any composition change does.

## Known Limitations and Deferred Work

- **The NousAI frontend dist must be built** — `require.resolve` of `@deepseek-ai/dsh-web-frontend-nousai/dist/index.html` fails loud at activation with the `pnpm run build:web:nousai` hint; there is no source-serving fallback and no fallback to the stock dist.
- **Placeholder brand art** — the NousAI marks in `apps/web-nousai/src/brand/` draw the wordmark letterforms with SVG text in the page font; final brand art should ship path letterforms.
- **No keyless web-snapshot scenario for this composition yet** — the assembled NousAI GUI is verified by unit specs and a manual composed boot; adding an `apps/web` snapshot scenario that layers this bundle is deferred.
