import { BrandWordmark, FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

type NousAiBrandMarkProps = HeroBrandMarkOwnerProps & SidebarBrandMarkOwnerProps

/**
 * Render the NousAI mark with the presentation requested by its host surface.
 * The NousAI build serves the NousAI marks as the `ui-primitives` platform
 * module, so these imports resolve to the N mark and NousAI wordmark there.
 * @param props - Host-supplied mark presentation.
 * @returns the NousAI N mark.
 */
export function NousAiBrandMark({ size, className }: NousAiBrandMarkProps) {
  return <FishLogo size={size} className={className} />
}

/**
 * Render the NousAI name artwork without its independently slotted mark.
 * @returns the NousAI name wordmark.
 */
export function NousAiBrandName() {
  return <BrandWordmark includeMark={false} />
}
