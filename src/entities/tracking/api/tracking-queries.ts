import { queryOptions } from '@tanstack/react-query'

import { getFleetPositions, listTrackingRoutes } from '@/shared/api'

/** How often the map asks where the fleet is; the positions change every second */
export const POSITIONS_REFRESH_MS = 5_000

export const trackingQueries = {
  all: () => ['tracking'] as const,
  positions: () =>
    queryOptions({
      queryKey: [...trackingQueries.all(), 'positions'] as const,
      queryFn: ({ signal }) => getFleetPositions({ signal }),
      // Polling pauses on its own while the tab is in the background
      refetchInterval: POSITIONS_REFRESH_MS,
    }),
  routes: () =>
    queryOptions({
      queryKey: [...trackingQueries.all(), 'routes'] as const,
      // The browser may keep a copy from before the last deploy, so it checks with the API first;
      // an unchanged copy costs an empty 304
      queryFn: ({ signal }) => listTrackingRoutes({ signal, cache: 'no-cache' }),
      // Routes only change with a deploy
      staleTime: Infinity,
    }),
}
