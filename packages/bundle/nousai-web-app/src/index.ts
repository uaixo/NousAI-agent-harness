/**
 * @deepseek-ai/dsh-nousai-web-app — the NousAI-branded browser-surface bundle:
 * the NousAI patch layer over dsh-web-app plus the runtime glue plugin that
 * replaces the stock `web-runtime` row. The plugin resolves the NousAI shell
 * dist (workspace knowledge of this bundle, never user config) and mounts the
 * shared Web runtime glue with the NousAI identity: dist serving over the
 * frontend-static fallback seat, the `webApp` service, the NousAI-worded
 * bash-visible web runtime variable, and the URL line. The seat and readiness
 * mechanics live in `@deepseek-ai/dsh-web-app`'s `applyWebRuntime` so the two
 * runtimes cannot drift; the NousAI-worded model context comes from the
 * patch's restated `harness-dev-context` row.
 * @module @deepseek-ai/dsh-nousai-web-app
 */

import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { applyWebRuntime, parsePublicUrl } from '@deepseek-ai/dsh-web-app'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-shell-env'

/** Stable Cordis plugin name. */
export const name = 'nousai-web-app'

// The config catalog requires each plugin to own its Config declaration, so
// the stock web glue's fields are restated verbatim.
/* jscpd:ignore-start */
/** Plugin config: the stock web glue's deployment fields, owned per-plugin for the config catalog. */
export interface Config {
  /** Permit default-browser handoff after the Loader tree settles; an SSH launch suppresses it. */
  openBrowser: boolean
  /** Print the URL line on activation; a non-interactive layer can turn it off. */
  printUrl: boolean
  /**
   * Register the `DSH_WEB_URL` bash variable naming this GUI. A one-shot
   * non-interactive layer can turn it off when its user is not in the GUI.
   */
  surfaceContext: boolean
  /**
   * Canonical HTTP(S) root to advertise in the printed and opened URL,
   * `DSH_WEB_URL`, and `webApp.getAdvertisedUrl()`, which supplies the Web GUI
   * URL in agent runtime context, e.g. `https://app.example/ui/`, normalized to end in `/`. Configures no routing
   * or authentication; see the stock bundle's
   * [public deployments](../../web-app/README.md#public-deployments).
   * Absent or YAML `null` advertises the bind-address URL.
   */
  publicUrl?: string
}

export const Config: z<Config> = z.object({
  openBrowser: z.boolean().default(true),
  printUrl: z.boolean().default(true),
  surfaceContext: z.boolean().default(true),
  publicUrl: z.transform(z.string(), value => parsePublicUrl(value).href),
})
/* jscpd:ignore-end */

/** Services required before the web runtime can mount. */
export const inject = ['webServer']

/**
 * Dist location is workspace knowledge of this bundle: anchored on the
 * NousAI frontend package manifest, not configured. Existence is a
 * request-time concern — the fallback owner reads files per request, so a
 * composition boots before `pnpm run build:web:nousai` has produced a dist.
 */
function resolveDistIndex(): string {
  const require = createRequire(import.meta.url)
  try {
    return join(dirname(require.resolve('@deepseek-ai/dsh-web-frontend-nousai/package.json')), 'dist', 'index.html')
  } catch {
    /* v8 ignore next 2 -- reachable only when the NousAI frontend package is absent from the checkout */
    throw new Error('nousai-web-app: @deepseek-ai/dsh-web-frontend-nousai is not resolvable from this composition')
  }
}

/** Test hook: hosts with no built frontend dist substitute the resolver; production never touches this. */
export const internals: { resolveDistIndex: () => string } = { resolveDistIndex }

/**
 * Mount the NousAI Web runtime: the shared glue with the NousAI identity.
 * @param ctx - plugin context carrying the webServer service.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  applyWebRuntime(ctx, config, {
    pluginName: name,
    distIndex: () => internals.resolveDistIndex(),
    webUrlDescription: 'Advertised URL of the NousAI Harness Web GUI serving this session.',
  })
}
