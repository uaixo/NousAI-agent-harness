/**
 * @deepseek-ai/dsh-nousai-web-app — the NousAI-branded browser-surface bundle:
 * the NousAI patch layer over dsh-web-app plus the runtime glue plugin that
 * replaces the stock `web-runtime` row. The plugin resolves the NousAI shell
 * dist (workspace knowledge of this bundle, never user config) and mounts the
 * shared Web runtime glue with the NousAI identity: dist serving over the
 * frontend-static fallback seat, the NousAI-worded harness-source and
 * web-surface prompt sections, the bash-visible web runtime variable, and the
 * URL line. The seat and readiness mechanics live in
 * `@deepseek-ai/dsh-web-app`'s `applyWebRuntime` so the two runtimes cannot
 * drift.
 * @module @deepseek-ai/dsh-nousai-web-app
 */

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { HARNESS_SOURCE_SECTION } from '@deepseek-ai/dsh-app-boot'
import { applyWebRuntime } from '@deepseek-ai/dsh-web-app'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-system-prompt'
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
   * Register the model-visible surface context (the `app:web-surface` prompt
   * section and the `DSH_WEB_URL` bash variable). A one-shot non-interactive
   * layer can turn it off when its user is not in the GUI, so the
   * orientation text would be false.
   */
  surfaceContext: boolean
  /** Explicit `--trusted-host` authorities from this invocation. */
  trustedHosts: string[]
}

export const Config: z<Config> = z.object({
  openBrowser: z.boolean().default(true),
  printUrl: z.boolean().default(true),
  surfaceContext: z.boolean().default(true),
  trustedHosts: z.array(String).default([]),
})
/* jscpd:ignore-end */

/** This dsh installation's root, from either this package's source or built entry. */
const SOURCE_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))

/** Services required before the web runtime can mount. */
export const inject = ['webServer']

/** Model-visible orientation and acceptance boundary for sessions created through `dsh web`. */
function webSurfacePrompt(webUrl: string): string {
  const updateContract = 'The client-plugin HMR receiver is active, but client-plugin changes reload without a refresh only while '
    + '`pnpm run dev:web` is also running from this same checkout to rebuild their bundles; verify that watcher before promising automatic updates. '
    + 'Every other change — the apps/web-nousai shell and plain packages — requires rebuilding the affected Web artifacts and verifying this existing URL after a page refresh. '
  return `You are interacting with the user through the NousAI Harness Web GUI at ${webUrl}. `
    + 'When the user refers to "this page", "this GUI", or "this app" without naming another target, they mean this GUI. '
    + 'The browser provides no implicit DOM, route, or screenshot context. '
    + updateContract
    + 'Starting another server does not update this GUI. '
    + 'The apps/web-nousai Vite entry builds the shell but is not a standalone application because only dsh web injects window.__DSH_BOOT__. '
    + 'Do not start a replacement server unless the user asks; if one is needed, use a managed background job and verify its exact URL.'
}

/** Register the NousAI-worded harness-source section (stock name and order, rebranded text). */
function addNousAiSourceSection(promptCtx: Context): void {
  promptCtx.systemPrompt.section({
    name: HARNESS_SOURCE_SECTION,
    order: -99,
    text: `The NousAI Harness implementation checkout is at ${SOURCE_ROOT}. The checkout location and current working directory are separate values and may differ; never infer the working directory from this path. Use pwd to determine the current working directory. Use this checkout only to inspect or extend the harness itself.`,
  })
}

/** Dist location is workspace knowledge of this bundle: resolved through the NousAI frontend package exports, not configured. */
function resolveDistIndex(): string {
  const require = createRequire(import.meta.url)
  try {
    return require.resolve('@deepseek-ai/dsh-web-frontend-nousai/dist/index.html')
  } catch {
    /* v8 ignore next 2 -- reachable only on a checkout without a built NousAI dist; the test tree stages one */
    throw new Error('nousai-web-app: NousAI frontend dist not built; run pnpm run build:web:nousai from the repository root first')
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
    harnessSource: addNousAiSourceSection,
    surfacePrompt: webSurfacePrompt,
    webUrlDescription: 'Canonical local URL of the NousAI Harness Web GUI serving this session.',
  })
}
