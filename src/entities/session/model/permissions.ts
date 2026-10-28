import { useQuery } from '@tanstack/react-query'

import type { CurrentUser } from '@/shared/api'

import { sessionQueries } from '../api/session-queries'

/**
 * Dispatchers change trips; viewers only look. The API enforces the same rule, so this only
 * hides what a viewer couldn't use anyway.
 */
export const canEdit = (user: CurrentUser | null | undefined) => user?.role === 'dispatcher'

/** Whether the signed-in user may change things; false while that isn't known yet. */
export function useCanEdit() {
  const { data: user } = useQuery(sessionQueries.me())
  return canEdit(user)
}
