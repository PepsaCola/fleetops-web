export type { Vehicle } from '@/shared/api'
export { vehicleQueries, type VehicleListQuery } from './api/vehicle-queries'
export {
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  type VehicleStatus,
  type VehicleType,
} from './model/vehicle-labels'
export { VehicleStatusBadge } from './ui/vehicle-status-badge'
