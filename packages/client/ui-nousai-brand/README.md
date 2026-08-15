# `@deepseek-ai/dsh-client-ui-nousai-brand`

English | [中文](README.zh.md)

NousAI deployment branding for the web GUI's onboarding chain. The browser half shadows the stock `settings.onboarding` cell id `welcome-notice` (registered by [`ui-settings-models`](../ui-settings-models/README.md) at the default priority) with a step that completes immediately at priority −1, so a NousAI deployment shows no DeepSeek-branded internal-testing notice. This is cell shadowing, not disposal: the stock entry stays on the ledger and returns if this plugin unloads or crashes. Vendor onboarding — the provider API-key step — is deliberately untouched, because it names the model vendor, not the product. Mounted by the [`dsh-nousai-web-app`](../../bundle/nousai-web-app/README.md) bundle patch; the node half is an empty roster entry.

## Model Experience

None, as the plugin only replaces one onboarding step in the browser; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- **The notice is suppressed, not rewritten** — a NousAI-authored welcome notice (own copy, own acknowledgement namespace) can replace the skip step later; today the deployment simply has no first-run notice.
