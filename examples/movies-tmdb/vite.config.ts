import { createTmdbAdapter } from '@swipeline/adapter-tmdb'
import type { Card } from '@swipeline/core'
import { defineConfig, type Plugin } from 'vite'
import { workspaceAliases } from '../vite.shared'

const GENRES: Readonly<Record<number, string>> = {
  18: 'Drama',
  28: 'Action',
  35: 'Comedy',
  878: 'Science Fiction',
}

/**
 * Dev-only stand-in for the backend you would deploy. The TMDB key is read here,
 * in Node, and never reaches the browser bundle. In production this route is your
 * own server (or `@swipeline/server`), not Vite's dev middleware.
 */
function tmdbProxy(): Plugin {
  return {
    name: 'swipeline-tmdb-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tmdb/cards', async (req, res) => {
        res.setHeader('content-type', 'application/json')
        const key = process.env.TMDB_API_KEY
        if (!key) {
          res.statusCode = 501
          res.end(JSON.stringify({ error: 'Set TMDB_API_KEY before starting this example.' }))
          return
        }

        const url = new URL(req.url ?? '/', 'http://localhost')
        const query = url.searchParams.get('query')?.trim()
        const cursor = url.searchParams.get('cursor') ?? undefined
        const adapter = createTmdbAdapter({ apiKey: key, genres: GENRES })

        try {
          const page = await adapter.fetch({
            ...(cursor === undefined ? {} : { cursor }),
            ...(query ? { query } : {}),
          })
          const cards = page.items
            .map((row) => adapter.normalize(row))
            .filter((card): card is Card => card !== null)
          const body =
            page.nextCursor === undefined ? { cards } : { cards, nextCursor: page.nextCursor }
          res.end(JSON.stringify(body))
        } catch (cause) {
          res.statusCode = 502
          const message = cause instanceof Error ? cause.message : 'TMDB request failed'
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [tmdbProxy()],
  resolve: { alias: workspaceAliases },
})
