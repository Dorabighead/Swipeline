# Examples

Runnable demos that share one deck config across frameworks.

| Example | Binding | Source | Store | Status |
|---|---|---|---|---|
| [`books-react`](./books-react) | React | Open Library | IndexedDB | Built (M1) |
| [`recipes-react`](./recipes-react) | React | TheMealDB | memory | Built (M1) |
| [`papers-html`](./papers-html) | `<swipe-deck>` | arXiv | memory | Built (M2) |
| `books-vue` | Vue | Open Library | IndexedDB | M4 |
| `books-svelte` | Svelte | Open Library | IndexedDB | M4 |
| `books-expo` | React Native / Expo | Open Library | AsyncStorage | M4 |

## Run one

```bash
pnpm install
pnpm --filter ./examples/books-react dev
```

Vite resolves the workspace packages from source (`examples/vite.shared.ts`), so
`pnpm build` is not a prerequisite and an edit in `packages/**` reloads the demo.
`pnpm examples:typecheck` and `pnpm examples:build` are the repo-wide checks, and
CI runs both.

## The rule that keeps the abstraction honest

**The deck config is shared, and a config change needed by only one framework is
a bug in the abstraction**, not a feature of that framework. Every deck is created
in [`shared/decks.ts`](./shared/decks.ts); the examples differ only in their
binding and store.

TMDB has no example because its adapter needs an API key that must never ship in
a browser bundle; the adapter README shows the server-side setup.

Examples are private workspace packages and are never published. The Playwright
suite from the plan (`e2e.yml`) is not wired yet; until it is, these apps are
covered by a typecheck and a production build.
