import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { TRIP_STATUS_LABELS, type TripStatus } from '../model/trip-labels'

const TONES: Record<TripStatus, StatusTone> = {
  planned: 'neutral',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return <StatusBadge tone={TONES[status]}>{TRIP_STATUS_LABELS[status]}</StatusBadge>
}
