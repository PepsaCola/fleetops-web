import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { Driver, DriverPage } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { DriversPage } from './drivers-page'

const olena: Driver = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  firstName: 'Olena',
  lastName: 'Kovalenko',
  phone: '+380671234567',
  licenseNumber: 'AKH123456',
  licenseCategories: ['B', 'C', 'CE'],
  licenseExpiresOn: '2029-03-01',
  medicalExpiresOn: '2026-11-10',
  documentsExpireOn: '2026-11-10',
  documents: 'expiring',
  status: 'on_leave',
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000001', name: 'Brovary Logistics Park' },
}

/** Serves one page of drivers and returns the query string of every request it got. */
function serveDrivers(items: Driver[] = [olena]) {
  const requests: string[] = []
  server.use(
    http.get('/api/v1/drivers', ({ request }) => {
      requests.push(new URL(request.url).search)
      return HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        pageSize: 20,
      } satisfies DriverPage)
    }),
  )
  return requests
}

describe('DriversPage', () => {
  it('lists the drivers with the state of their documents', async () => {
    serveDrivers()

    renderWithProviders(<DriversPage />)
    const row = await screen.findByRole('row', { name: /Kovalenko Olena/ })

    expect(within(row).getByText('+380 67 123 45 67')).toBeInTheDocument()
    expect(within(row).getByText('B, C, CE')).toBeInTheDocument()
    expect(within(row).getByText('Expiring')).toBeInTheDocument()
    expect(within(row).getByText('On leave')).toBeInTheDocument()
    expect(within(row).getByText('Brovary Logistics Park')).toBeInTheDocument()
  })

  it('shows drivers whose documents need attention, soonest first', async () => {
    const requests = serveDrivers()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<DriversPage />, { url: '/drivers' })
    await screen.findByRole('row', { name: /Kovalenko Olena/ })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Documents' }), 'Expiring')
    await user.click(screen.getByRole('button', { name: 'Documents' }))

    await waitFor(() =>
      expect(requests.at(-1)).toBe('?page=1&pageSize=20&sort=documentsExpireOn&documents=expiring'),
    )
    expect(router.state.location.search).toBe('?documents=expiring&sort=documentsExpireOn')
  })

  it('says so when nothing matches the filters', async () => {
    serveDrivers([])

    renderWithProviders(<DriversPage />, { url: '/drivers?status=inactive' })

    expect(await screen.findByText('No drivers match these filters.')).toBeInTheDocument()
  })
})
