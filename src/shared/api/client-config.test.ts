import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/test'

import { ApiError } from './api-error'
import { getVehicle, listVehicles, type VehiclePage } from './generated'
import { NetworkError } from './network-error'

const VEHICLE_ID = '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b'

const emptyPage: VehiclePage = { items: [], total: 0, page: 2, pageSize: 20 }

describe('generated API client', () => {
  it('sends the query and resolves with the response body', async () => {
    let search = ''
    server.use(
      http.get('/api/v1/vehicles', ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json(emptyPage)
      }),
    )

    const page = await listVehicles({ query: { page: 2, status: 'active' } })

    expect(page).toEqual(emptyPage)
    expect(search).toBe('?page=2&status=active')
  })

  it('rejects with an ApiError built from the Problem Details', async () => {
    server.use(
      http.get('/api/v1/vehicles/:vehicleId', ({ params }) =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Not Found',
            status: 404,
            detail: `Vehicle ${String(params.vehicleId)} was not found`,
            code: 'NOT_FOUND',
          },
          { status: 404, headers: { 'content-type': 'application/problem+json' } },
        ),
      ),
    )

    const error = await getVehicle({ path: { vehicleId: VEHICLE_ID } }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' })
  })

  it('rejects with a NetworkError when the server cannot be reached', async () => {
    server.use(http.get('/api/v1/vehicles', () => HttpResponse.error()))

    const error = await listVehicles().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NetworkError)
  })

  it('leaves a cancelled request as an AbortError', async () => {
    server.use(http.get('/api/v1/vehicles', () => HttpResponse.json(emptyPage)))
    const controller = new AbortController()
    controller.abort()

    const error = await listVehicles({ signal: controller.signal }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(DOMException)
    expect(error).toHaveProperty('name', 'AbortError')
  })
})
