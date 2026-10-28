import { z } from 'zod'

import { zWorkOrder } from '@/shared/contract'

/** How many days the page shows, starting from the day picked */
export const PERIOD_DAYS = 14

/** Status options, straight from the API contract */
export const WORK_ORDER_STATUS_OPTIONS = zWorkOrder.shape.status.options

/** What the page shows, kept in the URL: /maintenance?from=2026-11-02&status=scheduled */
export const MaintenanceSearchSchema = z.object({
  from: z.iso.date().optional().catch(undefined),
  status: zWorkOrder.shape.status.optional().catch(undefined),
})

export type MaintenanceSearch = z.infer<typeof MaintenanceSearchSchema>
