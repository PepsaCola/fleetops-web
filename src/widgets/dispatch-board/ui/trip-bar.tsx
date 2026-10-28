import { useDraggable } from '@dnd-kit/core'

import { TRIP_STATUS_LABELS, type Trip } from '@/entities/trip'
import { fleetTime } from '@/shared/lib/fleet-time'
import { cn } from '@/shared/lib/utils'

import { BAR_STYLES } from '../config/bar-styles'

interface TripBarProps {
  trip: Trip
  /** Position on the day's timeline, in percent */
  left: number
  width: number
  /** Whether it can be dragged to another time or vehicle: planned, and the user may change trips */
  movable: boolean
  onSelect: (trip: Trip) => void
}

/** A trip on the board, from leaving the depot to being back; its number shows when there's room. */
export function TripBar({ trip, left, width, movable, onSelect }: TripBarProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: trip.id,
    data: { trip },
    disabled: !movable,
  })
  const times = `${fleetTime(trip.departsAt)}–${fleetTime(trip.returnsAt)}`

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Trip ${trip.number}: ${trip.route.name}, ${times}, ${TRIP_STATUS_LABELS[trip.status].toLowerCase()}`}
      onClick={() => onSelect(trip)}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        'absolute inset-y-1.5 min-w-1 overflow-hidden rounded-sm border px-1 text-left text-xs outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring',
        BAR_STYLES[trip.status],
        movable && 'cursor-grab touch-none',
        isDragging && 'z-20 cursor-grabbing shadow-lg ring-2 ring-ring',
      )}
    >
      <span className="font-mono">#{trip.number}</span>
    </button>
  )
}
