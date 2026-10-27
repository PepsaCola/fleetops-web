import type { Trip } from '@/shared/api'

export type TripStatus = Trip['status']
export type RouteKind = Trip['route']['kind']

// Records, so a value the API adds later fails the typecheck until it gets a label
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ROUTE_KIND_LABELS: Record<RouteKind, string> = {
  local: 'Local delivery',
  regional: 'Regional run',
}
