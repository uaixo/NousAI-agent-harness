// NousAI shell build: the stock apps/web build config with three deltas —
// (1) this directory is the root, so the NousAI index.html and public assets
// (favicon, PWA manifest) ship; (2) the ui-primitives platform module resolves
// to the NousAI brand module, so every plugin bundle renders the NousAI marks;
// (3) the kernel boot/failure page's wordmark text is swapped (it is a literal
// in boot-page.ts, deliberately outside every plugin seam — see that file's
// shell self-sufficiency note). Everything else (vendor chunking, platform
// aliases, loader browserization) is the stock config, imported so the two
// builds cannot drift.

import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import type { Plugin, UserConfig } from 'vite'
import base from '../web/vite.config.ts'

const here = (rel: string): string => fileURLToPath(new URL(rel, import.meta.url))

/**
 * Swap the boot/failure page wordmark text served before plugins load. The
 * literal lives in dsh-client-web's boot page, which this build consumes as a
 * built lib product, so the match covers both compiler planes of that one
 * package rather than naming a source file.
 */
function nousaiBootWordmark(): Plugin {
  return {
    name: 'dsh-nousai-boot-wordmark',
    transform(code, id) {
      if (!/packages\/client\/web\/(?:src|lib)\//.test(id)) return undefined
      if (!code.includes('HARNESS')) return undefined
      return code.replaceAll('HARNESS', 'NousAI')
    },
  }
}

const baseConfig = base as UserConfig
const baseAlias = baseConfig.resolve?.alias
if (!Array.isArray(baseAlias)) throw new Error('web-nousai: expected the stock config alias array')

// The stock config's worker-preview surface is anchored on apps/web: its
// rollup input names the stock index.html and preview bootstrap, and its
// dsh-emit-preview-page plugin rewrites apps/web/dist. The NousAI surface
// ships no worker preview, so the input is replaced below and that plugin is
// dropped here (plugin arrays concatenate under mergeConfig, so it must not
// reach the merge).
const basePlugins = (baseConfig.plugins ?? []).filter(
  plugin => !(typeof plugin === 'object' && plugin !== null && 'name' in plugin && plugin.name === 'dsh-emit-preview-page'),
)

const merged: UserConfig = mergeConfig(
  {
    ...baseConfig,
    plugins: basePlugins,
    resolve: {
      // Vite's internal alias plugin runs before every user plugin, so the
      // swap must live in this array; order matters — the NousAI brand module
      // must win over the stock ui-primitives source alias, so it goes first.
      // The brand module itself reaches the real barrel through a relative
      // import, which no bare-name alias rewrites.
      alias: [
        { find: /^@deepseek-ai\/dsh-client-ui-primitives$/, replacement: here('./src/brand/ui-primitives-nousai.ts') },
        ...baseAlias,
      ],
    },
  },
  {
    root: here('.'),
    publicDir: here('./public'),
    plugins: [nousaiBootWordmark()],
    build: {
      outDir: here('./dist'),
      emptyOutDir: true,
    },
  },
)

// mergeConfig deep-merges rollupOptions.input, which would keep the stock
// bootstrap entry alive; the NousAI page is the only entry, so the input is
// replaced after the merge.
merged.build ??= {}
merged.build.rollupOptions ??= {}
merged.build.rollupOptions.input = { index: here('./index.html') }

export default merged
