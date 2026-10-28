import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { Driver, Trip, TripPage } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { DriverPage } from './driver-page'

const taras: Driver = {
  id: '0199d2a4-0000-7000-8000-000000000002',
  firstName: 'Taras',
  lastName: 'Melnyk',
  phone: '+380671234567',
  licenseNumber: 'AKH123456',
  licenseCategories: ['B', 'C', 'CE'],
  licenseExpiresOn: '2029-03-01',
  medicalExpiresOn: '2027-05-10',
  documentsExpireOn: '2027-05-10',
  documents: 'valid',
  status: 'active',
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000009', name: 'Brovary Logistics Park' },
}

const trip = (number: number, status: Trip['status'], departsAt: string): Trip => ({
  id: `0199d2a4-5f3e-7c11-9a2b-00000000${number}`,
  number,
  status,
  vehicle: { id: '0199d2a4-0000-7000-8000-000000000001', plate: 'AI 5678 KA', type: 'truck' },
  driver: { id: taras.id, firstName: 'Taras', lastName: 'Melnyk' },
  route: { id: 'route-1', name: 'Brovary Logistics Park → Nizhyn', kind: 'regional' },
  departsAt,
  arrivesAt: departsAt,
  returnsAt: departsAt,
  cancelledAt: null,
})

function serveDriver() {
  const requests: string[] = []
  server.use(
    http.get('/api/v1/drivers/:driverId', () => HttpResponse.json(taras)),
    http.get('/api/v1/trips', ({ request }) => {
      requests.push(new URL(request.url).search)
      const items = [
        trip(1040, 'completed', '2026-03-10T04:00:00.000Z'),
        trip(1042, 'in_progress', '2026-03-10T09:00:00.000Z'),
      ]
      return HttpResponse.json({ items, total: 2, page: 1, pageSize: 100 } satisfies TripPage)
    }),
  )
  return requests
}

/** The page as the router shows it, so the driver id comes from the URL */
const renderDriverPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/drivers/:driverId" element={<DriverPage />} />
    </Routes>,
    { url: `/drivers/${taras.id}` },
  )

describe('DriverPage', () => {
  it('shows the driver, their documents and where they are in their day', async () => {
    const requests = serveDriver()

    renderDriverPage()

    expect(await screen.findByRole('heading', { name: 'Melnyk Taras' })).toBeInTheDocument()
    expect(screen.getByText('B, C, CE')).toBeInTheDocument()
    expect(screen.getByText(/until 1 Mar 2029/)).toBeInTheDocument()
    expect(await screen.findByText(/On trip #1042 with/)).toBeInTheDocument()
    expect(screen.getByText('1 done · 1 under way · 0 to go')).toBeInTheDocument()
    expect(requests[0]).toContain(`driverId=${taras.id}`)
  })

  it('lists their trips today, each leading to its vehicle', async () => {
    serveDriver()

    renderDriverPage()

    const list = await screen.findByRole('region', { name: "Today's trips" })
    const [first] = await within(list).findAllByRole('link', { name: 'AI 5678 KA' })
    expect(first).toHaveAttribute('href', '/vehicles/0199d2a4-0000-7000-8000-000000000001')
  })
})
