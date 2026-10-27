import { z } from 'zod'

import { zListDriversQuery } from '@/shared/contract'

export const DRIVERS_PAGE_SIZE = 20

const query = zListDriversQuery.shape

/** Status and documents options, straight from the API contract */
export const DRIVER_STATUS_OPTIONS = query.status.unwrap().options
export const DOCUMENT_STATE_OPTIONS = query.documents.unwrap().options

/**
 * What the driver list shows, kept in the URL: /drivers?documents=expiring&sort=documentsExpireOn
 * Filters and sort options come from the API contract, so they follow it after `npm run api:gen`.
 */
export const DriverListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  sort: query.sort.catch('lastName'),
  // An empty or blank search means no search at all
  search: query.search.transform((value) => value?.trim() || undefined).catch(undefined),
  status: query.status.catch(undefined),
  documents: query.documents.catch(undefined),
})

export type DriverListSearch = z.infer<typeof DriverListSearchSchema>

export const isFiltered = (search: DriverListSearch) =>
  search.search !== undefined || search.status !== undefined || search.documents !== undefined
