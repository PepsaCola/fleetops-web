export type { FleetPositions, TrackingRoute, VehiclePosition } from '@/shared/api'
export { POSITIONS_REFRESH_MS, trackingQueries } from './api/tracking-queries'
export {
  ACTIVITY_LABELS,
  countByMotion,
  MOTION_LABELS,
  motionOf,
  type Activity,
  type Motion,
} from './model/activity'
