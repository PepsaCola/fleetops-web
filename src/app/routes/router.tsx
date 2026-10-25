import { createBrowserRouter } from 'react-router'

import { paths, type RouteHandle } from '@/shared/routes'

import { AppShell } from '../layouts/app-shell'
import { HydrateFallback } from './hydrate-fallback'
import { RouteErrorBoundary } from './route-error-boundary'

const handle = (title: string): RouteHandle => ({ title })

// Every page is a lazy chunk: the bundle for a module loads only when it is opened
export const router = createBrowserRouter([
  {
    HydrateFallback,
    // Last resort: the shell itself or the login page failed
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: paths.login,
        lazy: () => import('@/pages/login').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: paths.dashboard,
        Component: AppShell,
        children: [
          {
            // A crashing page is replaced by the error screen while the sidebar and header stay
            ErrorBoundary: RouteErrorBoundary,
            children: [
              {
                index: true,
                handle: handle('Dashboard'),
                lazy: () =>
                  import('@/pages/dashboard').then((m) => ({ Component: m.DashboardPage })),
              },
              {
                path: paths.liveMap,
                handle: handle('Live map'),
                lazy: () => import('@/pages/live-map').then((m) => ({ Component: m.LiveMapPage })),
              },
              {
                path: paths.trips,
                handle: handle('Trips'),
                lazy: () => import('@/pages/trips').then((m) => ({ Component: m.TripsPage })),
              },
              {
                path: paths.dispatch,
                handle: handle('Dispatch'),
                lazy: () => import('@/pages/dispatch').then((m) => ({ Component: m.DispatchPage })),
              },
              {
                path: paths.vehicles,
                handle: handle('Vehicles'),
                lazy: () => import('@/pages/vehicles').then((m) => ({ Component: m.VehiclesPage })),
              },
              {
                path: paths.maintenance,
                handle: handle('Maintenance'),
                lazy: () =>
                  import('@/pages/maintenance').then((m) => ({ Component: m.MaintenancePage })),
              },
              {
                path: paths.drivers,
                handle: handle('Drivers'),
                lazy: () => import('@/pages/drivers').then((m) => ({ Component: m.DriversPage })),
              },
              {
                path: paths.costs,
                handle: handle('Costs'),
                lazy: () => import('@/pages/costs').then((m) => ({ Component: m.CostsPage })),
              },
              {
                path: paths.settings,
                handle: handle('Settings'),
                lazy: () => import('@/pages/settings').then((m) => ({ Component: m.SettingsPage })),
              },
              {
                path: '*',
                handle: handle('Page not found'),
                lazy: () =>
                  import('@/pages/not-found').then((m) => ({ Component: m.NotFoundPage })),
              },
            ],
          },
        ],
      },
    ],
  },
])
