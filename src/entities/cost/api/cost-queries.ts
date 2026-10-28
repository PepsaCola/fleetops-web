import { queryOptions } from '@tanstack/react-query'

import { getCostReport, type GetCostReportData } from '@/shared/api'

export type CostQuery = GetCostReportData['query']

export const costQueries = {
  all: () => ['costs'] as const,
  /** What the fleet spent over some days, by day and by vehicle */
  report: (query: CostQuery) =>
    queryOptions({
      queryKey: [...costQueries.all(), 'report', query] as const,
      queryFn: ({ signal }) => getCostReport({ query, signal }),
    }),
}
