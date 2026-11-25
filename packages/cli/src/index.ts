import { readFile } from 'node:fs/promises'
import { MemoryEventStore, parseSwipeEvent, type SwipeEvent } from '@swipeline/core'
import { createServer } from '@swipeline/server'

export const USAGE = `swipeline - decks from any source, ranked locally

Usage:
  swipeline serve [--port <port>] [--host <host>] [--cors <origin>]...
  swipeline validate <history.jsonl>
  swipeline help

serve     Start the HTTP API with an in-memory event log.
validate  Check a JSONL history export against the SwipeEvent schema.

Exit codes: 0 success, 1 validation failed, 2 bad usage.
`

export interface CliIo {
  stdout(line: string): void
  stderr(line: string): void
}

export interface ServeOptions {
  port: number
  host: string
  cors: string[]
}

export type ServeParse = { ok: true; options: ServeOptions } | { ok: false; message: string }

export interface HistoryValidation {
  events: SwipeEvent[]
  errors: { line: number; message: string }[]
}

const consoleIo: CliIo = {
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
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

export function parseServeOptions(args: readonly string[]): ServeParse {
  const options: ServeOptions = { port: 8787, host: '127.0.0.1', cors: [] }

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    const value = args[index + 1]

    if (flag === '--port') {
      if (!value || !/^\d+$/.test(value)) return { ok: false, message: '--port needs a number' }
      const port = Number(value)
      if (port > 65_535) return { ok: false, message: '--port must be 65535 or lower' }
      options.port = port
      index += 1
      continue
    }

    if (flag === '--host') {
      if (!value) return { ok: false, message: '--host needs a value' }
      options.host = value
      index += 1
      continue
    }

    if (flag === '--cors') {
      if (!value) return { ok: false, message: '--cors needs an origin' }
      options.cors.push(value)
      index += 1
      continue
    }

    return { ok: false, message: `Unknown option: ${flag ?? ''}` }
  }

  return { ok: true, options }
}

/**
 * Reads a JSONL history export and validates every non-empty line against the
 * `SwipeEvent` schema. Errors carry the line number so a bad export can be fixed
 * rather than silently dropped.
 */
export async function validateHistoryFile(path: string): Promise<HistoryValidation> {
  const text = await readFile(path, 'utf8')
  const events: SwipeEvent[] = []
  const errors: { line: number; message: string }[] = []

  text.split('\n').forEach((raw, index) => {
    const line = raw.trim()
    if (line === '') return
    try {
      const parsed: unknown = JSON.parse(line)
      events.push(parseSwipeEvent(parsed))
    } catch (cause) {
      errors.push({ line: index + 1, message: messageOf(cause) })
    }
  })

  return { events, errors }
}

async function serve(args: readonly string[], io: CliIo): Promise<number> {
  const parsed = parseServeOptions(args)
  if (!parsed.ok) {
    io.stderr(parsed.message)
    return 2
  }

  const server = createServer({
    events: new MemoryEventStore(),
    ...(parsed.options.cors.length > 0 ? { cors: parsed.options.cors } : {}),
  })
  const running = await server.listen(parsed.options.port, parsed.options.host)
  io.stdout(`swipeline server listening on ${running.url}`)
  io.stdout('Using the in-memory event log: history is lost when this process exits.')

  await new Promise<void>((resolve) => {
    process.once('SIGINT', () => resolve())
    process.once('SIGTERM', () => resolve())
  })
  await running.close()
  io.stdout('Server stopped.')
  return 0
}

async function validate(args: readonly string[], io: CliIo): Promise<number> {
  const [file] = args
  if (!file || args.length > 1) {
    io.stderr('validate needs exactly one JSONL file')
    return 2
  }

  let result: HistoryValidation
  try {
    result = await validateHistoryFile(file)
  } catch (cause) {
    io.stderr(`Could not read ${file}: ${messageOf(cause)}`)
    return 1
  }

  for (const error of result.errors) io.stderr(`line ${error.line}: ${error.message}`)
  if (result.errors.length > 0) {
    io.stderr(`${result.errors.length} invalid line(s).`)
    return 1
  }

  io.stdout(`${result.events.length} event(s) valid.`)
  return 0
}

/** Entry point for tests and for the `swipeline` bin. Returns the exit code. */
export async function run(argv: readonly string[], io: CliIo = consoleIo): Promise<number> {
  const [command, ...rest] = argv

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    io.stdout(USAGE)
    return 0
  }

  if (command === 'serve') return serve(rest, io)
  if (command === 'validate') return validate(rest, io)

  io.stderr(`Unknown command: ${command}`)
  io.stderr(USAGE)
  return 2
}
