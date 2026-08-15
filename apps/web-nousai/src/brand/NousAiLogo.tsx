// NousAI mark (placeholder brand art): a "neural N" — four nodes joined by the
// N-stroke, top-right node left hollow. Keeps the stock FishLogo viewBox
// (23.16x17.04) so every render site keeps its metrics. Ink rides currentColor.
// Swap the geometry here when final NousAI brand art exists.

import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * Render the NousAI mark.
 * @param props.size - width in px (default 24; height keeps the 23.16:17.04 ratio).
 * @param props.className - extra class for layout placement.
 * @returns the mark svg (aria-hidden; pair with the wordmark for accessibility).
 */
export function NousAiLogo({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={(size * 17.04) / 23.16}
      className={className}
      viewBox="0 0 23.16 17.04"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.1 13.94V3.1L20.06 13.94V3.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3.1" cy="13.94" r="1.9" fill="currentColor" />
      <circle cx="3.1" cy="3.1" r="1.9" fill="currentColor" />
      <circle cx="20.06" cy="13.94" r="1.9" fill="currentColor" />
      <circle cx="20.06" cy="3.1" r="1.55" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
