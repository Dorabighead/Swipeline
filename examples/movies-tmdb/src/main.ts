import { createEngine, type SourceAdapter, safeParseCard } from '@swipeline/core'
import { defineSwipeDeck } from '@swipeline/element'
import './app.css'

const ATTRIBUTION = {
  text: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
  url: 'https://www.themoviedb.org',
  required: true,
}

/**
 * The browser only sees normalized cards. The key and the TMDB call live in the
 * Vite middleware (`vite.config.ts`), which is the shape a real backend takes.
 */
const source: SourceAdapter<unknown> = {
  id: 'tmdb-proxy',
  capabilities: { pagination: 'offset', search: true },
  attribution: ATTRIBUTION,
  async fetch(ctx) {
    const url = new URL('/api/tmdb/cards', location.origin)
    if (ctx.query) url.searchParams.set('query', ctx.query)
    if (ctx.cursor) url.searchParams.set('cursor', ctx.cursor)
    const init: RequestInit = ctx.signal ? { signal: ctx.signal } : {}
    const response = await fetch(url, init)
    if (!response.ok) {
      const detail = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(detail.error ?? `TMDB proxy responded ${response.status}`)
    }
    const body = (await response.json()) as { cards?: unknown[]; nextCursor?: string }
    const items = Array.isArray(body.cards) ? body.cards : []
    return body.nextCursor === undefined ? { items } : { items, nextCursor: body.nextCursor }
  },
  normalize(raw) {
    const parsed = safeParseCard(raw)
    return parsed.success ? parsed.data : null
  },
}

const root = document.getElementById('root')
if (!root) throw new Error('The example markup is missing #root')

defineSwipeDeck()

const store = createEngine({ deckId: 'movies', actor: 'local-reader', source })
const deck = document.createElement('swipe-deck')
deck.setAttribute('label', 'Movie deck')
deck.store = store
root.append(deck)
store.dispatch({ type: 'refill' })
