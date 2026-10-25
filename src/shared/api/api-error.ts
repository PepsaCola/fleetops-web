/** RFC 9457 Problem Details — the error body every FleetOps API endpoint returns. */
export interface ProblemDetails {
  type?: string
  title: string
  status: number
  detail?: string
  /** Machine-readable reason, e.g. TRIP_CONFLICT */
  code?: string
  /** Field-level validation messages keyed by field name */
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly problem: ProblemDetails

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title)
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.code
    this.problem = problem
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    'status' in value &&
    typeof value.title === 'string' &&
    typeof value.status === 'number'
  )
}

/** Turns a failed response into an ApiError, whether or not the server sent Problem Details. */
export async function toApiError(response: Response): Promise<ApiError> {
  const fallback: ProblemDetails = {
    title: response.statusText || 'Request failed',
    status: response.status,
  }
  if (!response.headers.get('content-type')?.includes('json')) return new ApiError(fallback)

  try {
    const body: unknown = await response.json()
    return new ApiError(isProblemDetails(body) ? body : fallback)
  } catch {
    return new ApiError(fallback)
  }
}
