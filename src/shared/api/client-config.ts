import { toApiError } from './api-error'
import type { CreateClientConfig } from './generated/client.gen'
import { NetworkError } from './network-error'

// Every generated SDK call goes through this fetch, so a failed request always rejects with
// one of our errors: ApiError when the server answered with an error, NetworkError when it
// couldn't be reached. Browsers word network failures differently ("Failed to fetch",
// "Load failed"), so the message alone can't be trusted to tell them apart.
const fetchOrThrow: typeof fetch = async (input, init) => {
  let response: Response
  try {
    response = await fetch(input, init)
  } catch (error) {
    // A cancelled request (TanStack Query aborts queries nobody needs any more) is not a failure
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new NetworkError({ cause: error })
  }

  if (!response.ok) throw await toApiError(response)
  return response
}

/** Called by the generated client when it is created (runtimeConfigPath in openapi-ts.config.ts). */
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  fetch: fetchOrThrow,
})
