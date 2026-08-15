/**
 * NousAI branding plugin, browser half: shadows the stock `welcome-notice`
 * onboarding cell (registered by ui-settings-models at the default priority)
 * with a step that completes immediately, so the NousAI deployment shows no
 * DeepSeek-branded internal-testing notice. Cell shadowing, not disposal: the
 * stock entry stays on the ledger and returns if this plugin unloads. Vendor
 * onboarding (the provider API-key step) is deliberately untouched.
 * @module @deepseek-ai/dsh-client-ui-nousai-brand/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the ui-settings SlotMap merge (the settings.onboarding entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { NousAiWelcomeSkip } from './NousAiWelcomeSkip.tsx'

export type { NousAiWelcomeSkipProps } from './NousAiWelcomeSkip.tsx'

/** Required services: the slot registry. */
export const inject = ['slots']

/** The shadowed cell: the stock notice's slot id, at a winning priority. */
const CELL = { name: 'settings.onboarding', id: 'welcome-notice', order: -100, priority: -1 } as const

/**
 * Client plugin body: the welcome-notice shadow.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('settings.onboarding', () => ctx.slots.register({ ...CELL }, NousAiWelcomeSkip))
}
