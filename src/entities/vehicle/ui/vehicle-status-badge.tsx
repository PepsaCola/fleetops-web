import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '../model/vehicle-labels'

const TONES: Record<VehicleStatus, StatusTone> = {
  active: 'success',
  maintenance: 'warning',
  inactive: 'neutral',
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <StatusBadge tone={TONES[status]}>{VEHICLE_STATUS_LABELS[status]}</StatusBadge>
}
