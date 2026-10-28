import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type {
  CurrentUser,
  Trip,
  TripPage,
  Vehicle,
  VehiclePage,
  WorkOrder,
  WorkOrderList,
} from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { DispatchPage } from './dispatch-page'

const DAY = '2026-03-10'

const van: Vehicle = {
  id: '0199d2a4-0000-7000-8000-000000000001',
  plate: 'AA 1234 KB',
  make: 'Renault',
  model: 'Master',
  year: 2022,
  type: 'van',
  status: 'active',
  capacityKg: 1500,
  fuelTankL: 80,
  odometerKm: 120_000,
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000009', name: 'Brovary Logistics Park' },
}

const trip: Trip = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  number: 1042,
  status: 'planned',
  vehicle: { id: van.id, plate: van.plate, type: 'van' },
  driver: { id: '0199d2a4-0000-7000-8000-000000000002', firstName: 'Olena', lastName: 'Bondar' },
  route: {
    id: 'brovary-logistics-park-kyiv-livoberezhna',
    name: 'Brovary Logistics Park → Kyiv, Livoberezhna',
    kind: 'local',
  },
  // Kyiv is UTC+2 in March
  departsAt: '2026-03-10T05:45:00.000Z',
  arrivesAt: '2026-03-10T06:25:00.000Z',
  returnsAt: '2026-03-10T07:25:00.000Z',
  cancelledAt: null,
}

const service: WorkOrder = {
  id: '0199d2a4-5f3e-7c11-9a2b-000000005001',
  number: 5001,
  kind: 'service',
  status: 'scheduled',
  vehicle: { id: van.id, plate: van.plate, type: 'van' },
  startsAt: '2026-03-10T11:00:00.000Z',
  endsAt: '2026-03-10T15:00:00.000Z',
  costUah: 4800,
  note: 'Routine service',
  cancelledAt: null,
}

const viewer: CurrentUser = {
  id: '0199d2a4-0000-7000-8000-0000000000bb',
  email: 'viewer@fleetops.demo',
  name: 'Demo Viewer',
  role: 'viewer',
}

/** Serves the fleet and the day's trips; returns whether the trip was cancelled. */
function serveBoard() {
  const cancelled = { value: false }
  server.use(
    http.get('/api/v1/vehicles', () =>
      HttpResponse.json({ items: [van], total: 1, page: 1, pageSize: 100 } satisfies VehiclePage),
    ),
    http.get('/api/v1/trips', ({ request }) => {
      const items = new URL(request.url).searchParams.get('day') === DAY ? [trip] : []
      return HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        pageSize: 100,
      } satisfies TripPage)
    }),
    http.post('/api/v1/trips/:tripId/cancel', () => {
      cancelled.value = true
      return HttpResponse.json({
        ...trip,
        status: 'cancelled',
        cancelledAt: '2026-03-10T05:00:00.000Z',
      } satisfies Trip)
    }),
  )
  return cancelled
}

/** Opens the board on the test day and the trip's details. */
async function openTrip() {
  const user = userEvent.setup()
  renderWithProviders(<DispatchPage />, { url: `/dispatch?day=${DAY}` })
  await user.click(await screen.findByRole('button', { name: /Trip 1042/ }))
  const sheet = await screen.findByRole('dialog', { name: 'Trip #1042' })
  return { user, sheet }
}

describe('DispatchPage', () => {
  it('shows each vehicle’s trips across the day, with details on click', async () => {
    serveBoard()

    const { sheet } = await openTrip()

    expect(within(sheet).getByText('Bondar Olena')).toBeInTheDocument()
    expect(within(sheet).getByText('07:45')).toBeInTheDocument()
    expect(within(sheet).getByText('Planned')).toBeInTheDocument()
  })

  it('shows when a vehicle is in the workshop', async () => {
    serveBoard()
    server.use(
      http.get('/api/v1/work-orders', () =>
        HttpResponse.json({ items: [service] } satisfies WorkOrderList),
      ),
    )

    renderWithProviders(<DispatchPage />, { url: `/dispatch?day=${DAY}` })

    expect(
      await screen.findByText('Work order 5001: service in the workshop, 13:00–17:00'),
    ).toBeInTheDocument()
  })

  it('lets a dispatcher cancel a planned trip from its details', async () => {
    const cancelled = serveBoard()

    const { user, sheet } = await openTrip()
    await user.click(await within(sheet).findByRole('button', { name: 'Cancel trip' }))

    await waitFor(() => expect(cancelled.value).toBe(true))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows a viewer the whole board, without the ways to change it', async () => {
    serveBoard()
    server.use(http.get('/api/v1/auth/me', () => HttpResponse.json(viewer)))

    const { sheet } = await openTrip()

    expect(await screen.findByText(/You’re signed in as a viewer/)).toBeInTheDocument()
    expect(within(sheet).queryByRole('button', { name: 'Cancel trip' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New trip' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /New trip for/ })).not.toBeInTheDocument()
  })
})
