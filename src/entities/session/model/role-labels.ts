import type { CurrentUser } from '@/shared/api'

export type UserRole = CurrentUser['role']

// A Record, so a role the API adds later fails the typecheck until it gets a label
export const ROLE_LABELS: Record<UserRole, string> = {
  dispatcher: 'Dispatcher',
  viewer: 'Viewer',
}
