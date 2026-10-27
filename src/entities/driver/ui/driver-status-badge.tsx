import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { DRIVER_STATUS_LABELS, type DriverStatus } from '../model/driver-labels'

const TONES: Record<DriverStatus, StatusTone> = {
  active: 'success',
  on_leave: 'warning',
  inactive: 'neutral',
}

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return <StatusBadge tone={TONES[status]}>{DRIVER_STATUS_LABELS[status]}</StatusBadge>
}
