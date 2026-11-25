import type { Card } from '@swipeline/core'
import { SwipeDeck } from '@swipeline/react'
import '@swipeline/react/styles.css'
import { createIndexedDbStores } from '@swipeline/store-indexeddb'
import { createRoot } from 'react-dom/client'
import { createBooksDeck } from '../../shared/decks'
import './app.css'

function BookCard({ card }: { card: Card }) {
  const cover = card.media?.find((media) => media.kind === 'image')
  return (
    <div className="book">
      {cover ? (
        <img
          className="book__cover"
          src={cover.url}
          alt={cover.alt ?? `Cover of ${card.title}`}
          loading="lazy"
        />
      ) : null}
      <div className="book__text">
        <h2 className="book__title">{card.title}</h2>
        {card.subtitle ? <p className="book__author">{card.subtitle}</p> : null}
        {card.body ? <p className="book__body">{card.body}</p> : null}
        {card.tags && card.tags.length > 0 ? (
          <ul className="book__tags" aria-label="Subjects">
            {card.tags.slice(0, 8).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
        {card.attribution ? (
          <p className="book__attribution">
            <a href={card.attribution.url} target="_blank" rel="noreferrer noopener">
              {card.attribution.text}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('The example markup is missing #root')

async function start(): Promise<void> {
  // The IndexedDB log is the deck's memory: swipes and undo survive a reload.
  const stores = await createIndexedDbStores({ name: 'swipeline-example-books' })
  const store = createBooksDeck({ events: stores.events })
  store.dispatch({ type: 'refill' })

  createRoot(rootElement as HTMLElement).render(
    <SwipeDeck store={store} label="Book deck" renderCard={(card) => <BookCard card={card} />} />,
  )
}

void start()
