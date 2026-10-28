import { z } from 'zod'

/**
 * How many days back the page looks, kept in the URL: /costs?days=7. Trips are planned a month
 * back at most, so a longer period would only add empty days.
 */
export const PERIOD_OPTIONS = ['7', '14', '30'] as const

export const CostsSearchSchema = z.object({
  days: z.enum(PERIOD_OPTIONS).catch('30'),
})
