import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { CurrentUser, WorkOrder, WorkOrderList } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { MaintenancePage } from './maintenance-page'

const order = (number: number, status: WorkOrder['status']): WorkOrder => ({
  id: `0199d2a4-5f3e-7c11-9a2b-00000000${number}`,
  number,
  kind: number === 5001 ? 'service' : 'repair',
  status,
  vehicle: { id: '0199d2a4-0000-7000-8000-000000000001', plate: 'AA 1234 KB', type: 'van' },
  // 08:00–14:00 in Kyiv (UTC+2 in March)
  startsAt: '2026-03-10T06:00:00.000Z',
  endsAt: '2026-03-10T12:00:00.000Z',
  costUah: 4800,
  note: number === 5001 ? 'Routine service' : 'Brakes',
  cancelledAt: null,
})

const viewer: CurrentUser = {
  id: '0199d2a4-0000-7000-8000-0000000000bb',
  email: 'viewer@fleetops.demo',
  name: 'Demo Viewer',
  role: 'viewer',
}

/** Serves two work orders; returns the query of every list request and the cancelled ids. */
function serveWorkshop() {
  const requests: string[] = []
  const cancelled: string[] = []
  server.use(
    http.get('/api/v1/work-orders', ({ request }) => {
      requests.push(new URL(request.url).search)
      return HttpResponse.json({
        items: [order(5001, 'done'), order(5002, 'scheduled')],
      } satisfies WorkOrderList)
    }),
    http.post('/api/v1/work-orders/:workOrderId/cancel', ({ params }) => {
      cancelled.push(String(params.workOrderId))
      return HttpResponse.json({
        ...order(5002, 'cancelled'),
        cancelledAt: '2026-03-09T10:00:00.000Z',
      })
    }),
  )
  return { requests, cancelled }
}

describe('MaintenancePage', () => {
  it('lists two weeks of work orders from the day picked', async () => {
    const { requests } = serveWorkshop()

    renderWithProviders(<MaintenancePage />, { url: '/maintenance?from=2026-03-10' })
    const row = (await screen.findByText('#5002')).closest('tr')!

    expect(requests[0]).toBe('?from=2026-03-10&to=2026-03-23')
    expect(within(row).getByText('Repair')).toBeInTheDocument()
    expect(within(row).getByText('Tue 10 Mar, 08:00–14:00')).toBeInTheDocument()
    expect(within(row).getByText(/4\s800/)).toBeInTheDocument()
    expect(within(row).getByText('Scheduled')).toBeInTheDocument()
  })

  it('lets a dispatcher cancel a scheduled work order, and only a scheduled one', async () => {
    const { cancelled } = serveWorkshop()
    const user = userEvent.setup()

    renderWithProviders(<MaintenancePage />, { url: '/maintenance?from=2026-03-10' })
    await user.click(await screen.findByRole('button', { name: 'Cancel work order 5002' }))

    await waitFor(() => expect(cancelled).toEqual([order(5002, 'scheduled').id]))
    expect(screen.queryByRole('button', { name: 'Cancel work order 5001' })).not.toBeInTheDocument()
  })

  it('shows a viewer the work orders without the ways to change them', async () => {
    serveWorkshop()
    server.use(http.get('/api/v1/auth/me', () => HttpResponse.json(viewer)))

    renderWithProviders(<MaintenancePage />, { url: '/maintenance?from=2026-03-10' })
    await screen.findByText('#5002')

    expect(screen.queryByRole('button', { name: 'New work order' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancel work order/ })).not.toBeInTheDocument()
  })
})
