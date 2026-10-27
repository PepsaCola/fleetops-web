import { z } from 'zod'

import { zListVehiclesQuery } from '@/shared/contract'

export const VEHICLES_PAGE_SIZE = 20

const query = zListVehiclesQuery.shape

/** Status and type options, straight from the API contract */
export const VEHICLE_STATUS_OPTIONS = query.status.unwrap().options
export const VEHICLE_TYPE_OPTIONS = query.type.unwrap().options

/**
 * What the vehicle list shows, kept in the URL: /vehicles?search=volvo&status=active&page=2
 * Filters and sort options come from the API contract, so they follow it after `npm run api:gen`.
 */
export const VehicleListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  sort: query.sort.catch('plate'),
  // An empty or blank search means no search at all
  search: query.search.transform((value) => value?.trim() || undefined).catch(undefined),
  status: query.status.catch(undefined),
  type: query.type.catch(undefined),
})

export type VehicleListSearch = z.infer<typeof VehicleListSearchSchema>

export const isFiltered = (search: VehicleListSearch) =>
  search.search !== undefined || search.status !== undefined || search.type !== undefined
