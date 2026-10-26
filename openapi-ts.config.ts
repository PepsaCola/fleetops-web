import { defineConfig } from '@hey-api/openapi-ts'

// Generates the typed API client from the committed snapshot of the backend's contract.
// Run `npm run api:gen` after `npm run api:pull`; never edit the output by hand.
export default defineConfig({
  input: './openapi/openapi.json',
  output: { path: './src/shared/api/generated' },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      // Our fetch wrapper: failed requests reject with ApiError or NetworkError
      runtimeConfigPath: './src/shared/api/client-config',
      throwOnError: true,
    },
    '@hey-api/typescript',
    // Zod schemas of every DTO and query: URL state and forms are validated against the contract
    'zod',
    // SDK functions resolve with the response body itself: listVehicles() → VehiclePage
    { name: '@hey-api/sdk', responseStyle: 'data' },
  ],
})
