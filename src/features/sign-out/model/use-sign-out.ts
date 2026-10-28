import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sessionQueries } from '@/entities/session'
import { logout } from '@/shared/api'

/** Signs out of this browser. */
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    // Even when the API can't be reached, this browser forgets the user and everything fetched
    // for them; the app shell then shows the login page
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(sessionQueries.me().queryKey, null)
    },
  })
}
