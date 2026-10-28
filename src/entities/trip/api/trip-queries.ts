import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { listTrips, type ListTripsData } from '@/shared/api'
import { addDays, fleetDayStart } from '@/shared/lib/fleet-time'

export type TripListQuery = NonNullable<ListTripsData['query']>

/** A trip's status follows the clock, so trip lists refresh themselves this often */
const TRIPS_REFRESH_MS = 60_000
/** The most trips the API returns at once */
const MAX_PAGE_SIZE = 100

/** Every trip leaving on `day`, fetched page after page */
async function listWholeDay(day: string, signal: AbortSignal) {
  const first = await listTrips({ query: { day, pageSize: MAX_PAGE_SIZE }, signal })
  const pageCount = Math.ceil(first.total / MAX_PAGE_SIZE)
  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      listTrips({ query: { day, pageSize: MAX_PAGE_SIZE, page: index + 2 }, signal }),
    ),
  )
  return [first, ...rest].flatMap((page) => page.items)
}

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
  /** Every trip on the road during `day`: those leaving that day, and night runs from the day before */
  day: (day: string) =>
    queryOptions({
      queryKey: [...tripQueries.all(), 'day', day] as const,
      queryFn: async ({ signal }) => {
        const [before, during] = await Promise.all([
          listWholeDay(addDays(day, -1), signal),
          listWholeDay(day, signal),
        ])
        const dayStarts = fleetDayStart(day).getTime()
        return [...before.filter((trip) => Date.parse(trip.returnsAt) > dayStarts), ...during]
      },
      refetchInterval: TRIPS_REFRESH_MS,
    }),
}
