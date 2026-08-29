---
description: "NousAI deployment branding for the web GUI: fills the browser brand slots with the NousAI marks and suppresses the DeepSeek-branded internal-testing welcome notice."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-nousai-brand

English | [中文](README.zh.md)

## Summary

A NousAI deployment gets its browser branding from this plugin: the NousAI marks in the sidebar and conversation-hero brand slots, and no DeepSeek-branded internal-testing notice on first run. It fills `sidebar.brand.mark`, `sidebar.brand.name`, and `conversation.hero.brand.mark` — slots the stock UI leaves empty outside the official build — and shadows the stock `settings.onboarding` welcome step with one that completes immediately. Suppression is reversible cell shadowing, not disposal: the stock entry stays on the ledger and returns if this plugin unloads or crashes. Vendor onboarding — the provider API-key step — is deliberately untouched, because it names the model vendor, not the product.

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

The common path is the [`dsh-nousai-web-app`](../../bundle/nousai-web-app/README.md) bundle patch, which inserts this package's browser row for you.

### When to choose it

Mount it whenever the composition serves the NousAI frontend build: that build aliases `ui-primitives` to the NousAI brand module, and this plugin is what places those marks into the brand slots and clears the DeepSeek first-run notice. Skip it in stock compositions — the DeepSeek branding there is intentional, and these occupants would brand the GUI as NousAI.

### Minimal configuration

The package takes no configuration. It mounts as a plain browser roster row (the node half is an empty roster entry):

```yaml
- id: ui-nousai-brand
  name: '@deepseek-ai/dsh-client-ui-nousai-brand'
```

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The browser half registers three brand-slot occupants — `sidebar.brand.mark`, `sidebar.brand.name`, and `conversation.hero.brand.mark` — rendering the NousAI marks imported from `ui-primitives`, which the NousAI build serves as the NousAI brand module, so the slot occupants and every direct consumer stay one artwork. It also shadows the stock `settings.onboarding` cell id `welcome-notice` (registered by [`ui-settings-models`](../ui-settings-models/README.md) at the default priority) with a step at priority −1 that completes immediately and renders nothing. All registrations dispose with the fiber.

### Source map

| File | Role |
|---|---|
| [`src/client/index.ts`](src/client/index.ts) | Browser entry: brand-slot occupants and the onboarding shadow |
| [`src/client/Brand.tsx`](src/client/Brand.tsx) | The mark and wordmark occupants over the `ui-primitives` brand module |
| [`src/client/NousAiWelcomeSkip.tsx`](src/client/NousAiWelcomeSkip.tsx) | The immediately-completing onboarding step |
| [`src/index.ts`](src/index.ts) | Node half: empty roster entry |
| [`src/invariant.ts`](src/invariant.ts) | Invariant companion: no runtime invariant; every contribution is registry-disposed |
| [`tests/browser-plugin.client.spec.tsx`](tests/browser-plugin.client.spec.tsx) | Slot filling, cell shadowing, and disposal behavior |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages for the bundle that mounts this row and the slot machinery it rides on.

- [dsh-nousai-web-app](../../bundle/nousai-web-app/README.md) — the bundle patch that inserts this row.
- [ui-settings-models](../ui-settings-models/README.md) — owner of the shadowed welcome notice.
- [ui-sidebar](../ui-sidebar/README.md) — renders the sidebar brand slots this plugin fills.
- [ui-conversation](../ui-conversation/README.md) — renders the hero brand slot this plugin fills.

-----

<a id="model-experience"></a>
## Model Experience

None, as the plugin only fills browser brand slots and replaces one onboarding step in the browser; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **The notice is suppressed, not rewritten** — a NousAI-authored welcome notice (own copy, own acknowledgement namespace) can replace the skip step later; today the deployment simply has no first-run notice.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
