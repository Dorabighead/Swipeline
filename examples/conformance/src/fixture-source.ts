import type { Card, SourceAdapter } from '@swipeline/core'

function card(id: string, title: string): Card {
  return {
    schemaVersion: 1,
    id: `conformance:${id}`,
    sourceId: 'conformance',
    title,
    fetchedAt: '2026-11-25T00:00:00.000Z',
  }
}

/** The same two-card source the package tests use, so results are comparable. */
export function createFixtureSource(): SourceAdapter<Card> {
  return {
    id: 'conformance',
    capabilities: { pagination: 'none' },
    async fetch() {
      return { items: [card('1', 'First card'), card('2', 'Second card')] }
    },
    normalize(raw) {
      return raw
    },
  }
}
