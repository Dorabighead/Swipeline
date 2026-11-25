# movies-tmdb

A movies deck from TMDB, rendered with `<swipe-deck>`.

TMDB's key must never reach a browser bundle, so this example puts the adapter
behind a dev-server route: `vite.config.ts` reads `TMDB_API_KEY` in Node, calls
`@swipeline/adapter-tmdb`, and returns already-normalized `Card`s to the page.
The page's source adapter only fetches `/api/tmdb/cards`.

```bash
TMDB_API_KEY=your-v3-key pnpm --filter ./examples/movies-tmdb dev
```

Without the variable, the deck renders the key error as a retryable deck error
instead of failing silently.

This middleware is a development stand-in. A deployed app needs the same route in
a real backend (or `@swipeline/server`); Vite's dev middleware does not run in a
production build.

Attribution is mandatory and is rendered on every card: "This product uses the
TMDB API but is not endorsed or certified by TMDB."
