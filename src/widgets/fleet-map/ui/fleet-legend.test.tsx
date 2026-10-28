import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { VehiclePosition } from '@/entities/tracking'

import { FleetLegend } from './fleet-legend'

const vehicle = (activity: VehiclePosition['activity']): VehiclePosition => ({
  vehicleId: crypto.randomUUID(),
  plate: 'AA 1234 KB',
  type: 'van',
  lng: 30.5,
  lat: 50.45,
  headingDeg: null,
  speedKmh: 0,
  activity,
  routeId: null,
})

describe('FleetLegend', () => {
  it('counts the vehicles that are moving, standing, in the workshop and off duty', () => {
    render(
      <FleetLegend
        vehicles={[
          vehicle('to_customer'),
          vehicle('to_depot'),
          vehicle('at_customer'),
          vehicle('at_depot'),
          vehicle('at_depot'),
          vehicle('in_workshop'),
          vehicle('off_duty'),
        ]}
        updatedAt="2026-10-27T14:05:09.000Z"
      />,
    )

    const rows = screen.getAllByRole('listitem').map((row) => row.textContent)
    expect(rows).toEqual(['Moving2', 'Standing3', 'In the workshop1', 'Off duty1'])
    expect(screen.getByText(/^Updated \d{2}:\d{2}:09$/)).toBeInTheDocument()
  })
})
