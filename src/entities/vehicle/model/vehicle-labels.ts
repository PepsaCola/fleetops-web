import type { Vehicle } from '@/shared/api'

export type VehicleStatus = Vehicle['status']
export type VehicleType = Vehicle['type']

// Records, so a status or type the API adds later fails the typecheck until it gets a label
export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  active: 'Active',
  maintenance: 'In maintenance',
  inactive: 'Inactive',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  truck: 'Truck',
  van: 'Van',
  car: 'Car',
}
