import {
  createServer as createHttpServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { type EventQuery, type EventStore, parseSwipeEvent, type SwipeEvent } from '@swipeline/core'

/** What `authenticate` may return. `undefined` is internal: no hook configured. */
export type AuthResult = { actor: string } | null

export interface ServerOptions {
  /** Append-only log. Pass a durable store in production. */
  events: EventStore
  /**
   * Resolve the caller's actor from the request, or `null` to reject with 401.
   * When set, every event in a batch must belong to that actor.
   */
  authenticate?: (request: IncomingMessage) => Promise<AuthResult> | AuthResult
  /** Allowed origins, or `*`. Omit to send no CORS headers at all. */
  cors?: string | readonly string[]
  /** Request body cap in bytes. Defaults to 1 MiB. */
  maxBodyBytes?: number
  /** Reported by `GET /health`. */
  version?: string
}

export interface RunningServer {
  url: string
  port: number
  close(): Promise<void>
}

export interface SwipelineServer {
  handler(request: IncomingMessage, response: ServerResponse): Promise<void>
  listen(port?: number, host?: string): Promise<RunningServer>
}

const DEFAULT_MAX_BODY = 1024 * 1024
const SERVICE = 'swipeline-server'

class BodyTooLargeError extends Error {
  constructor(limit: number) {
    super(`request body exceeds ${limit} bytes`)
    this.name = 'BodyTooLargeError'
  }
}

function messageOf(cause: unknown): string {
  if (cause && typeof cause === 'object' && 'issues' in cause) {
    const issues = (cause as { issues?: { path?: (string | number)[]; message?: string }[] }).issues
    const first = issues?.[0]
    if (first) {
      const path = first.path?.length ? `${first.path.join('.')}: ` : ''
      return `${path}${first.message ?? 'invalid event'}`
    }
  }
  return cause instanceof Error ? cause.message : String(cause)
}

function send(
  response: ServerResponse,
  status: number,
  body: string,
  contentType: string,
  extra: Record<string, string> = {},
): void {
  response.writeHead(status, {
    'content-type': contentType,
    'x-content-type-options': 'nosniff',
    ...extra,
  })
  response.end(body)
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  extra: Record<string, string> = {},
): void {
  send(response, status, JSON.stringify(body), 'application/json; charset=utf-8', extra)
}

function allowedOrigin(
  cors: string | readonly string[] | undefined,
  origin: string | undefined,
): string | undefined {
  if (!cors || !origin) return undefined
  const origins = typeof cors === 'string' ? [cors] : cors
  if (origins.includes('*')) return '*'
  return origins.includes(origin) ? origin : undefined
}

async function readJsonBody(request: IncomingMessage, limit: number): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > limit) throw new BodyTooLargeError(limit)
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (text === '') throw new SyntaxError('empty body')
  return JSON.parse(text)
}

function methodNotAllowed(
  response: ServerResponse,
  allow: string,
  cors: Record<string, string>,
): void {
  sendJson(response, 405, { error: 'method not allowed' }, { ...cors, allow })
}

export function createServer(options: ServerOptions): SwipelineServer {
  const maxBody = options.maxBodyBytes ?? DEFAULT_MAX_BODY

  function corsHeaders(request: IncomingMessage): Record<string, string> {
    const origin = allowedOrigin(options.cors, request.headers.origin)
    if (!origin) return {}
    const headers: Record<string, string> = {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'authorization,content-type',
      'access-control-max-age': '600',
      vary: 'origin',
    }
    // Credentials and a wildcard origin are mutually exclusive.
    if (origin !== '*') headers['access-control-allow-credentials'] = 'true'
    return headers
  }

  async function authorize(request: IncomingMessage): Promise<AuthResult | undefined> {
    if (!options.authenticate) return undefined
    return options.authenticate(request)
  }

  async function postEvents(
    request: IncomingMessage,
    response: ServerResponse,
    cors: Record<string, string>,
  ): Promise<void> {
    const auth = await authorize(request)
    if (auth === null) {
      sendJson(response, 401, { error: 'unauthorized' }, cors)
      return
    }

    let payload: unknown
    try {
      payload = await readJsonBody(request, maxBody)
    } catch (cause) {
      if (cause instanceof BodyTooLargeError) {
        sendJson(response, 413, { error: cause.message }, cors)
        return
      }
      sendJson(response, 400, { error: 'body must be JSON' }, cors)
      return
    }

    const raw = Array.isArray(payload) ? payload : (payload as { events?: unknown } | null)?.events
    if (!Array.isArray(raw)) {
      sendJson(response, 400, { error: 'expected an event array or { events: [...] }' }, cors)
      return
    }

    const events: SwipeEvent[] = []
    const issues: string[] = []
    raw.forEach((entry, index) => {
      try {
        events.push(parseSwipeEvent(entry))
      } catch (cause) {
        issues.push(`${index}: ${messageOf(cause)}`)
      }
    })
    if (issues.length > 0) {
      sendJson(response, 400, { error: 'invalid events', issues }, cors)
      return
    }

    if (auth && events.some((event) => event.actor !== auth.actor)) {
      sendJson(response, 403, { error: 'event actor does not match the authenticated actor' }, cors)
      return
    }

    await options.events.append(events)
    sendJson(response, 202, { accepted: events.length }, cors)
  }

  async function exportActor(
    actor: string,
    url: URL,
    request: IncomingMessage,
    response: ServerResponse,
    cors: Record<string, string>,
  ): Promise<void> {
    const auth = await authorize(request)
    if (auth === null) {
      sendJson(response, 401, { error: 'unauthorized' }, cors)
      return
    }
    if (auth && auth.actor !== actor) {
      sendJson(response, 403, { error: 'cannot export another actor' }, cors)
      return
    }

    const query: EventQuery = { actor }
    const deckId = url.searchParams.get('deckId')
    const since = url.searchParams.get('since')
    const until = url.searchParams.get('until')
    const afterId = url.searchParams.get('afterId')
    const limitRaw = url.searchParams.get('limit')
    if (deckId) query.deckId = deckId
    if (since) query.since = since
    if (until) query.until = until
    if (afterId) query.afterId = afterId
    if (limitRaw) {
      const limit = Number(limitRaw)
      if (!Number.isInteger(limit) || limit <= 0) {
        sendJson(response, 400, { error: 'limit must be a positive integer' }, cors)
        return
      }
      query.limit = limit
    }

    const events = await options.events.export(query)
    const lines = events.map((event) => JSON.stringify(event))
    const body = lines.length > 0 ? `${lines.join('\n')}\n` : ''
    send(response, 200, body, 'application/x-ndjson; charset=utf-8', cors)
  }

  async function eraseActor(
    actor: string,
    request: IncomingMessage,
    response: ServerResponse,
    cors: Record<string, string>,
  ): Promise<void> {
    const auth = await authorize(request)
    if (auth === null) {
      sendJson(response, 401, { error: 'unauthorized' }, cors)
      return
    }
    if (auth && auth.actor !== actor) {
      sendJson(response, 403, { error: 'cannot erase another actor' }, cors)
      return
    }
    const erased = await options.events.erase(actor)
    sendJson(response, 200, { erased }, cors)
  }

  async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const parts = url.pathname.split('/').filter(Boolean)
    const cors = corsHeaders(request)

    try {
      if (request.method === 'OPTIONS') {
        response.writeHead(204, cors)
        response.end()
        return
      }

      if (parts.length === 1 && parts[0] === 'health') {
        if (request.method !== 'GET') return methodNotAllowed(response, 'GET', cors)
        sendJson(
          response,
          200,
          { ok: true, service: SERVICE, version: options.version ?? '0.0.0' },
          cors,
        )
        return
      }

      if (parts.length === 1 && parts[0] === 'events') {
        if (request.method !== 'POST') return methodNotAllowed(response, 'POST', cors)
        await postEvents(request, response, cors)
        return
      }

      if (parts.length === 2 && parts[0] === 'export') {
        if (request.method !== 'GET') return methodNotAllowed(response, 'GET', cors)
        await exportActor(decodeURIComponent(parts[1] ?? ''), url, request, response, cors)
        return
      }

      if (parts.length === 2 && parts[0] === 'actors') {
        if (request.method !== 'DELETE') return methodNotAllowed(response, 'DELETE', cors)
        await eraseActor(decodeURIComponent(parts[1] ?? ''), request, response, cors)
        return
      }

      sendJson(response, 404, { error: 'not found' }, cors)
    } catch {
      if (!response.headersSent) sendJson(response, 500, { error: 'internal error' }, cors)
      else response.end()
    }
  }

  function listen(port = 8787, host = '127.0.0.1'): Promise<RunningServer> {
    return new Promise((resolve, reject) => {
      const server = createHttpServer((request, response) => {
        void handler(request, response)
      })
      server.once('error', reject)
      server.listen(port, host, () => {
        const address = server.address()
        const actualPort = typeof address === 'object' && address ? address.port : port
        resolve({
          url: `http://${host}:${actualPort}`,
          port: actualPort,
          close: () =>
            new Promise<void>((done, fail) => {
              server.close((error) => (error ? fail(error) : done()))
              // Keep-alive connections from a previous test would otherwise hold
              // close() open until their timeout.
              server.closeAllConnections()
            }),
        })
      })
    })
  }

  return { handler, listen }
}
