import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { WORK_ORDER_STATUS_LABELS, type WorkOrderStatus } from '../model/work-order-labels'

const TONES: Record<WorkOrderStatus, StatusTone> = {
  scheduled: 'neutral',
  in_progress: 'warning',
  done: 'success',
  cancelled: 'danger',
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return <StatusBadge tone={TONES[status]}>{WORK_ORDER_STATUS_LABELS[status]}</StatusBadge>
}
