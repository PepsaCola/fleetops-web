import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import {
  WORK_ORDER_KIND_LABELS,
  WorkOrderStatusBadge,
  workOrderQueries,
  workOrderTime,
  type WorkOrderStatus,
} from '@/entities/work-order'
import { CancelWorkOrderButton } from '@/features/cancel-work-order'
import { formatUah } from '@/shared/lib/money'
import { vehiclePath } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

interface WorkOrdersTableProps {
  from: string
  to: string
  status: WorkOrderStatus | undefined
  canEdit: boolean
}

export function WorkOrdersTable({ from, to, status, canEdit }: WorkOrdersTableProps) {
  const { data, error, isPending, refetch } = useQuery(workOrderQueries.list({ from, to, status }))

  if (error && !data) return <ErrorState error={error} onRetry={refetch} />

  if (isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (data.items.length === 0) {
    return (
      <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
        {status ? 'No work orders match this status.' : 'Nothing in the workshop these days.'}
      </p>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Work</TableHead>
            <TableHead>When</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Note</TableHead>
            {canEdit && (
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono font-medium">#{order.number}</TableCell>
              <TableCell className="font-mono">
                <Link to={vehiclePath(order.vehicle.id)} className="hover:underline">
                  {order.vehicle.plate}
                </Link>
              </TableCell>
              <TableCell>{WORK_ORDER_KIND_LABELS[order.kind]}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {workOrderTime(order)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatUah(order.costUah)}</TableCell>
              <TableCell>
                <WorkOrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">
                {order.note}
              </TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  {order.status === 'scheduled' && <CancelWorkOrderButton order={order} />}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
