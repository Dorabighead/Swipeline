# Examples

Runnable demos that share one deck config across frameworks.

| Example | Binding | Source | Store | Status |
|---|---|---|---|---|
| [`books-react`](./books-react) | React | Open Library | IndexedDB | Built (M1) |
| [`recipes-react`](./recipes-react) | React | TheMealDB | memory | Built (M1) |
| [`papers-html`](./papers-html) | `<swipe-deck>` | arXiv | memory | Built (M2) |
| [`movies-tmdb`](./movies-tmdb) | `<swipe-deck>` | TMDB via a server-side key | memory | Built (M2) |
| [`conformance`](./conformance) | React + `<swipe-deck>` | fixture cards | memory | Test fixtures |
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

`movies-tmdb` needs a key that stays on the server:

```bash
TMDB_API_KEY=your-v3-key pnpm --filter ./examples/movies-tmdb dev
```

Its Vite middleware is a development stand-in for a backend route; the key never
enters the browser bundle.

## Browser conformance

`conformance` holds one fixture page per UI binding (`react.html`,
`element.html`). Each mounts its binding and exposes
`window.__swipelineConformance`, so Playwright can run the shared suite in
Chromium:

```bash
pnpm exec playwright install chromium   # once
pnpm e2e
```

`e2e.yml` runs this on binding-related pull requests, nightly and on demand. The
[status matrix](../docs/reference/binding-status.md) records the results.

## The rule that keeps the abstraction honest

**The deck config is shared, and a config change needed by only one framework is
a bug in the abstraction**, not a feature of that framework. Every deck is created
in [`shared/decks.ts`](./shared/decks.ts); the examples differ only in their
binding, source and store.

Examples are private workspace packages and are never published.
