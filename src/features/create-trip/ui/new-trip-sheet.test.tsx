import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import type {
  Driver,
  DriverPage,
  TrackingRoute,
  TrackingRoutes,
  Trip,
  TripPage,
  Vehicle,
  VehiclePage,
} from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import type { TripDraft } from '../model/new-trip'
import { NewTripSheet } from './new-trip-sheet'

const DAY = '2026-03-10'
const brovary = { id: '0199d2a4-0000-7000-8000-000000000009', name: 'Brovary Logistics Park' }

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
  homeDepot: brovary,
}

const olena: Driver = {
  id: '0199d2a4-0000-7000-8000-000000000002',
  firstName: 'Olena',
  lastName: 'Bondar',
  phone: '+380671234567',
  licenseNumber: 'AKH123456',
  licenseCategories: ['B'],
  licenseExpiresOn: '2030-01-01',
  medicalExpiresOn: '2030-01-01',
  documentsExpireOn: '2030-01-01',
  documents: 'valid',
  status: 'active',
  homeDepot: brovary,
}

const route: TrackingRoute = {
  id: 'brovary-logistics-park-kyiv-livoberezhna',
  name: 'Brovary Logistics Park → Kyiv, Livoberezhna',
  kind: 'local',
  path: [
    [30.79, 50.51],
    [30.63, 50.46],
  ],
  driveMs: 20 * 60_000,
  roundTripMs: 60 * 60_000,
}

const trip = (number: number, departsAt: string, returnsAt: string): Trip => ({
  id: `0199d2a4-5f3e-7c11-9a2b-00000000${number}`,
  number,
  status: 'planned',
  vehicle: { id: van.id, plate: van.plate, type: 'van' },
  driver: { id: olena.id, firstName: 'Olena', lastName: 'Bondar' },
  route: { id: route.id, name: route.name, kind: 'local' },
  departsAt,
  arrivesAt: departsAt,
  returnsAt,
  cancelledAt: null,
})

// 09:30–10:30 in Kyiv (UTC+2 in March)
const booked = trip(1042, '2026-03-10T07:30:00.000Z', '2026-03-10T08:30:00.000Z')

/** Serves what the form needs; returns the body of every booking it got. */
function serveBooking(respond: () => Response, tripsThatDay: Trip[] = []) {
  const bookings: unknown[] = []
  server.use(
    http.get('/api/v1/vehicles', () =>
      HttpResponse.json({ items: [van], total: 1, page: 1, pageSize: 100 } satisfies VehiclePage),
    ),
    http.get('/api/v1/drivers', () =>
      HttpResponse.json({ items: [olena], total: 1, page: 1, pageSize: 100 } satisfies DriverPage),
    ),
    http.get('/api/v1/tracking/routes', () =>
      HttpResponse.json({ routes: [route] } satisfies TrackingRoutes),
    ),
    http.get('/api/v1/trips', ({ request }) => {
      const items = new URL(request.url).searchParams.get('day') === DAY ? tripsThatDay : []
      return HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        pageSize: 100,
      } satisfies TripPage)
    }),
    http.post('/api/v1/trips', async ({ request }) => {
      bookings.push(await request.json())
      return respond()
    }),
  )
  return bookings
}

/** The sheet as a page holds it: open while there is a draft */
function OpenSheet({ draft }: { draft: TripDraft }) {
  const [current, setCurrent] = useState<TripDraft | null>(draft)
  return <NewTripSheet draft={current} onClose={() => setCurrent(null)} />
}

/** Opens the form and fills it in for 09:30 on 10 March, without sending it. */
async function fillIn() {
  const user = userEvent.setup()
  renderWithProviders(<OpenSheet draft={{ day: DAY }} />)
  const form = await screen.findByRole('dialog', { name: 'New trip' })

  // The fields appear once the fleet has loaded
  fireEvent.change(await within(form).findByLabelText('Leaves at'), {
    target: { value: '09:30' },
  })
  await within(form).findByRole('option', { name: /AA 1234 KB/ })
  await user.selectOptions(within(form).getByLabelText('Vehicle'), van.id)
  await user.selectOptions(within(form).getByLabelText('Route'), route.id)
  await within(form).findByRole('option', { name: /Bondar Olena/ })
  await user.selectOptions(within(form).getByLabelText('Driver'), olena.id)

  return { user, form }
}

describe('NewTripSheet', () => {
  it('books the trip, reading the time on Kyiv clocks', async () => {
    const bookings = serveBooking(() => HttpResponse.json(booked, { status: 201 }))

    const { user, form } = await fillIn()
    await user.click(within(form).getByRole('button', { name: 'Book trip' }))

    await waitFor(() =>
      expect(bookings).toEqual([
        {
          vehicleId: van.id,
          driverId: olena.id,
          routeId: route.id,
          departsAt: '2026-03-10T07:30:00.000Z',
        },
      ]),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the form open and says why when the API refuses', async () => {
    serveBooking(() =>
      HttpResponse.json(
        {
          type: 'about:blank',
          status: 409,
          code: 'TRIP_OVERLAP',
          title: 'Conflict',
          detail: 'The vehicle is on trip 1040 at that time',
        },
        { status: 409, headers: { 'content-type': 'application/problem+json' } },
      ),
    )

    const { user, form } = await fillIn()
    await user.click(within(form).getByRole('button', { name: 'Book trip' }))

    expect(await within(form).findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'New trip' })).toBeInTheDocument()
  })

  it('warns when the vehicle is busy then, and moves the trip to the next free time', async () => {
    // The van is out from 09:00 to 10:30 Kyiv time
    serveBooking(
      () => HttpResponse.json(booked, { status: 201 }),
      [trip(1040, '2026-03-10T07:00:00.000Z', '2026-03-10T08:30:00.000Z')],
    )

    const { user, form } = await fillIn()

    expect(
      await within(form).findByText('The vehicle is on trip #1040 until 10:30.'),
    ).toBeInTheDocument()
    await user.click(within(form).getByRole('button', { name: /Move to 10:30/ }))

    expect(within(form).getByLabelText('Leaves at')).toHaveValue('10:30')
    expect(within(form).queryByText(/The vehicle is on trip/)).not.toBeInTheDocument()
  })

  it('starts from the vehicle and the time picked on the board', async () => {
    serveBooking(() => HttpResponse.json(booked, { status: 201 }))

    renderWithProviders(<OpenSheet draft={{ day: DAY, time: '13:15', vehicleId: van.id }} />)
    const form = await screen.findByRole('dialog', { name: 'New trip' })
    await within(form).findByRole('option', { name: /AA 1234 KB/ })

    expect(within(form).getByLabelText('Vehicle')).toHaveValue(van.id)
    expect(within(form).getByLabelText('Leaves at')).toHaveValue('13:15')
  })
})
