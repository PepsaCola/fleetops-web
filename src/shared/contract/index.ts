// Zod schemas of the API contract, generated together with the client (npm run api:gen).
// They have their own entry rather than '@/shared/api': the app shell imports that one, and
// re-exporting the schemas there would load zod and build every schema before any page needs it.
export * from '../api/generated/zod.gen'
