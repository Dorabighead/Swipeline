import type { Card } from '@swipeline/core'
import { defineSwipeDeck } from '@swipeline/element'
import { createPapersDeck } from '../../shared/decks'
import './app.css'

// The element styles its own card; this style block travels with the custom
// template because `renderCard` nodes live inside the element's shadow root.
const CARD_STYLES = `
  .paper { display: grid; gap: 0.6rem; }
  .paper__title { margin: 0; font-size: 1.25rem; line-height: 1.3; }
  .paper__authors { margin: 0; color: #c9c4ff; }
  .paper__body { margin: 0; color: #d8d5ec; }
  .paper__facts { display: flex; gap: 1.25rem; margin: 0; }
  .paper__facts dt { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #a5a0c8; }
  .paper__facts dd { margin: 0.1rem 0 0; font-weight: 600; }
  .paper__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
  .paper__tags li { padding: 0.1rem 0.5rem; border-radius: 999px; background: #2a2a4a; font-size: 0.75rem; }
  .paper__attribution { margin: 0; font-size: 0.75rem; color: #a5a0c8; }
  .paper__attribution a { color: inherit; }
`

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function renderPaper(card: Card): Node {
  const wrapper = document.createElement('div')
  const style = document.createElement('style')
  style.textContent = CARD_STYLES
  const article = element('article', 'paper')

  article.append(element('h2', 'paper__title', card.title))
  if (card.subtitle) article.append(element('p', 'paper__authors', card.subtitle))
  if (card.facts && card.facts.length > 0) {
    const facts = element('dl', 'paper__facts')
    for (const fact of card.facts) {
      const group = document.createElement('div')
      group.append(element('dt', '', fact.label))
      group.append(element('dd', '', fact.unit ? `${fact.value} ${fact.unit}` : String(fact.value)))
      facts.append(group)
    }
    article.append(facts)
  }
  if (card.body) article.append(element('p', 'paper__body', card.body))
  if (card.tags && card.tags.length > 0) {
    const tags = element('ul', 'paper__tags')
    for (const tag of card.tags) tags.append(element('li', '', tag))
    article.append(tags)
  }
  if (card.attribution) {
    const attribution = element('p', 'paper__attribution')
    if (card.attribution.url) {
      const link = element('a', '', card.attribution.text)
      link.href = card.attribution.url
      link.target = '_blank'
      link.rel = 'noreferrer noopener'
      attribution.append(link)
    } else {
      attribution.textContent = card.attribution.text
    }
    article.append(attribution)
  }

  wrapper.append(style, article)
  return wrapper
}

const root = document.getElementById('root')
if (!root) throw new Error('The example markup is missing #root')

defineSwipeDeck()

const deck = document.createElement('swipe-deck')
deck.setAttribute('label', 'Paper deck')
deck.renderCard = renderPaper

const store = createPapersDeck()
deck.store = store
root.append(deck)
store.dispatch({ type: 'refill' })

// DOM events out, the same contract React consumes through props.
deck.addEventListener('swipe', (event) => {
  const detail = (event as CustomEvent<{ action: string; cardId: string }>).detail
  console.info('swiped', detail.action, detail.cardId)
})
