// NousAI wordmark (placeholder brand art): mark + "NousAI" letterforms,
// keeping the stock BrandWordmark's 182x24 viewBox so the sidebar brand
// button keeps its metrics; the area the stock HARNESS badge plate occupied
// stays empty. Letterforms use the page font via SVG text; final brand art
// should ship path letterforms so the wordmark stops depending on the
// viewer's font stack. Ink rides currentColor.

import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * Render the full NousAI brand wordmark.
 * @param props.size - height in px (default 24; width keeps the 182:24 ratio).
 * @param props.className - extra class for layout placement.
 * @returns the wordmark svg (aria-hidden decorative brand art).
 */
export function NousAiWordmark({ size = 24, className }: IconProps) {
  return (
    <svg
      width={(size * 182) / 24}
      height={size}
      className={className}
      viewBox="0 0 182 24"
      fill="none"
      aria-hidden="true"
    >
      <g transform="translate(0 3.48)">
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
      </g>
      <text
        x="29"
        y="17.4"
        fill="currentColor"
        style={{ fontFamily: 'inherit', fontSize: '15.5px', fontWeight: 650, letterSpacing: '0.2px' }}
      >
        NousAI
      </text>
    </svg>
  )
}
