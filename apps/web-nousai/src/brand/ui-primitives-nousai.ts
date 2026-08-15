// Brand module swap: this app's vite build serves this module AS
// `@deepseek-ai/dsh-client-ui-primitives` in the frozen platform module table,
// so every plugin bundle (ui-sidebar's wordmark, ui-conversation's hero mark,
// …) resolves the NousAI marks without forking any UI plugin. The explicit
// re-exports shadow the star re-export's FishLogo/BrandWordmark.
//
// The real barrel is imported by relative path, not package name: the bare
// package name is exactly what this build aliases to THIS module, so a
// bare-name import here would resolve to itself.

export * from '../../../../packages/client/ui-primitives/src/index.ts'
export { NousAiLogo as FishLogo } from './NousAiLogo.tsx'
export { NousAiWordmark as BrandWordmark } from './NousAiWordmark.tsx'
