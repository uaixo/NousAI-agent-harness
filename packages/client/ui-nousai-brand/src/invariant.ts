/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-nousai-brand`.
 * @module @deepseek-ai/dsh-client-ui-nousai-brand/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-nousai-brand'

/** Cordis companion plugin name. */
export const name = 'client-ui-nousai-brand-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the plugin owns a single slot registration released by
 * its effect disposer, and the browser-plugin spec proves the registration is
 * withdrawn with the owning fiber; there is no mutable state of its own to
 * audit at runtime.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
