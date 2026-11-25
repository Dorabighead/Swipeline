import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { workspaceAliases } from '../vite.shared'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: workspaceAliases },
})
