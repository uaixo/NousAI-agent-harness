// @vitest-environment jsdom
/**
 * ui-nousai-brand browser half on a real cordis Context with the real slot
 * registry: the plugin shadows the stock `welcome-notice` onboarding cell at a
 * winning priority, the shadowed occupant survives on the ledger and returns
 * when the plugin fiber is disposed (HMR safety), and the step component
 * completes the coordinator step exactly once without rendering chrome. The
 * node half and the invariant companion are exercised over the same Context.
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { NousAiWelcomeSkip } from '../src/client/NousAiWelcomeSkip.tsx'
import { apply, inject } from '../src/client/index.ts'
import { apply as nodeApply } from '../src/index.ts'
import * as invariant from '../src/invariant.ts'

afterEach(cleanup)

/** A stand-in for the stock ui-settings-models notice at the default priority. */
function StockNotice(): null {
  return null
}

/** Boot the real slot registry with the onboarding slot declared. */
async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: { 'settings.onboarding': { kind: 'list', scope: 'root' } },
  } as never, (() => null) as never)
  ctx.slots.register({
    name: 'settings.onboarding',
    id: 'welcome-notice',
    order: -100,
  } as never, StockNotice as never)
  const winner = () => {
    const entries = ctx.slots.entriesOfSlot('settings.onboarding')
    return entries.find(entry => (entry.options as { id?: string }).id === 'welcome-notice')
  }
  return { ctx, winner }
}

describe('ui-nousai-brand browser plugin', () => {
  it('shadows the stock welcome-notice cell and yields it back on disposal', async () => {
    const b = await bench()
    expect(b.winner()?.component).toBe(StockNotice)

    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.winner()?.component).toBe(NousAiWelcomeSkip)
    expect(b.winner()?.options).toMatchObject({ id: 'welcome-notice', order: -100, priority: -1 })

    await fiber.dispose()
    expect(b.winner()?.component).toBe(StockNotice)
  })

  it('completes the coordinator step once and renders nothing', () => {
    const complete = vi.fn()
    const props = {
      stepId: 'welcome-notice', complete, openSection: vi.fn(),
    } as unknown as Parameters<typeof NousAiWelcomeSkip>[0]
    const view = render(<NousAiWelcomeSkip {...props} />)
    expect(view.container.innerHTML).toBe('')
    expect(complete).toHaveBeenCalledTimes(1)

    // A re-render with a fresh callback identity must not complete again.
    view.rerender(<NousAiWelcomeSkip {...props} complete={vi.fn()} />)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('node half is a pure roster entry and the invariant companion registers ownership', async () => {
    nodeApply() // the node half is an empty roster entry; it must not throw

    const ctx = new Context()
    const registered: string[] = []
    const dispose = vi.fn()
    ctx.provide('invariants', {
      register: (name: string) => {
        registered.push(name)
        return dispose
      },
    })
    await expect(invariant.apply(ctx as never)).resolves.toBe(dispose)
    expect(registered).toEqual(['@deepseek-ai/dsh-client-ui-nousai-brand'])
    expect(invariant.name).toBe('client-ui-nousai-brand-invariant')
    expect(invariant.inject).toEqual(['invariants'])
  })
})
