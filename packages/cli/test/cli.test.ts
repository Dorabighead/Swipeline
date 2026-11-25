import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createUlid, type SwipeEvent } from '@swipeline/core'
import { afterEach, describe, expect, it } from 'vitest'
import { type CliIo, parseServeOptions, run, USAGE, validateHistoryFile } from '../src/index.js'

let directory: string | undefined

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

async function historyFile(lines: string[]): Promise<string> {
  directory = await mkdtemp(join(tmpdir(), 'swipeline-cli-'))
  const path = join(directory, 'history.jsonl')
  await writeFile(path, `${lines.join('\n')}\n`, 'utf8')
  return path
}

function capture(): { io: CliIo; out: string[]; err: string[] } {
  const out: string[] = []
  const err: string[] = []
  return { io: { stdout: (line) => out.push(line), stderr: (line) => err.push(line) }, out, err }
}

afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true })
  directory = undefined
})

describe('swiline serve options', () => {
  it('defaults to 127.0.0.1:8787', () => {
    expect(parseServeOptions([])).toEqual({
      ok: true,
      options: { port: 8787, host: '127.0.0.1', cors: [] },
    })
  })

  it('reads port, host and repeated cors origins', () => {
    expect(
      parseServeOptions([
        '--port',
        '9000',
        '--host',
        '0.0.0.0',
        '--cors',
        'https://a.example',
        '--cors',
        'https://b.example',
      ]),
    ).toEqual({
      ok: true,
      options: {
        port: 9000,
        host: '0.0.0.0',
        cors: ['https://a.example', 'https://b.example'],
      },
    })
  })

  it('rejects a bad port and an unknown option', () => {
    expect(parseServeOptions(['--port', 'eighty'])).toEqual({
      ok: false,
      message: '--port needs a number',
    })
    expect(parseServeOptions(['--port', '70000'])).toEqual({
      ok: false,
      message: '--port must be 65535 or lower',
    })
    expect(parseServeOptions(['--wat'])).toEqual({
      ok: false,
      message: 'Unknown option: --wat',
    })
  })
})

describe('swipeline validate', () => {
  it('accepts a history with blank lines', async () => {
    const path = await historyFile([JSON.stringify(event()), '', JSON.stringify(event())])
    const result = await validateHistoryFile(path)
    expect(result.errors).toEqual([])
    expect(result.events).toHaveLength(2)
    expect(result.events[0]?.actor).toBe('reader')
  })

  it('reports the line number of an invalid event', async () => {
    const path = await historyFile([
      JSON.stringify(event()),
      JSON.stringify({ ...event(), id: 'not-a-ulid' }),
    ])
    const result = await validateHistoryFile(path)
    expect(result.events).toHaveLength(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.line).toBe(2)
    expect(result.errors[0]?.message).toContain('ULID')
  })

  it('exits 0 for a valid file and 1 for an invalid one', async () => {
    const good = await historyFile([JSON.stringify(event())])
    const goodRun = capture()
    expect(await run(['validate', good], goodRun.io)).toBe(0)
    expect(goodRun.out).toEqual(['1 event(s) valid.'])

    const bad = await historyFile(['{"id":"nope"}'])
    const badRun = capture()
    expect(await run(['validate', bad], badRun.io)).toBe(1)
    expect(badRun.err.some((line) => line.startsWith('line 1: '))).toBe(true)
  })

  it('exits 2 without a file', async () => {
    const captured = capture()
    expect(await run(['validate'], captured.io)).toBe(2)
    expect(captured.err).toEqual(['validate needs exactly one JSONL file'])
  })
})

describe('swipeline help', () => {
  it('prints usage and exits 0', async () => {
    const captured = capture()
    expect(await run(['help'], captured.io)).toBe(0)
    expect(captured.out).toEqual([USAGE])
  })

  it('exits 2 for an unknown command', async () => {
    const captured = capture()
    expect(await run(['frobnicate'], captured.io)).toBe(2)
    expect(captured.err[0]).toBe('Unknown command: frobnicate')
  })
})
