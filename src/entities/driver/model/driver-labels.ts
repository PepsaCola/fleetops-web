import type { Driver } from '@/shared/api'

export type DriverStatus = Driver['status']
export type DocumentState = Driver['documents']

// Records, so a state the API adds later fails the typecheck until it gets a label
export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  inactive: 'Inactive',
}

export const DOCUMENT_STATE_LABELS: Record<DocumentState, string> = {
  valid: 'Valid',
  expiring: 'Expiring',
  expired: 'Expired',
}
