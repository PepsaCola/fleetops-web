import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_ORIGIN = 'localhost:3000'

// Libraries every page needs get their own long-lived chunks, so a deploy that only changes
// app code doesn't make users re-download them. Page-specific libraries (map, charts) are left
// out on purpose: they stay in the lazy chunk of the page that uses them.
const vendorChunks = [
  { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/ },
  { name: 'vendor-ui', test: /node_modules[\\/](radix-ui|@radix-ui|lucide-react|sonner|cn)[\\/]/ },
  { name: 'vendor-query', test: /node_modules[\\/]@tanstack[\\/]/ },
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': `http://${API_ORIGIN}`,
      '/ws': { target: `ws://${API_ORIGIN}`, ws: true },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: { groups: vendorChunks },
      },
    },
  },
})
