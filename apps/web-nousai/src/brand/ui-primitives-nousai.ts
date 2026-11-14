// Brand module swap: this app's vite build serves this module AS
// `@deepseek-ai/dsh-client-ui-primitives`. The shell imports the NousAI marks
// through the explicit re-exports below, which shadow the star re-export's
// FishLogo/BrandWordmark. Every plugin bundle (ui-sidebar's wordmark,
// ui-conversation's hero mark, …) receives the library through the static
// module manifest the shell seed reads from this namespace, so the manifest's
// factory returns the same two overrides without forking any UI plugin.
//
// The built library is imported by relative path, not package name: the bare
// package name is exactly what this build aliases to THIS module, so a
// bare-name import here would resolve to itself. Only the built library
// carries the static module manifest; the source barrel does not.

import * as Primitives from '../../../../packages/client/ui-primitives/lib/index.js'
import { NousAiLogo } from './NousAiLogo.tsx'
import { NousAiWordmark } from './NousAiWordmark.tsx'

export * from '../../../../packages/client/ui-primitives/lib/index.js'
export { NousAiLogo as FishLogo, NousAiWordmark as BrandWordmark }
export type { NousAiWordmarkProps as BrandWordmarkProps } from './NousAiWordmark.tsx'

/** The static module manifest fields the shell seed reads from a `staticLinked` library. */
interface StaticModuleManifest {
  /** Module id the client module system registers. */
  readonly id: string
  /** Builds the module's exports from the client module system's `require`. */
  readonly factory: (require: (specifier: string) => unknown) => object
  /** The module's stylesheet metadata, when it has any. */
  readonly meta?: () => unknown
}

// The export name is `STATIC_MODULE_MANIFEST_EXPORT` in dsh-client-web's platform module.
const stock = Reflect.get(Primitives, '__$dsh_client_module_manifest') as StaticModuleManifest | undefined
if (stock === undefined) {
  throw new Error('web-nousai: @deepseek-ai/dsh-client-ui-primitives must be built with staticLinked before shell assembly')
}

/** The stock manifest with the NousAI marks in place of FishLogo and BrandWordmark. */
export const __$dsh_client_module_manifest: StaticModuleManifest = {
  ...stock,
  factory: require => Object.defineProperties({}, {
    ...Object.getOwnPropertyDescriptors(stock.factory(require)),
    FishLogo: { enumerable: true, value: NousAiLogo },
    BrandWordmark: { enumerable: true, value: NousAiWordmark },
  }),
}
