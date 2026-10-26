import { z } from 'zod'

import { zListVehiclesQuery } from '@/shared/contract'

export const VEHICLES_PAGE_SIZE = 20

const query = zListVehiclesQuery.shape

/**
 * What the vehicle list shows, kept in the URL: /vehicles?page=2&sort=-odometerKm
 * Sort options come from the API contract, so a new one appears here after `npm run api:gen`.
 */
export const VehicleListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  sort: query.sort.catch('plate'),
})

export type VehicleListSearch = z.infer<typeof VehicleListSearchSchema>
