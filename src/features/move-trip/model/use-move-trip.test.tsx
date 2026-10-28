import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { tripQueries, type Trip } from '@/entities/trip'
import { server } from '@/shared/lib/test'

import { movedTrip, useMoveTrip } from './use-move-trip'

const DAY = '2026-03-10'
const MINUTE = 60_000

const trip: Trip = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  number: 1042,
  status: 'planned',
  vehicle: { id: '0199d2a4-0000-7000-8000-000000000001', plate: 'AA 1234 KB', type: 'van' },
  driver: { id: '0199d2a4-0000-7000-8000-000000000002', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Depot → Customer', kind: 'local' },
  departsAt: '2026-03-10T05:45:00.000Z',
  arrivesAt: '2026-03-10T06:25:00.000Z',
  returnsAt: '2026-03-10T07:25:00.000Z',
  cancelledAt: null,
}

const otherVan = {
  id: '0199d2a4-0000-7000-8000-000000000003',
  plate: 'AI 5678 KA',
  type: 'van' as const,
}

/** A board with one trip on it, and an API that answers a move with `respond`. */
function setup(respond: () => Promise<Response>) {
  server.use(http.patch('/api/v1/trips/:tripId', respond))
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(tripQueries.day(DAY).queryKey, [trip])
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const { result } = renderHook(() => useMoveTrip(DAY), { wrapper })
  const shown = () => queryClient.getQueryData(tripQueries.day(DAY).queryKey)?.[0]
  return { result, shown }
}

describe('moving a trip', () => {
  it('shifts every time of the trip and puts it on the new vehicle', () => {
    expect(movedTrip(trip, { shiftMs: 30 * MINUTE, vehicle: otherVan })).toMatchObject({
      vehicle: otherVan,
      departsAt: '2026-03-10T06:15:00.000Z',
      arrivesAt: '2026-03-10T06:55:00.000Z',
      returnsAt: '2026-03-10T07:55:00.000Z',
    })
  })

  it('shows the move at once, and puts the trip back when the API refuses it', async () => {
    const { result, shown } = setup(async () => {
      await delay(200)
      return HttpResponse.json(
        { status: 409, code: 'TRIP_OVERLAP', title: 'Conflict', detail: 'The vehicle is busy' },
        { status: 409 },
      )
    })

    act(() => result.current.mutate({ trip, shiftMs: 30 * MINUTE, vehicle: otherVan }))

    await waitFor(() => expect(shown()?.departsAt).toBe('2026-03-10T06:15:00.000Z'))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(shown()).toEqual(trip)
  })
})
