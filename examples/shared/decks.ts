import { createArxivAdapter } from '@swipeline/adapter-arxiv'
import { createOpenLibraryAdapter } from '@swipeline/adapter-openlibrary'
import { createTheMealDbAdapter } from '@swipeline/adapter-themealdb'
import { createEngine, type Engine, type EngineConfig, type EventStore } from '@swipeline/core'

/**
 * Every example builds its deck here, so a config change needed by only one
 * framework is a bug in the abstraction rather than a feature of that example.
 * Only the store and the rendering differ between apps.
 */
interface DeckOptions {
  /** Pass a persisted log to keep swipes across reloads; memory is the default. */
  events?: EventStore
}

function createDeck<TRaw>(config: EngineConfig<TRaw>, options: DeckOptions): Engine {
  if (options.events) config.events = options.events
  return createEngine(config)
}

export function createBooksDeck(options: DeckOptions = {}): Engine {
  return createDeck(
    {
      deckId: 'books',
      actor: 'local-reader',
      source: createOpenLibraryAdapter({ limit: 40 }),
    },
    options,
  )
}

export function createRecipesDeck(options: DeckOptions = {}): Engine {
  return createDeck(
    {
      deckId: 'recipes',
      actor: 'local-reader',
      source: createTheMealDbAdapter(),
    },
    options,
  )
}

export function createPapersDeck(options: DeckOptions = {}): Engine {
  return createDeck(
    {
      deckId: 'papers',
      actor: 'local-reader',
      source: createArxivAdapter({ limit: 30 }),
    },
    options,
  )
}
