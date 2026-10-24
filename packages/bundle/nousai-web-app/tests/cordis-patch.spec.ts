/** The NousAI bundle's declared profile patch, rendered through the system-prompt row it restates. */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import SystemPrompt, { renderPrompt, type Config as SystemPromptConfig } from '@deepseek-ai/dsh-system-prompt'

describe('nousai-web-app bundle patch', () => {
  it('renders the NousAI persona from the prompt variables agent-loop registers', async () => {
    const patches = yaml.load(
      readFileSync(fileURLToPath(new URL('../cordis.patch.yml', import.meta.url)), 'utf8'),
      { schema: entryListSchema },
    ) as Array<{ id?: string; config?: SystemPromptConfig }>
    const row = patches.find(patch => patch.id === 'system-prompt')
    const ctx = new Context()
    try {
      await ctx.plugin(SystemPrompt, row?.config)
      // The full variable set agent-loop registers for a model request.
      ctx.systemPrompt.variable('provider', () => 'deepseek')
      ctx.systemPrompt.variable('model', () => 'deepseek-v4-pro')
      expect(renderPrompt(await ctx.systemPrompt.assemble()))
        .toBe('You are a coding agent of the NousAI Harness, powered by the deepseek-v4-pro model.')
    } finally {
      await ctx.fiber.dispose()
    }
  })
})
