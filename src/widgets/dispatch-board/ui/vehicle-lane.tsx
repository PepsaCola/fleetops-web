import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

import type { Vehicle } from '@/entities/vehicle'
import { cn } from '@/shared/lib/utils'

// Hour lines behind the bars. A day when the clocks change is still drawn as 24 even hours.
const HOUR_GRID = {
  backgroundImage: 'linear-gradient(to right, var(--border) 1px, transparent 1px)',
  backgroundSize: `${100 / 24}% 100%`,
}

interface VehicleLaneProps {
  vehicle: Vehicle
  /** A click on an empty spot, with how far across the lane it landed (0 to 1); no clicks without it */
  onPick?: (share: number) => void
  children: ReactNode
}

/** A vehicle's stretch of the day: a trip dropped here moves onto this vehicle, a click on an empty spot books one. */
export function VehicleLane({ vehicle, onPick, children }: VehicleLaneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: vehicle.id, data: { vehicle } })

  return (
    <div
      ref={setNodeRef}
      className={cn('relative flex-1', isOver && 'bg-accent/60')}
      style={HOUR_GRID}
    >
      {onPick && (
        // Behind the bars, so it only catches clicks on empty time. Out of the tab order:
        // keyboard users book with the New trip button instead.
        <button
          type="button"
          tabIndex={-1}
          aria-label={`New trip for ${vehicle.plate}`}
          className="absolute inset-0 cursor-cell"
          onClick={(event) => {
            const lane = event.currentTarget.getBoundingClientRect()
            onPick((event.clientX - lane.left) / lane.width)
          }}
        />
      )}
      {children}
    </div>
  )
}
