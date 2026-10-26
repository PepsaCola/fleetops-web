/** The request never got a response: the server is down or the device is offline. */
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super("Can't reach the server", options)
    this.name = 'NetworkError'
  }
}

export const isNetworkError = (error: unknown): error is NetworkError =>
  error instanceof NetworkError
