import { defineConfig } from 'vite'
import { workspaceAliases } from '../vite.shared'

export default defineConfig({
  resolve: { alias: workspaceAliases },
})
