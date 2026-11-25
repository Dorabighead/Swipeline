import type { Card } from '@swipeline/core'
import { SwipeDeck } from '@swipeline/react'
import '@swipeline/react/styles.css'
import { createRoot } from 'react-dom/client'
import { createRecipesDeck } from '../../shared/decks'
import './app.css'

function RecipeCard({ card }: { card: Card }) {
  const photo = card.media?.find((media) => media.kind === 'image')
  return (
    <div className="recipe">
      {photo ? (
        <img
          className="recipe__photo"
          src={photo.url}
          alt={photo.alt ?? `Photo of ${card.title}`}
          loading="lazy"
        />
      ) : null}
      <h2 className="recipe__title">{card.title}</h2>
      {card.subtitle ? <p className="recipe__subtitle">{card.subtitle}</p> : null}
      {card.facts && card.facts.length > 0 ? (
        <dl className="recipe__facts">
          {card.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.unit ? `${fact.value} ${fact.unit}` : fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {card.body ? <p className="recipe__body">{card.body}</p> : null}
      {card.attribution ? (
        <p className="recipe__attribution">
          <a href={card.attribution.url} target="_blank" rel="noreferrer noopener">
            {card.attribution.text}
          </a>
        </p>
      ) : null}
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('The example markup is missing #root')

// No event store is passed: this example uses the engine's memory log, so a
// reload starts a fresh deck. Swap in `createIndexedDbStores` to persist.
const store = createRecipesDeck()
store.dispatch({ type: 'refill' })

createRoot(rootElement).render(
  <SwipeDeck store={store} label="Recipe deck" renderCard={(card) => <RecipeCard card={card} />} />,
)
