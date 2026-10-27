export type { Trip } from '@/shared/api'
export { tripQueries, type TripListQuery } from './api/trip-queries'
export {
  ROUTE_KIND_LABELS,
  TRIP_STATUS_LABELS,
  type RouteKind,
  type TripStatus,
} from './model/trip-labels'
export { TripStatusBadge } from './ui/trip-status-badge'
