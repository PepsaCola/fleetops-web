import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { Driver, DriverPage, FleetPositions, Trip, TripPage, VehiclePage } from '@/shared/api'
import { fleetDate } from '@/shared/lib/fleet-time'
import { renderWithProviders, server } from '@/shared/lib/test'

import { DashboardPage } from './dashboard-page'

const position = (vehicleId: string, activity: 'to_customer' | 'at_depot' | 'off_duty') => ({
  vehicleId,
  plate: 'AA 1234 KB',
  type: 'van' as const,
  lng: 30.79,
  lat: 50.51,
  headingDeg: null,
  speedKmh: 0,
  activity,
  routeId: null,
})

const trip = (number: number, status: Trip['status'], departsAt: string): Trip => ({
  id: `0199d2a4-5f3e-7c11-9a2b-00000000${number}`,
  number,
  status,
  vehicle: { id: '0199d2a4-0000-7000-8000-000000000001', plate: 'AI 5678 KA', type: 'van' },
  driver: { id: '0199d2a4-0000-7000-8000-000000000002', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Brovary Logistics Park → Nizhyn', kind: 'regional' },
  departsAt,
  arrivesAt: departsAt,
  returnsAt: departsAt,
  cancelledAt: null,
})

const driver: Driver = {
  id: '0199d2a4-0000-7000-8000-000000000003',
  firstName: 'Taras',
  lastName: 'Melnyk',
  phone: '+380671234567',
  licenseNumber: 'AKH123456',
  licenseCategories: ['B', 'C'],
  licenseExpiresOn: '2030-01-01',
  medicalExpiresOn: '2026-10-01',
  documentsExpireOn: '2026-10-01',
  documents: 'expired',
  status: 'active',
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000009', name: 'Brovary Logistics Park' },
}

const page = <Item,>(items: Item[], total = items.length) => ({
  items,
  total,
  page: 1,
  pageSize: 20,
})

function serveToday() {
  const today = fleetDate()
  server.use(
    http.get('/api/v1/tracking/positions', () =>
      HttpResponse.json({
        at: new Date().toISOString(),
        vehicles: [
          position('v1', 'to_customer'),
          position('v2', 'at_depot'),
          position('v3', 'off_duty'),
        ],
      } satisfies FleetPositions),
    ),
    http.get('/api/v1/trips', ({ request }) => {
      const items =
        new URL(request.url).searchParams.get('day') === today
          ? [
              trip(1040, 'completed', `${today}T05:00:00.000Z`),
              trip(1041, 'in_progress', `${today}T07:00:00.000Z`),
              trip(1042, 'planned', `${today}T12:00:00.000Z`),
            ]
          : []
      return HttpResponse.json(page(items) satisfies TripPage)
    }),
    http.get('/api/v1/drivers', ({ request }) => {
      const documents = new URL(request.url).searchParams.get('documents')
      if (documents === 'expiring') return HttpResponse.json(page([], 2) satisfies DriverPage)
      if (documents === 'expired') return HttpResponse.json(page([], 1) satisfies DriverPage)
      return HttpResponse.json(page([driver]) satisfies DriverPage)
    }),
    http.get('/api/v1/vehicles', () => HttpResponse.json(page([], 3) satisfies VehiclePage)),
  )
}

describe('DashboardPage', () => {
  it('sums up the fleet today, each number leading to its details', async () => {
    serveToday()

    renderWithProviders(<DashboardPage />)

    expect(await screen.findByText('1 standing · 1 off duty')).toBeInTheDocument()
    expect(await screen.findByText('1 done · 1 under way · 1 to go')).toBeInTheDocument()
    expect(await screen.findByText('1 expired · 2 expire within 30 days')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /In the workshop/ })).toHaveAttribute(
      'href',
      '/vehicles?status=maintenance',
    )
  })

  it('lists the next departures and the documents to renew', async () => {
    serveToday()

    renderWithProviders(<DashboardPage />)

    expect(await screen.findByText('AI 5678 KA')).toBeInTheDocument()
    expect(screen.getByText(/Nizhyn · Bondar Olena/)).toBeInTheDocument()
    expect(await screen.findByText('Melnyk Taras')).toBeInTheDocument()
  })
})
