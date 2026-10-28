import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { sessionQueries } from '@/entities/session'
import { getErrorMessage, isApiError } from '@/shared/api'

const MAX_RETRIES = 2

/** A 401 mid-session means the session has ended: it expired, or the user signed out elsewhere */
const sessionEnded = (error: unknown) => isApiError(error) && error.status === 401

/** Forgets the user; the app shell then shows the login page, which leads back here */
function endSession() {
  queryClient.setQueryData(sessionQueries.me().queryKey, null)
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (sessionEnded(error)) return endSession()
      // A failed first load is shown in place by the page; only failed background refreshes toast
      if (query.state.data !== undefined) toast.error(getErrorMessage(error))
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (sessionEnded(error)) return endSession()
      // Mutations with their own onError (e.g. forms showing field errors) handle it themselves
      if (mutation.options.onError) return
      toast.error(getErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // A 4xx won't fix itself on retry; network errors and 5xx might
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && !(isApiError(error) && error.status < 500),
    },
  },
})
