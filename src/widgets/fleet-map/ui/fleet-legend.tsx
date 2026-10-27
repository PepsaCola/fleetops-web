import { format, parseISO } from 'date-fns'

import {
  countByMotion,
  MOTION_LABELS,
  type Motion,
  type VehiclePosition,
} from '@/entities/tracking'

import { MOTION_COLORS } from '../config/map-layers'

const MOTIONS: Motion[] = ['moving', 'standing', 'off_duty']

interface FleetLegendProps {
  vehicles: VehiclePosition[]
  /** When the positions are for, from the API */
  updatedAt: string | undefined
}

/** How many vehicles are moving, standing or off duty, and how fresh the positions are. */
export function FleetLegend({ vehicles, updatedAt }: FleetLegendProps) {
  const counts = countByMotion(vehicles)

  return (
    <div className="pointer-events-none absolute top-3 left-3 rounded-lg border bg-background/90 px-3 py-2 text-sm shadow-sm backdrop-blur">
      <ul className="space-y-1">
        {MOTIONS.map((motion) => (
          <li key={motion} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ backgroundColor: MOTION_COLORS[motion] }}
            />
            <span className="flex-1">{MOTION_LABELS[motion]}</span>
            <span className="font-medium tabular-nums">{counts[motion]}</span>
          </li>
        ))}
      </ul>
      {updatedAt && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Updated {format(parseISO(updatedAt), 'HH:mm:ss')}
        </p>
      )}
    </div>
  )
}
