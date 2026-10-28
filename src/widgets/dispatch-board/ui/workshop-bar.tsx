import { WORK_ORDER_KIND_LABELS, type WorkOrder } from '@/entities/work-order'
import { fleetTime } from '@/shared/lib/fleet-time'

import { WORKSHOP_STRIPES } from '../config/bar-styles'

interface WorkshopBarProps {
  order: WorkOrder
  /** Position on the day's timeline, in percent */
  left: number
  width: number
}

/** Time a vehicle spends in the workshop: no trips for it then. */
export function WorkshopBar({ order, left, width }: WorkshopBarProps) {
  const kind = WORK_ORDER_KIND_LABELS[order.kind]
  const description = `Work order ${order.number}: ${kind.toLowerCase()} in the workshop, ${fleetTime(order.startsAt)}–${fleetTime(order.endsAt)}`

  return (
    <span
      title={description}
      style={{ left: `${left}%`, width: `${width}%`, ...WORKSHOP_STRIPES }}
      className="absolute inset-y-1.5 flex items-center overflow-hidden rounded-sm border border-dashed border-muted-foreground/60 bg-background px-1 text-xs text-muted-foreground"
    >
      {/* The short label is for the eye; screen readers get the whole description */}
      <span aria-hidden className="truncate">
        {kind}
      </span>
      <span className="sr-only">{description}</span>
    </span>
  )
}
