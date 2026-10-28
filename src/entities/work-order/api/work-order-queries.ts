import { queryOptions } from '@tanstack/react-query'

import { listWorkOrders, type ListWorkOrdersData } from '@/shared/api'

export type WorkOrderListQuery = ListWorkOrdersData['query']

/** A work order's status follows the clock, so lists refresh themselves this often */
const WORK_ORDERS_REFRESH_MS = 60_000

/** Query keys and fetchers for work orders. Invalidate every one with `workOrderQueries.all()`. */
export const workOrderQueries = {
  all: () => ['work-orders'] as const,
  lists: () => [...workOrderQueries.all(), 'list'] as const,
  list: (query: WorkOrderListQuery) =>
    queryOptions({
      queryKey: [...workOrderQueries.lists(), query] as const,
      queryFn: ({ signal }) => listWorkOrders({ query, signal }),
      refetchInterval: WORK_ORDERS_REFRESH_MS,
    }),
  /** The work orders touching one day: the dispatch board and the booking form show them */
  day: (day: string) => workOrderQueries.list({ from: day, to: day }),
}
