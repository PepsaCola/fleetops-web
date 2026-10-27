import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { listTrips, type ListTripsData } from '@/shared/api'

export type TripListQuery = NonNullable<ListTripsData['query']>

/** A trip's status follows the clock, so trip lists refresh themselves this often */
const TRIPS_REFRESH_MS = 60_000

/** Query keys and fetchers for trips. Invalidate every trip query with `tripQueries.all()`. */
export const tripQueries = {
  all: () => ['trips'] as const,
  lists: () => [...tripQueries.all(), 'list'] as const,
  list: (query: TripListQuery = {}) =>
    queryOptions({
      queryKey: [...tripQueries.lists(), query] as const,
      queryFn: ({ signal }) => listTrips({ query, signal }),
      // Keep the current page on screen while the next one loads
      placeholderData: keepPreviousData,
      refetchInterval: TRIPS_REFRESH_MS,
    }),
}
