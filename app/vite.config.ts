import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built assets resolve relatively when served from a
// GitHub Pages subpath / repo root.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
