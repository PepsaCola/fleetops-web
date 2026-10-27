import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { listDrivers, type ListDriversData } from '@/shared/api'

export type DriverListQuery = NonNullable<ListDriversData['query']>

/** Query keys and fetchers for drivers. Invalidate every driver query with `driverQueries.all()`. */
export const driverQueries = {
  all: () => ['drivers'] as const,
  lists: () => [...driverQueries.all(), 'list'] as const,
  list: (query: DriverListQuery = {}) =>
    queryOptions({
      queryKey: [...driverQueries.lists(), query] as const,
      queryFn: ({ signal }) => listDrivers({ query, signal }),
      // Keep the current page on screen while the next one loads
      placeholderData: keepPreviousData,
    }),
}
