import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      // A real origin, so relative API URLs like /api/v1/... resolve just like in the browser
      environmentOptions: { happyDOM: { url: 'http://localhost:5173' } },
      setupFiles: ['./src/shared/lib/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
)
