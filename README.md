# FleetOps — Web

Fleet operations app for a transport company: live vehicle map, trip dispatching,
maintenance, drivers and costs.

> Work in progress. Backend: [fleetops-api](https://github.com/PepsaCola/fleetops-api).

## Tech stack

**App:** React 19 · TypeScript 6 · Vite 8 · React Router 8 · TanStack Query / Table / Virtual ·
Tailwind CSS 4 · shadcn/ui · Zod 4 · React Hook Form · Zustand · MapLibre GL · Recharts · dnd-kit

**Tooling:** oxlint · Steiger (FSD linter) · Prettier · Vitest · Testing Library · MSW · Playwright

## Getting started

```bash
npm install
npm run dev
```

The dev server proxies `/api` to the backend at `http://localhost:3000`.

## API client

The typed client in `src/shared/api/generated` is generated from `openapi/openapi.json`, a
committed snapshot of the backend's OpenAPI contract, so builds and tests never need a running
backend. When the contract changes:

```bash
npm run api:pull   # refresh the snapshot from the backend dev server
npm run api:gen    # regenerate the client from the snapshot
```

`npm run api:pull -- <path>` reads the document from a file instead.
