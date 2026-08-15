// NousAI shell build: the stock apps/web build config with three deltas —
// (1) this directory is the root, so the NousAI index.html and public assets
// (favicon, PWA manifest) ship; (2) the ui-primitives platform module resolves
// to the NousAI brand module, so every plugin bundle renders the NousAI marks;
// (3) the kernel boot/failure page's wordmark text is swapped (it is a literal
// in AppRoot.tsx, deliberately outside every plugin seam — see that file's
// shell self-sufficiency note). Everything else (vendor chunking, platform
// aliases, loader browserization) is the stock config, imported so the two
// builds cannot drift.

import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import type { Plugin, UserConfig } from 'vite'
import base from '../web/vite.config.ts'

const here = (rel: string): string => fileURLToPath(new URL(rel, import.meta.url))

/** Swap the boot/failure page wordmark text served before plugins load. */
function nousaiBootWordmark(): Plugin {
  return {
    name: 'dsh-nousai-boot-wordmark',
    transform(code, id) {
      if (!id.endsWith('packages/client/web/src/AppRoot.tsx')) return undefined
      return code.replaceAll('HARNESS', 'NousAI')
    },
  }
}

const baseConfig = base as UserConfig
const baseAlias = baseConfig.resolve?.alias
if (!Array.isArray(baseAlias)) throw new Error('web-nousai: expected the stock config alias array')

export default mergeConfig(
  {
    ...baseConfig,
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
