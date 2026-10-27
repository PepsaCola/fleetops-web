import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { VehiclePosition } from '@/entities/tracking'

import { FleetList } from './fleet-list'

const vehicle = (plate: string): VehiclePosition => ({
  vehicleId: `id-${plate}`,
  plate,
  type: 'van',
  lng: 30.5,
  lat: 50.45,
  headingDeg: 90,
  speedKmh: 40,
  activity: 'to_customer',
  routeId: 'kyiv-brovary',
})

describe('FleetList', () => {
  it('lists the fleet by plate', () => {
    render(
      <FleetList
        vehicles={[vehicle('AA 0002 KA'), vehicle('AA 0001 KA')]}
        selectedId={null}
        onSelect={vi.fn<(vehicle: VehiclePosition) => void>()}
      />,
    )

    const rows = screen.getAllByRole('button')
    expect(rows[0]).toHaveTextContent('AA 0001 KA')
    expect(rows[1]).toHaveTextContent('AA 0002 KA')
  })

  it('picks a vehicle and marks the one picked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn<(vehicle: VehiclePosition) => void>()
    const picked = vehicle('AA 0002 KA')
    render(
      <FleetList
        vehicles={[vehicle('AA 0001 KA'), picked]}
        selectedId={picked.vehicleId}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: /AA 0002 KA/ }))

    expect(onSelect).toHaveBeenCalledWith(picked)
    expect(screen.getByRole('button', { name: /AA 0002 KA/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: /AA 0001 KA/ })).not.toHaveAttribute('aria-current')
  })
})
