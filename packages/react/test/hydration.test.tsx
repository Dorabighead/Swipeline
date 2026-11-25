// @vitest-environment jsdom

import { type Card, createEngine, type SourceAdapter } from '@swipeline/core'
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SwipeDeck } from '../src/index.js'

// React only uses act() when the environment opts in; without this the test logs
// the "not configured to support act" warning on every update.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const source: SourceAdapter<Card> = {
  id: 'hydration',
  capabilities: { pagination: 'none' },
  async fetch() {
    return {
      items: [
        {
          schemaVersion: 1,
          id: 'hydration:1',
          sourceId: 'hydration',
          title: 'First card',
          fetchedAt: '2026-11-25T00:00:00.000Z',
        },
        {
          schemaVersion: 1,
          id: 'hydration:2',
          sourceId: 'hydration',
          title: 'Second card',
          fetchedAt: '2026-11-25T00:00:00.000Z',
        },
      ],
    }
  },
  normalize(raw) {
    return raw
  },
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

describe('SwipeDeck hydration', () => {
  it('hydrates the server markup without a mismatch and then goes live', async () => {
    const store = createEngine({ deckId: 'hydration', actor: 'reader', source })
    const html = renderToString(<SwipeDeck store={store} label="Hydrated deck" />)

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)

    const consoleErrors: string[] = []
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      consoleErrors.push(args.map((entry) => String(entry)).join(' '))
    })

    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <SwipeDeck store={store} label="Hydrated deck" />)
    })

    // React reports a mismatch through console.error; the server and client
    // snapshots must agree, so there should be nothing to report.
    expect(consoleErrors.filter((message) => /hydrat/i.test(message))).toEqual([])
    expect(container.querySelector('[role="application"]')).not.toBeNull()

    await act(async () => {
      store.dispatch({ type: 'refill' })
      await store.whenSettled()
    })
    expect(container.textContent).toContain('First card')

    act(() => root?.unmount())
    store.close()
  })
})
