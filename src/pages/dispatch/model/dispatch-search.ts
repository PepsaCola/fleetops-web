import { z } from 'zod'

import { zListTripsQuery } from '@/shared/contract'

/** The day on the board, kept in the URL: /dispatch?day=2026-10-28; today when left out */
export const DispatchSearchSchema = z.object({
  day: zListTripsQuery.shape.day.catch(undefined),
})
