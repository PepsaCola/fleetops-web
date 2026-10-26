import { describe, expect, it } from 'vitest'

import { ApiError } from './api-error'
import { getErrorMessage } from './error-message'
import { NetworkError } from './network-error'

describe('getErrorMessage', () => {
  it('prefers the detail of an API error', () => {
    const error = new ApiError({
      title: 'Not found',
      status: 404,
      detail: 'Trip TR-9 does not exist.',
    })

    expect(getErrorMessage(error)).toBe('Trip TR-9 does not exist.')
  })

  it('falls back to the title of an API error', () => {
    expect(getErrorMessage(new ApiError({ title: 'Forbidden', status: 403 }))).toBe('Forbidden')
  })

  it('explains that the server is unreachable', () => {
    const error = new NetworkError({ cause: new TypeError('Load failed') })

    expect(getErrorMessage(error)).toMatch(/can't reach the server/i)
  })

  it('uses the message of any other error', () => {
    expect(getErrorMessage(new Error('Map tiles failed to load'))).toBe('Map tiles failed to load')
  })

  it('has a generic message for values that are not errors', () => {
    expect(getErrorMessage('boom')).toBe('Something went wrong. Please try again.')
  })
})
