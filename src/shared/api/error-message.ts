import { isApiError } from './api-error'

/** A message that is safe to show to the user for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.problem.detail ?? error.problem.title

  // fetch() rejects with a TypeError when the server can't be reached at all
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return "Can't reach the server. Check your connection and try again."
  }

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
