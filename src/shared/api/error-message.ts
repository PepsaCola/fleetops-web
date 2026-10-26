import { isApiError } from './api-error'
import { isNetworkError } from './network-error'

/** A message that is safe to show to the user for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.problem.detail ?? error.problem.title

  if (isNetworkError(error)) return "Can't reach the server. Check your connection and try again."

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
