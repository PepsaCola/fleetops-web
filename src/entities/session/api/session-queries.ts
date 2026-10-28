import { queryOptions } from '@tanstack/react-query'

import { getCurrentUser, isApiError } from '@/shared/api'

export const sessionQueries = {
  all: () => ['session'] as const,
  /** The signed-in user, or null when nobody is; every page needs it, so it's fetched once and kept */
  me: () =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'me'] as const,
      queryFn: async ({ signal }) => {
        try {
          return await getCurrentUser({ signal })
        } catch (error) {
          // Not being signed in is an answer, not a failure
          if (isApiError(error) && error.status === 401) return null
          throw error
        }
      },
      staleTime: Infinity,
    }),
}
