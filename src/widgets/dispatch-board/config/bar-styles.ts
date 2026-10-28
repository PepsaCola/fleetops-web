import type { TripStatus } from '@/entities/trip'

// The same colours as the status badges and the live map: grey waits, blue moves, green is done
export const BAR_STYLES: Record<TripStatus, string> = {
  planned: 'border-muted-foreground/40 bg-muted text-foreground',
  in_progress: 'border-blue-600 bg-blue-600/20 text-foreground',
  completed: 'border-emerald-500/60 bg-emerald-500/15 text-muted-foreground',
  cancelled: 'border-dashed border-muted-foreground/40 text-muted-foreground',
}

/** The statuses a trip on the board can have; cancelled trips stay off it */
export const BOARD_STATUSES = ['planned', 'in_progress', 'completed'] as const

// Diagonal stripes tell time in the workshop apart from trips at a glance, in either theme
// and without relying on colour
export const WORKSHOP_STRIPES = {
  backgroundImage:
    'repeating-linear-gradient(135deg, color-mix(in oklab, var(--muted-foreground) 22%, transparent) 0 5px, transparent 5px 10px)',
}
