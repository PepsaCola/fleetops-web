import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Early on most slices have a single consumer; merging them now would only be undone later
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // generated from backend's openapi.json — never edited by hand
    ignores: ['**/shared/api/generated/**'],
  },
])
