import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { CostReport } from '@/shared/api'
import { addDays, fleetDate } from '@/shared/lib/fleet-time'
import { renderWithProviders, server } from '@/shared/lib/test'

import { CostsPage } from './costs-page'

/** Serves one report whatever the period; returns the query of every request it got. */
function serveCosts() {
  const today = fleetDate()
  const requests: string[] = []
  server.use(
    http.get('/api/v1/costs', ({ request }) => {
      requests.push(new URL(request.url).search)
      return HttpResponse.json({
        from: addDays(today, -29),
        to: today,
        dieselUahPerLitre: 56,
        totals: { km: 1000, fuelUah: 30_000, maintenanceUah: 9_600 },
        days: [{ day: today, fuelUah: 30_000, maintenanceUah: 9_600 }],
        vehicles: [
          {
            vehicle: {
              id: '0199d2a4-0000-7000-8000-000000000001',
              plate: 'AI 5678 KA',
              type: 'truck',
            },
            km: 600,
            fuelUah: 20_000,
            maintenanceUah: 9_800,
          },
        ],
      } satisfies CostReport)
    }),
  )
  return { today, requests }
}

describe('CostsPage', () => {
  it('sums up the last 30 days and lists the dearest vehicles', async () => {
    const { today, requests } = serveCosts()

    renderWithProviders(<CostsPage />, { url: '/costs' })

    expect(await screen.findByText(/39\s600/)).toBeInTheDocument()
    expect(screen.getByText(/39,60/)).toBeInTheDocument()
    expect(screen.getByText('Diesel at 56 ₴ a litre')).toBeInTheDocument()
    expect(requests[0]).toBe(`?from=${addDays(today, -29)}&to=${today}`)

    const row = screen.getByText('AI 5678 KA').closest('tr')!
    expect(within(row).getByText('Truck')).toBeInTheDocument()
    expect(within(row).getByText(/29\s800/)).toBeInTheDocument()
  })

  it('switches the period and keeps it in the URL', async () => {
    const { today, requests } = serveCosts()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<CostsPage />, { url: '/costs' })
    await screen.findByText(/39\s600/)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Period' }), 'Last 7 days')

    await waitFor(() => expect(requests.at(-1)).toBe(`?from=${addDays(today, -6)}&to=${today}`))
    expect(router.state.location.search).toBe('?days=7')
  })
})
