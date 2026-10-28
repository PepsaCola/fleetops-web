# FleetOps — Web

[![CI](https://github.com/PepsaCola/fleetops-web/actions/workflows/ci.yml/badge.svg)](https://github.com/PepsaCola/fleetops-web/actions/workflows/ci.yml)

Fleet operations for a transport company: a live map of the fleet, a dispatch board to plan
trips by dragging them around, and the vehicles and drivers behind it all.

**[Live demo](https://fleetops-web-eight.vercel.app/)** · [API docs](https://fleetops-api-nine.vercel.app/docs) ·
Backend: [fleetops-api](https://github.com/PepsaCola/fleetops-api)

Sign in with one click on the login page, or by hand:

| Role       | Email                      | Password        | Can                            |
| ---------- | -------------------------- | --------------- | ------------------------------ |
| Dispatcher | `dispatcher@fleetops.demo` | `fleetops-demo` | plan, move and cancel trips    |
| Viewer     | `viewer@fleetops.demo`     | `fleetops-demo` | see everything, change nothing |

## What it does

- **Live map** — every vehicle on a MapLibre map, gliding between the 5-second position updates.
  A list beside the map flies to the vehicle you pick.
- **Dispatch board** — a Gantt timeline with a row per vehicle:
  - drag a trip to another time (in 15-minute steps) or onto another vehicle;
  - click empty time in a row to book a trip there;
  - the booking form shows who is free when, the return time, and the next free slot when
    something clashes;
  - every change shows at once and rolls back if the API refuses it.
- **Trips** — the trips of any day with their status, which follows the clock.
- **Vehicles and drivers** — server-side search, filters, sorting and paging, all kept in the
  URL. Drivers show the state of their licence and medical certificate.
- **Sign-in and roles** — dispatchers change things; viewers see the same app without the
  controls. The API enforces the same rules.

Times are Kyiv time wherever the viewer is, because that's where the fleet runs.

## How it's built

- **Contract first.** The typed API client and Zod schemas in `src/shared/api/generated` are
  generated from `openapi/openapi.json`, a committed snapshot of the backend's OpenAPI document.
  Builds and tests never need a running backend, and CI fails if the client drifts from the
  snapshot.
- **Feature-Sliced Design** — `app` → `pages` → `widgets` → `features` → `entities` → `shared`,
  each layer importing only from the ones below, checked by Steiger.
- **Server state in TanStack Query** — query keys per entity, optimistic updates with rollback
  for moving trips, and a global handler that sends the user to sign in when a session ends.
- **Tests with MSW** — components are tested against a mocked API, the same way the app talks
  to the real one.

## Tech stack

**App:** React 19 · TypeScript 6 · Vite 8 · React Router 8 · TanStack Query & Table ·
Tailwind CSS 4 · shadcn/ui · Zod 4 · React Hook Form · Zustand · MapLibre GL (react-map-gl,
OpenFreeMap tiles) · dnd-kit · date-fns · Sonner

**Tooling:** @hey-api/openapi-ts · oxlint · Steiger · Prettier · Vitest · Testing Library ·
MSW · GitHub Actions · Vercel

## Getting started

Start the [backend](https://github.com/PepsaCola/fleetops-api) first, then:

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173 and proxies `/api` to the backend at
http://localhost:3000. In production, Vercel rewrites `/api` to the API, so the session cookie
stays first-party.

## Project structure

```
src/
  app/        providers, router (with the sign-in guard), layouts
  pages/      one folder per route: dashboard, live-map, trips, dispatch, vehicles, drivers…
  widgets/    big blocks of a page: fleet-map, dispatch-board, app-sidebar, app-header
  features/   user actions: create-trip, move-trip, cancel-trip, switch-theme
  entities/   business objects with their queries and labels: trip, vehicle, driver, session…
  shared/     API client, UI kit, helpers (fleet time, tables, URL state), test setup
```

## Scripts

| Script             | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Start the dev server                                   |
| `npm run build`    | Type-check and build for production                    |
| `npm test`         | Run the tests                                          |
| `npm run check`    | Type-check, lint, FSD rules, format check and tests    |
| `npm run api:pull` | Refresh the contract snapshot from the running backend |
| `npm run api:gen`  | Regenerate the API client from the snapshot            |

`npm run api:pull -- <path>` reads the contract from a file instead.
