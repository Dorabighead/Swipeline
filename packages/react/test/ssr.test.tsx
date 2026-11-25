import { type Card, createEngine, type SourceAdapter } from '@swipeline/core'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SwipeDeck } from '../src/index.js'

const source: SourceAdapter<Card> = {
  id: 'ssr',
  capabilities: { pagination: 'none' },
  async fetch() {
    return {
      items: [
        {
          schemaVersion: 1,
          id: 'ssr:1',
          sourceId: 'ssr',
          title: 'Server card',
          fetchedAt: '2026-11-25T00:00:00.000Z',
        },
      ],
    }
  },
  normalize(raw) {
    return raw
  },
}

describe('SwipeDeck on the server', () => {
  // No `@vitest-environment jsdom` here on purpose: this file must run in Node
  // with no document, which is the SSR smoke test the binding guide asks for.
  it('renders a deck shell without a DOM and without throwing', () => {
    const store = createEngine({ deckId: 'ssr', actor: 'reader', source })
    const html = renderToString(<SwipeDeck store={store} label="Server deck" />)
    expect(html).toContain('role="application"')
    expect(html).toContain('Server deck')
  })
})
