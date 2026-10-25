import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getErrorMessage, isApiError } from '@/shared/api'

const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // A failed first load is shown in place by the page; only failed background refreshes toast
      if (query.state.data !== undefined) toast.error(getErrorMessage(error))
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
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
