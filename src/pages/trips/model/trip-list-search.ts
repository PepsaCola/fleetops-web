import { z } from 'zod'

import { zListTripsQuery } from '@/shared/contract'

export const TRIPS_PAGE_SIZE = 20

const query = zListTripsQuery.shape

/** Status options, straight from the API contract */
export const TRIP_STATUS_OPTIONS = query.status.unwrap().options

/**
 * What the trip list shows, kept in the URL: /trips?day=2026-10-28&status=in_progress
 * Without a day it shows today's trips, by the fleet's (Kyiv) calendar.
 */
export const TripListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  sort: query.sort.catch('departsAt'),
  day: query.day.catch(undefined),
  status: query.status.catch(undefined),
})

export type TripListSearch = z.infer<typeof TripListSearchSchema>

export const isFiltered = (search: TripListSearch) => search.status !== undefined
