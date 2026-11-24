---
layout: home

hero:
  name: Swipeline
  text: From any source to a ranked deck
  tagline: A swipe-first discovery toolkit for developers. Modular, local-first, measurable.
  image:
    src: /brand/hero.svg
    alt: Cards moving through a ranking pipeline into a swipeable deck
  actions:
    - theme: brand
      text: Quickstart
      link: /getting-started/quickstart
    - theme: alt
      text: Architecture contracts
      link: /architecture/contracts
    - theme: alt
      text: GitHub
      link: https://github.com/JoeyHammoth/Swipeline

features:
  - icon:
      src: /brand/icons8/modular.png
      alt: Puzzle piece
      width: '44'
      height: '44'
    title: Every layer replaceable
    details: Source, storage, ranking and UI are separate packages behind small TypeScript interfaces. Use one, a few, or all of them.
  - icon:
      src: /brand/icons8/local-first.png
      alt: Privacy lock
      width: '44'
      height: '44'
    title: Local-first by default
    details: Tier 1 keeps cards, events and profiles on the device. No Swipeline servers, no telemetry. Export and erase are first-class APIs.
  - icon:
      src: /brand/icons8/any-source.png
      alt: Plug
      width: '44'
      height: '44'
    title: Any source
    details: Declarative mappings cover most REST and JSON APIs; a typed adapter covers the rest. Pagination, attribution and rate limits are part of the contract.
  - icon:
      src: /brand/icons8/ranking.png
      alt: Bar chart
      width: '44'
      height: '44'
    title: Ranking you can measure
    details: A synthetic-user benchmark ships with the repo, so "the deck got better" is a number in CI rather than a claim.
  - icon:
      src: /brand/icons8/accessibility.png
      alt: Accessibility symbol
      width: '44'
      height: '44'
    title: Accessible by construction
    details: Buttons and keyboard paths for every action, ARIA live announcements, and reduced-motion support are part of a binding's definition of done.
  - icon:
      src: /brand/icons8/tested.png
      alt: Test tube
      width: '44'
      height: '44'
    title: Framework-agnostic, enforced
    details: One DeckStore contract, a vanilla gestures module, a Web Component reference binding, and CI that fails on framework imports outside bindings.
---

<div class="home-stack" aria-label="Core technology">
  <span><img src="/brand/icons8/typescript.png" alt="" width="26" height="26"> TypeScript</span>
  <span><img src="/brand/icons8/nodejs.png" alt="" width="26" height="26"> Node.js 24+</span>
  <span><img src="/brand/icons8/sqlite.png" alt="" width="26" height="26"> SQLite optional</span>
</div>

## Status

> **Pre-alpha (M0 foundation).** Schemas and repository infrastructure exist; the
> deck engine lands in M1. Nothing is installable from npm yet. The
> [roadmap](/roadmap) is the honest source of truth.

## What it looks like

```ts
// deck.config.ts — the same file every framework consumes
import { defineDeck } from '@swipeline/core'
import { httpJson } from '@swipeline/adapters'
import { indexedDbStore } from '@swipeline/store-indexeddb'

export const books = defineDeck({
  id: 'books',
  source: httpJson({
    id: 'openlibrary',
    url: 'https://openlibrary.org/search.json?q={query}&limit=50&page={page}',
    pagination: { type: 'page', param: 'page' },
    itemsPath: 'docs',
    map: { id: 'key', title: 'title', subtitle: 'author_name[0]', tags: 'subject[:8]' },
    attribution: { text: 'Data from Open Library', url: 'https://openlibrary.org' },
  }),
  store: indexedDbStore({ name: 'swipeline' }),
})
```

The deck engine is headless; bindings are glue:

```ts
const store = createEngine({ deckId: 'books', actor: 'local', source: books.source })
store.subscribe(() => render(store.getSnapshot()))
store.dispatch({ type: 'swipe', action: 'like', cardId: current.id })
```

<p align="center">
  <img src="/brand/hero-phone.png" alt="A phone showing a browsable list of items" width="180" loading="lazy" />
</p>

## Where to go next

| If you want to | Read |
|---|---|
| Build a deck in ten minutes | [Quickstart](/getting-started/quickstart) |
| Understand how the pieces fit | [Architecture](/concepts/architecture) |
| Add a data source | [Write an adapter](/guides/write-an-adapter) |
| Change how cards are ranked | [Ranking](/concepts/ranking) and [Write a rank stage](/guides/write-a-rank-stage) |
| Add a framework binding | [Write a binding](/guides/write-a-binding) |
| Know exactly what the packages export | [Contracts](/architecture/contracts) |
| See what is decided and what is still open | [Decisions](/decisions/open-questions) |

<div class="icons8-callout">
  <img src="/brand/icons8/open-source-and-coding.png" alt="3D illustration of source code and open collaboration" width="168" height="168" loading="lazy">
  <div>
    <h2>Build the next layer with us</h2>
    <p>Swipeline is designed to be extended: add a source adapter, a card template, a rank stage, a binding or a docs fix.</p>
    <p class="icons8-callout-links"><a href="./contributing/">Contributor guide</a> · <a href="https://github.com/JoeyHammoth/Swipeline/issues?q=is%3Aopen+label%3A%22good+first+issue%22">Good first issues</a> · <a href="https://github.com/JoeyHammoth/Swipeline/discussions">Discussions</a></p>
  </div>
</div>

<p class="icons8-credit">Icons and illustration by <a href="https://icons8.com">Icons8</a>.</p>
