import { useEffect, useMemo, useRef } from 'react'

import { ACTIVITY_LABELS, motionOf, type VehiclePosition } from '@/entities/tracking'
import { cn } from '@/shared/lib/utils'

import { MOTION_COLORS } from '../config/map-layers'

interface FleetListProps {
  vehicles: VehiclePosition[]
  selectedId: string | null
  onSelect: (vehicle: VehiclePosition) => void
  className?: string
}

/** Every vehicle with what it's doing; picking one shows it on the map. */
export function FleetList({ vehicles, selectedId, onSelect, className }: FleetListProps) {
  const listRef = useRef<HTMLUListElement>(null)
  // By plate, so rows stay put while the vehicles change what they're doing
  const sorted = useMemo(
    () => [...vehicles].sort((a, b) => a.plate.localeCompare(b.plate)),
    [vehicles],
  )

  // A vehicle picked on the map scrolls into view here; only the list scrolls, never the page
  useEffect(() => {
    const list = listRef.current
    const row = selectedId ? list?.querySelector('[aria-current="true"]') : null
    if (!list || !row) return

    const listBox = list.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    if (rowBox.top < listBox.top) list.scrollTop -= listBox.top - rowBox.top
    else if (rowBox.bottom > listBox.bottom) list.scrollTop += rowBox.bottom - listBox.bottom
  }, [selectedId])

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border', className)}>
      <h2 className="flex items-baseline justify-between border-b px-3 py-2 text-sm font-medium">
        Vehicles
        <span className="text-muted-foreground tabular-nums">{vehicles.length}</span>
      </h2>
      <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        {sorted.map((vehicle) => (
          <li key={vehicle.vehicleId}>
            <button
              type="button"
              aria-current={vehicle.vehicleId === selectedId ? 'true' : undefined}
              onClick={() => onSelect(vehicle)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                vehicle.vehicleId === selectedId && 'bg-muted',
              )}
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: MOTION_COLORS[motionOf(vehicle.activity)] }}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono font-medium">{vehicle.plate}</span>
                <span className="block truncate text-muted-foreground">
                  {ACTIVITY_LABELS[vehicle.activity]}
                </span>
              </span>
              {vehicle.speedKmh > 0 && (
                <span className="text-muted-foreground tabular-nums">{vehicle.speedKmh} km/h</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
