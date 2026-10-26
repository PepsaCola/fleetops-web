import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '../model/vehicle-labels'

const DOT_COLORS: Record<VehicleStatus, string> = {
  active: 'bg-emerald-500',
  maintenance: 'bg-amber-500',
  inactive: 'bg-muted-foreground/50',
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge variant="outline">
      <span aria-hidden className={cn('size-1.5 rounded-full', DOT_COLORS[status])} />
      {VEHICLE_STATUS_LABELS[status]}
    </Badge>
  )
}
