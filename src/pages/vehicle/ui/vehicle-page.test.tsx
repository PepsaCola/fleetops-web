import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import type {
  CostReport,
  FleetPositions,
  Trip,
  TripPage,
  Vehicle,
  WorkOrder,
  WorkOrderList,
} from '@/shared/api'
import { fleetDate } from '@/shared/lib/fleet-time'
import { renderWithProviders, server } from '@/shared/lib/test'

import { VehiclePage } from './vehicle-page'

const truck: Vehicle = {
  id: '0199d2a4-0000-7000-8000-000000000001',
  plate: 'AI 5678 KA',
  make: 'Volvo',
  model: 'FH',
  year: 2021,
  type: 'truck',
  status: 'active',
  capacityKg: 20_000,
  fuelTankL: 600,
  odometerKm: 412_000,
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000009', name: 'Brovary Logistics Park' },
}

const trip: Trip = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  number: 1042,
  status: 'in_progress',
  vehicle: { id: truck.id, plate: truck.plate, type: 'truck' },
  driver: { id: '0199d2a4-0000-7000-8000-000000000002', firstName: 'Taras', lastName: 'Melnyk' },
  route: { id: 'route-1', name: 'Brovary Logistics Park → Nizhyn', kind: 'regional' },
  departsAt: '2026-03-10T06:00:00.000Z',
  arrivesAt: '2026-03-10T07:45:00.000Z',
  returnsAt: '2026-03-10T09:50:00.000Z',
  cancelledAt: null,
}

const service: WorkOrder = {
  id: '0199d2a4-5f3e-7c11-9a2b-000000005001',
  number: 5001,
  kind: 'service',
  status: 'done',
  vehicle: { id: truck.id, plate: truck.plate, type: 'truck' },
  startsAt: '2026-03-03T06:00:00.000Z',
  endsAt: '2026-03-03T12:00:00.000Z',
  costUah: 9800,
  note: 'Routine service',
  cancelledAt: null,
}

function serveVehicle() {
  const today = fleetDate()
  server.use(
    http.get('/api/v1/vehicles/:vehicleId', () => HttpResponse.json(truck)),
    http.get('/api/v1/tracking/positions', () =>
      HttpResponse.json({
        at: new Date().toISOString(),
        vehicles: [
          {
            vehicleId: truck.id,
            plate: truck.plate,
            type: 'truck',
            lng: 31.1,
            lat: 50.9,
            headingDeg: 20,
            speedKmh: 70,
            activity: 'to_customer',
            routeId: 'route-1',
          },
        ],
      } satisfies FleetPositions),
    ),
    http.get('/api/v1/trips', () =>
      HttpResponse.json({ items: [trip], total: 1, page: 1, pageSize: 100 } satisfies TripPage),
    ),
    http.get('/api/v1/work-orders', () =>
      HttpResponse.json({ items: [service] } satisfies WorkOrderList),
    ),
    http.get('/api/v1/costs', () =>
      HttpResponse.json({
        from: today,
        to: today,
        dieselUahPerLitre: 98,
        totals: { km: 2400, fuelUah: 65_856, maintenanceUah: 9800 },
        days: [],
        vehicles: [
          {
            vehicle: { id: truck.id, plate: truck.plate, type: 'truck' },
            km: 2400,
            fuelUah: 65_856,
            maintenanceUah: 9800,
          },
        ],
      } satisfies CostReport),
    ),
  )
}

/** The page as the router shows it, so the vehicle id comes from the URL */
const renderVehiclePage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/vehicles/:vehicleId" element={<VehiclePage />} />
    </Routes>,
    { url: `/vehicles/${truck.id}` },
  )

describe('VehiclePage', () => {
  it('shows the vehicle, what it is doing now and what it has cost', async () => {
    serveVehicle()

    renderVehiclePage()

    expect(await screen.findByRole('heading', { name: 'AI 5678 KA' })).toBeInTheDocument()
    expect(screen.getByText(/Volvo FH, 2021 · Truck · Brovary Logistics Park/)).toBeInTheDocument()
    expect(await screen.findByText('On the way to a customer, 70 km/h')).toBeInTheDocument()
    expect(await screen.findByText(/65\s856/)).toBeInTheDocument()
  })

  it('lists its trips today and its time in the workshop', async () => {
    serveVehicle()

    renderVehiclePage()

    const trips = await screen.findByRole('region', { name: "Today's trips" })
    expect(await within(trips).findByText('Nizhyn · Melnyk Taras')).toBeInTheDocument()
    const workshop = screen.getByRole('region', { name: 'In the workshop' })
    expect(await within(workshop).findByText('#5001')).toBeInTheDocument()
    expect(within(workshop).getByText('Tue 3 Mar, 08:00–14:00')).toBeInTheDocument()
  })
})
