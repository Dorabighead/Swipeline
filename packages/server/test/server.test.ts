import { createUlid, MemoryEventStore, type SwipeEvent } from '@swipeline/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createServer, type RunningServer, type ServerOptions } from '../src/index.js'

let running: RunningServer | undefined

function event(overrides: Partial<SwipeEvent> = {}): SwipeEvent {
  return {
    schemaVersion: 1,
    id: createUlid(),
    deckId: 'books',
    cardId: 'books:1',
    actor: 'reader',
    action: 'like',
    position: 0,
    ts: new Date().toISOString(),
    ...overrides,
  }
}

async function start(overrides: Partial<ServerOptions> = {}): Promise<string> {
  const server = createServer({ events: new MemoryEventStore(), ...overrides })
  running = await server.listen(0, '127.0.0.1')
  return running.url
}

async function post(
  base: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  return fetch(`${base}/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

async function exported(base: string, headers: Record<string, string> = {}): Promise<SwipeEvent[]> {
  const response = await fetch(`${base}/export/reader`, { headers })
  const text = await response.text()
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SwipeEvent)
}

afterEach(async () => {
  await running?.close()
  running = undefined
})

describe('swipeline server', () => {
  it('reports health', async () => {
    const base = await start({ version: '9.9.9' })
    const response = await fetch(`${base}/health`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ok: true,
      service: 'swipeline-server',
      version: '9.9.9',
    })
  })

  it('accepts a batch and exports it as JSONL', async () => {
    const base = await start()
    const first = event()
    const second = event({ cardId: 'books:2', action: 'later', position: 1 })

    const response = await post(base, { events: [first, second] })
    expect(response.status).toBe(202)
    expect(await response.json()).toEqual({ accepted: 2 })

    const lines = await exported(base)
    expect(lines.map((entry) => entry.id)).toEqual([first.id, second.id])
  })

  it('is idempotent by event id', async () => {
    const base = await start()
    const duplicate = event()
    await post(base, [duplicate])
    await post(base, [duplicate])
    expect(await exported(base)).toHaveLength(1)
  })

  it('rejects an invalid event without appending anything', async () => {
    const base = await start()
    const response = await post(base, { events: [{ ...event(), id: 'not-a-ulid' }] })
    expect(response.status).toBe(400)
    const body = (await response.json()) as { issues: string[] }
    expect(body.issues[0]).toMatch(/^0: /)
    expect(await exported(base)).toHaveLength(0)
  })

  it('rejects a body over the configured limit', async () => {
    const base = await start({ maxBodyBytes: 20 })
    const response = await post(base, { events: [event()] })
    expect(response.status).toBe(413)
  })

  it('requires authentication when a hook is configured', async () => {
    const base = await start({
      authenticate: (request) =>
        request.headers.authorization === 'Bearer ok' ? { actor: 'reader' } : null,
    })
    expect((await post(base, [event()])).status).toBe(401)
    expect((await post(base, [event()], { authorization: 'Bearer ok' })).status).toBe(202)
  })

  it('refuses an event for a different actor', async () => {
    const base = await start({
      authenticate: () => ({ actor: 'reader' }),
    })
    const response = await post(base, [event({ actor: 'someone-else' })], {
      authorization: 'Bearer ok',
    })
    expect(response.status).toBe(403)
  })

  it('erases an actor and rejects exporting another one', async () => {
    const base = await start({
      authenticate: (request) =>
        request.headers.authorization === 'Bearer reader' ? { actor: 'reader' } : null,
    })
    const headers = { authorization: 'Bearer reader' }
    await post(base, [event()], headers)

    const forbidden = await fetch(`${base}/export/someone-else`, { headers })
    expect(forbidden.status).toBe(403)

    const erased = await fetch(`${base}/actors/reader`, { method: 'DELETE', headers })
    expect(await erased.json()).toEqual({ erased: 1 })
    expect(await exported(base, headers)).toHaveLength(0)
  })

  it('answers CORS preflight only for allowed origins', async () => {
    const base = await start({ cors: 'https://app.example.com' })
    const allowed = await fetch(`${base}/events`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://app.example.com',
        'access-control-request-method': 'POST',
      },
    })
    expect(allowed.status).toBe(204)
    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://app.example.com')

    const denied = await fetch(`${base}/events`, {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.example.com' },
    })
    expect(denied.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('returns 404 and 405 with an Allow header', async () => {
    const base = await start()
    expect((await fetch(`${base}/nope`)).status).toBe(404)

    const wrongMethod = await fetch(`${base}/events`)
    expect(wrongMethod.status).toBe(405)
    expect(wrongMethod.headers.get('allow')).toBe('POST')
  })
})
