/** The NousAI deployment's welcome-notice step: no notice, complete at once. */

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the ui-settings SlotMap merge (the settings.onboarding entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

/** Coordinator owner props; this step injects nothing of its own. */
export type NousAiWelcomeSkipProps = PropsRuntime<'settings.onboarding'>

/**
 * Complete the welcome step immediately: the NousAI deployment ships no
 * internal-testing notice, so the coordinator moves straight to the next
 * onboarding entry. Renders nothing.
 * @param props - settings-shell owner state.
 * @returns null; the step never shows chrome.
 */
export function NousAiWelcomeSkip(props: NousAiWelcomeSkipProps): ReactNode {
  const { complete } = props
  const finished = useRef(false)
  useEffect(() => {
    if (finished.current) return
    finished.current = true
    complete()
  }, [complete])
  return null
}
