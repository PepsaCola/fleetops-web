import type { WorkOrder } from '@/shared/api'

export type WorkOrderKind = WorkOrder['kind']
export type WorkOrderStatus = WorkOrder['status']

// Records, so a value the API adds later fails the typecheck until it gets a label
export const WORK_ORDER_KIND_LABELS: Record<WorkOrderKind, string> = {
  service: 'Service',
  repair: 'Repair',
  inspection: 'Inspection',
  tyres: 'Tyres',
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In the workshop',
  done: 'Done',
  cancelled: 'Cancelled',
}
