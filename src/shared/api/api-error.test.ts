import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/test'

import { ApiError, isApiError, toApiError } from './api-error'

const conflict = {
  type: 'https://fleetops.dev/problems/trip-conflict',
  title: 'Trip conflict',
  status: 409,
  detail: 'Vehicle AA 1234 KB is already on trip TR-1041 at that time.',
  code: 'TRIP_CONFLICT',
}

const PROBLEM_JSON = { 'content-type': 'application/problem+json' }

describe('toApiError', () => {
  it('keeps the Problem Details sent by the server', async () => {
    const response = new Response(JSON.stringify(conflict), { status: 409, headers: PROBLEM_JSON })

    const error = await toApiError(response)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.code).toBe('TRIP_CONFLICT')
    expect(error.message).toBe(conflict.detail)
  })

  it('falls back to the status when a JSON body is not Problem Details', async () => {
    const response = new Response(JSON.stringify({ oops: true }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })

    const error = await toApiError(response)

    expect(error.problem).toEqual({ title: 'Request failed', status: 500 })
  })

  it('does not parse a non-JSON body', async () => {
    const response = new Response('<h1>Bad gateway</h1>', {
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'content-type': 'text/html' },
    })

    const error = await toApiError(response)

    expect(error.problem).toEqual({ title: 'Bad Gateway', status: 502 })
  })

  it('survives a broken JSON body', async () => {
    const response = new Response('{"title":', { status: 500, headers: PROBLEM_JSON })

    const error = await toApiError(response)

    expect(error.status).toBe(500)
  })

  it('turns a real API response into an ApiError', async () => {
    server.use(
      http.post('/api/v1/trips/:tripId/assign', () =>
        HttpResponse.json(conflict, { status: 409, headers: PROBLEM_JSON }),
      ),
    )

    const response = await fetch('/api/v1/trips/TR-1042/assign', { method: 'POST' })
    const error = await toApiError(response)

    expect(isApiError(error)).toBe(true)
    expect(error.code).toBe('TRIP_CONFLICT')
  })
})
