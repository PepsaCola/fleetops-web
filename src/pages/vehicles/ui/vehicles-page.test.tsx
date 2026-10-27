import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { Vehicle, VehiclePage } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { VehiclesPage } from './vehicles-page'

const volvo: Vehicle = {
  id: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  plate: 'AA 1234 KB',
  make: 'Volvo',
  model: 'FH 500',
  year: 2021,
  type: 'truck',
  status: 'maintenance',
  capacityKg: 22_000,
  fuelTankL: 750,
  odometerKm: 412_000,
  homeDepot: { id: '0199d2a4-0000-7000-8000-000000000001', name: 'Brovary Logistics Park' },
}

const pageOf = (items: Vehicle[]): VehiclePage => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
})

// 25 vehicles, served 20 per page like the real API
const fleet = Array.from({ length: 25 }, (_, index) => ({
  ...volvo,
  id: `0199d2a4-5f3e-7c11-9a2b-${String(index).padStart(12, '0')}`,
  plate: `AA ${1000 + index} KB`,
}))

/** Serves the fleet page by page and returns the query string of every request it got. */
function serveFleet() {
  const requests: string[] = []
  server.use(
    http.get('/api/v1/vehicles', ({ request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page'))
      const pageSize = Number(url.searchParams.get('pageSize'))
      requests.push(url.search)
      return HttpResponse.json({
        items: fleet.slice((page - 1) * pageSize, page * pageSize),
        total: fleet.length,
        page,
        pageSize,
      })
    }),
  )
  return requests
}

describe('VehiclesPage', () => {
  it('lists the fleet from the API', async () => {
    server.use(http.get('/api/v1/vehicles', () => HttpResponse.json(pageOf([volvo]))))

    renderWithProviders(<VehiclesPage />)
    const row = await screen.findByRole('row', { name: /AA 1234 KB/ })

    expect(within(row).getByText('Volvo FH 500')).toBeInTheDocument()
    expect(within(row).getByText('2021')).toBeInTheDocument()
    expect(within(row).getByText('Truck')).toBeInTheDocument()
    expect(within(row).getByText('In maintenance')).toBeInTheDocument()
    expect(within(row).getByText('Brovary Logistics Park')).toBeInTheDocument()
    expect(within(row).getByText('412,000 km')).toBeInTheDocument()
  })

  it('says so when there are no vehicles', async () => {
    server.use(http.get('/api/v1/vehicles', () => HttpResponse.json(pageOf([]))))

    renderWithProviders(<VehiclesPage />)

    expect(await screen.findByText('No vehicles yet.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })

  it('shows why loading failed and loads again on retry', async () => {
    let requests = 0
    server.use(
      http.get('/api/v1/vehicles', () => {
        requests += 1
        if (requests > 1) return HttpResponse.json(pageOf([volvo]))
        return HttpResponse.json(
          { title: 'Service Unavailable', status: 503, detail: 'The database is not reachable' },
          { status: 503, headers: { 'content-type': 'application/problem+json' } },
        )
      }),
    )
    const user = userEvent.setup()

    renderWithProviders(<VehiclesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('The database is not reachable')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('row', { name: /AA 1234 KB/ })).toBeInTheDocument()
  })

  it('pages through the fleet and keeps the page in the URL', async () => {
    serveFleet()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<VehiclesPage />, { url: '/vehicles' })
    expect(await screen.findByText('1–20 of 25')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(await screen.findByText('21–25 of 25')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /AA 1024 KB/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(router.state.location.search).toBe('?page=2')
  })

  it('opens the page and order named in the URL', async () => {
    const requests = serveFleet()

    renderWithProviders(<VehiclesPage />, { url: '/vehicles?page=2&sort=-year' })

    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Year/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    expect(requests).toEqual(['?page=2&pageSize=20&sort=-year'])
  })

  it('sorts by a column header and starts again from the first page', async () => {
    const requests = serveFleet()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<VehiclesPage />, { url: '/vehicles?page=2' })
    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Odometer' }))

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?sort=-odometerKm')
    expect(requests.at(-1)).toBe('?page=1&pageSize=20&sort=-odometerKm')
    expect(screen.getByRole('columnheader', { name: /Odometer/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )

    await user.click(screen.getByRole('button', { name: 'Odometer' }))

    expect(router.state.location.search).toBe('?sort=odometerKm')
  })

  it('filters by status and starts again from the first page', async () => {
    const requests = serveFleet()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<VehiclesPage />, { url: '/vehicles?page=2' })
    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'In maintenance')

    await waitFor(() =>
      expect(requests.at(-1)).toBe('?page=1&pageSize=20&sort=plate&status=maintenance'),
    )
    expect(router.state.location.search).toBe('?status=maintenance')
  })

  it('searches once the user pauses typing, without a history entry per search', async () => {
    const requests = serveFleet()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<VehiclesPage />, { url: '/vehicles' })
    await screen.findByText('Page 1 of 2')
    await user.type(screen.getByRole('searchbox', { name: 'Search vehicles' }), 'volvo')

    // One request for the first page and one for the finished word, none per keystroke
    await waitFor(() => expect(requests).toHaveLength(2))
    expect(requests[1]).toBe('?page=1&pageSize=20&sort=plate&search=volvo')
    expect(router.state.location.search).toBe('?search=volvo')
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('resets the filters but keeps the order', async () => {
    serveFleet()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<VehiclesPage />, {
      url: '/vehicles?sort=-year&search=volvo&status=active',
    })
    expect(screen.getByRole('searchbox', { name: 'Search vehicles' })).toHaveValue('volvo')
    await user.click(await screen.findByRole('button', { name: 'Reset' }))

    expect(router.state.location.search).toBe('?sort=-year')
    expect(screen.getByRole('searchbox', { name: 'Search vehicles' })).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
  })

  it('says so when nothing matches the filters', async () => {
    server.use(http.get('/api/v1/vehicles', () => HttpResponse.json(pageOf([]))))

    renderWithProviders(<VehiclesPage />, { url: '/vehicles?type=car' })

    expect(await screen.findByText('No vehicles match these filters.')).toBeInTheDocument()
  })
})
