/**
 * NousAI web runtime glue behavior: dist resolution through this bundle's own
 * hook (the NousAI frontend package), the frontend-static child claiming the
 * fallback seat, the `webApp` service, the NousAI-worded bash runtime
 * variable, the advertised public root, and URL-line printing. The branch
 * structure mirrors the stock web-app spec because the runtimes share their
 * seat and readiness mechanics.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { apply, Config, internals, inject, name } from '../src/index.ts'

let dist: string | undefined

afterEach(() => {
  vi.restoreAllMocks()
  internals.resolveDistIndex = originalResolve
  if (dist !== undefined) rmSync(dist, { recursive: true, force: true })
  dist = undefined
})

const originalResolve = internals.resolveDistIndex

/** Stage a dist fixture and point the bundle's resolver at it. */
function stageDist(): string {
  dist = mkdtempSync(join(tmpdir(), 'dsh-nousai-web-app-'))
  mkdirSync(join(dist, 'dist'))
  const index = join(dist, 'dist', 'index.html')
  writeFileSync(index, '<head><title>NousAI Harness</title></head><body>shell</body>')
  internals.resolveDistIndex = () => index
  return index
}

/** A fake webServer capturing the fallback seat and index taps. */
function fakeHttpServer(): { server: WebServer; seat: () => unknown } {
  let fallback: unknown
  const server: Pick<WebServer, 'host' | 'port' | 'protocol' | 'getOrigin' | 'registerFallback' | 'renderIndex'> = {
    host: '127.0.0.1',
    port: 4567,
    protocol: 'http:',
    getOrigin() { return `http://127.0.0.1:${String(this.port)}` },
    registerFallback: (handler: unknown) => {
      fallback = handler
      return () => { fallback = undefined }
    },
    renderIndex: (html: string) => html,
  }
  return { server: server as WebServer, seat: () => fallback }
}

/** A fake Loader whose settlement the test controls (the URL line waits on it). */
function provideLoader(ctx: Context, settle: () => Promise<void> = async () => {}): void {
  ctx.provide('loader', { await: settle, entries: () => [] } as never)
}

/** A fake Connection issuing deterministic process-token URLs (the announce waits on it). */
function provideConnection(ctx: Context): void {
  ctx.provide('connection', {
    // Adds the process token to the given canonical root, preserving any
    // public mount prefix the caller passed.
    authenticatedUrl(baseUrl: string) {
      const url = new URL(baseUrl)
      url.searchParams.set('token', 'test-token')
      return url.href
    },
    authorizeIndex: () => true,
    requestRejection: () => undefined,
    rpc: {},
  } as never)
}

interface BashContribution {
  name: string
  variables: Record<string, { description: string }>
  resolve: () => Record<string, string>
}

/** Capture the bash contributions the runtime registers. */
function provideShellEnv(ctx: Context): BashContribution[] {
  const contributions: BashContribution[] = []
  ctx.provide('shellEnv', {
    register: (contribution: BashContribution) => {
      contributions.push(contribution)
      return () => {}
    },
  } as never)
  return contributions
}

describe('nousai-web-app runtime glue', () => {
  it('mounts dist serving, the webApp service, the NousAI bash variable, and prints the listener URL', async () => {
    stageDist()
    const ctx = new Context()
    const { server, seat } = fakeHttpServer()
    ctx.provide('webServer', server)
    provideConnection(ctx)
    const contributions = provideShellEnv(ctx)
    provideLoader(ctx)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({ openBrowser: false, printUrl: true, surfaceContext: true }))
    // Settle the injected registrations.
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(seat()).toBeDefined() // frontend-static claimed the fallback
    expect(log).toHaveBeenCalledWith('dsh web: http://127.0.0.1:4567/?token=test-token')
    expect(ctx.webApp.getAdvertisedUrl()).toBe('http://127.0.0.1:4567')
    const webRuntime = contributions.find(contribution => contribution.name === 'web-runtime')
    expect(webRuntime?.resolve()).toEqual({ DSH_WEB_URL: 'http://127.0.0.1:4567' })
    expect(webRuntime?.variables.DSH_WEB_URL?.description).toBe('Advertised URL of the NousAI Harness Web GUI serving this session.')
    await ctx.fiber.dispose()
  })

  it('advertises the configured public root in the URL line, the webApp service, and DSH_WEB_URL', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer().server)
    provideConnection(ctx)
    const contributions = provideShellEnv(ctx)
    provideLoader(ctx)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({ openBrowser: false, printUrl: true, surfaceContext: true, publicUrl: 'https://proxy.example:8443/web' }))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(log).toHaveBeenCalledWith('dsh web: https://proxy.example:8443/web/?token=test-token')
    expect(ctx.webApp.getAdvertisedUrl()).toBe('https://proxy.example:8443/web/')
    const webRuntime = contributions.find(contribution => contribution.name === 'web-runtime')
    expect(webRuntime?.resolve()).toEqual({ DSH_WEB_URL: 'https://proxy.example:8443/web/' })
    await ctx.fiber.dispose()
  })

  it('stays quiet with printUrl off', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer().server)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({ openBrowser: false, printUrl: false, surfaceContext: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).not.toHaveBeenCalled()
    await ctx.fiber.dispose()
  })

  it('skips the bash variable when surface context is disabled (the one-shot layer)', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer().server)
    const contributions = provideShellEnv(ctx)
    apply(ctx, new Config({ openBrowser: false, printUrl: false, surfaceContext: false }))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(contributions).toEqual([])
    expect(ctx.webApp.getAdvertisedUrl()).toBe('http://127.0.0.1:4567')
    await ctx.fiber.dispose()
  })

  it('prints the listener URL line without a Loader', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer().server)
    provideConnection(ctx)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({ openBrowser: false, printUrl: true, surfaceContext: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).toHaveBeenCalledWith('dsh web: http://127.0.0.1:4567/?token=test-token')
    await ctx.fiber.dispose()
  })

  it('defers the URL line until Loader settlement and drops it on failure or teardown', async () => {
    stageDist()
    // Settlement path: the line waits for loader.await() so supervisors can
    // RPC immediately after observing it.
    const settled = new Context()
    settled.provide('webServer', fakeHttpServer().server)
    provideConnection(settled)
    let release: () => void
    const settlement = new Promise<void>((resolve) => { release = resolve })
    provideLoader(settled, () => settlement)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(settled, new Config({ openBrowser: false, printUrl: true, surfaceContext: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).not.toHaveBeenCalled()
    release!()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).toHaveBeenCalledWith('dsh web: http://127.0.0.1:4567/?token=test-token')
    await settled.fiber.dispose()

    // Failed path: Loader reports the sibling failure; the app prints no URL
    // for a process that is about to exit.
    log.mockClear()
    const failed = new Context()
    failed.provide('webServer', fakeHttpServer().server)
    provideConnection(failed)
    provideLoader(failed, async () => { throw new Error('boot failed') })
    apply(failed, new Config({ openBrowser: false, printUrl: true, surfaceContext: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).not.toHaveBeenCalled()
    await failed.fiber.dispose()

    // Torn-down path: settlement resolves after the webserver is gone — no
    // line, no crash.
    log.mockClear()
    const torn = new Context()
    provideConnection(torn)
    const child = torn.plugin((childCtx: Context) => {
      childCtx.provide('webServer', fakeHttpServer().server)
    })
    await child
    let releaseTorn: () => void
    const tornSettlement = new Promise<void>((resolve) => { releaseTorn = resolve })
    provideLoader(torn, () => tornSettlement)
    apply(torn, new Config({ openBrowser: false, printUrl: true, surfaceContext: true }))
    await child.dispose() // the webServer service goes away
    releaseTorn!()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(log).not.toHaveBeenCalled()
    await torn.fiber.dispose()
  })

  it('names the NousAI plugin when a zone-scoped bind has no advertised root', () => {
    stageDist()
    const ctx = new Context()
    const { server } = fakeHttpServer()
    Object.defineProperty(server, 'host', { value: 'fe80::1%eth0' })
    ctx.provide('webServer', server)
    expect(() => { apply(ctx, new Config({ openBrowser: false, printUrl: false, surfaceContext: false })) })
      .toThrow(/^nousai-web-app: bind address "fe80::1%eth0" carries an interface zone id/u)
  })

  it('anchors the dist index on the NousAI frontend package manifest without requiring a built dist', () => {
    expect(name).toBe('nousai-web-app')
    expect(inject).toEqual(['webServer'])
    const index = originalResolve()
    expect(index.replaceAll('\\', '/')).toMatch(/apps\/web-nousai\/dist\/index\.html$/)
  })
})
