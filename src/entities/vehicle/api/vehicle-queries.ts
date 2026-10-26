import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { listVehicles, type ListVehiclesData } from '@/shared/api'

export type VehicleListQuery = NonNullable<ListVehiclesData['query']>

/** Query keys and fetchers for vehicles. Invalidate every vehicle query with `vehicleQueries.all()`. */
export const vehicleQueries = {
  all: () => ['vehicles'] as const,
  lists: () => [...vehicleQueries.all(), 'list'] as const,
  list: (query: VehicleListQuery = {}) =>
    queryOptions({
      queryKey: [...vehicleQueries.lists(), query] as const,
      queryFn: ({ signal }) => listVehicles({ query, signal }),
      // Keep the current page on screen while the next one loads
      placeholderData: keepPreviousData,
    }),
}
