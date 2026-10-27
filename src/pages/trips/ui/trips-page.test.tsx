import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { Trip, TripPage } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { TripsPage } from './trips-page'

const trip: Trip = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  number: 1042,
  status: 'in_progress',
  vehicle: { id: '0199d2a4-0000-7000-8000-000000000001', plate: 'AA 1234 KB', type: 'van' },
  driver: { id: '0199d2a4-0000-7000-8000-000000000002', firstName: 'Olena', lastName: 'Bondar' },
  route: {
    id: 'brovary-logistics-park-kyiv-livoberezhna',
    name: 'Brovary Logistics Park → Kyiv, Livoberezhna',
    kind: 'local',
  },
  // A March day: Kyiv is UTC+2
  departsAt: '2026-03-10T05:45:00.000Z',
  arrivesAt: '2026-03-10T06:25:00.000Z',
  returnsAt: '2026-03-10T07:25:00.000Z',
  cancelledAt: null,
}

/** Serves one page of trips and returns the query string of every request it got. */
function serveTrips(items: Trip[] = [trip]) {
  const requests: string[] = []
  server.use(
    http.get('/api/v1/trips', ({ request }) => {
      requests.push(new URL(request.url).search)
      return HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        pageSize: 20,
      } satisfies TripPage)
    }),
  )
  return requests
}

describe('TripsPage', () => {
  it('lists the trips of a day on Kyiv time', async () => {
    serveTrips()

    renderWithProviders(<TripsPage />, { url: '/trips?day=2026-03-10' })
    const row = await screen.findByRole('row', { name: /#1042/ })

    expect(within(row).getByText('07:45')).toBeInTheDocument()
    expect(within(row).getByText('08:25')).toBeInTheDocument()
    expect(within(row).getByText('Bondar Olena')).toBeInTheDocument()
    expect(within(row).getByText('AA 1234 KB')).toBeInTheDocument()
    expect(within(row).getByText('In progress')).toBeInTheDocument()
  })

  it('steps to the next day and keeps it in the URL', async () => {
    const requests = serveTrips()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<TripsPage />, { url: '/trips?day=2026-03-10' })
    await screen.findByRole('row', { name: /#1042/ })

    await user.click(screen.getByRole('button', { name: 'Next day' }))

    await waitFor(() =>
      expect(requests.at(-1)).toBe('?page=1&pageSize=20&sort=departsAt&day=2026-03-11'),
    )
    expect(router.state.location.search).toBe('?day=2026-03-11')
  })

  it('says so when no trip has the chosen status', async () => {
    serveTrips([])

    renderWithProviders(<TripsPage />, { url: '/trips?day=2026-03-10&status=cancelled' })

    expect(await screen.findByText('No trips match these filters.')).toBeInTheDocument()
  })
})
