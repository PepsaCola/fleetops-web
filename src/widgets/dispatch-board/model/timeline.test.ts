import { describe, expect, it } from 'vitest'

import type { Trip } from '@/entities/trip'
import type { Vehicle } from '@/entities/vehicle'

import { boardRows, slotAt, snapShift, spanOnDay } from './timeline'

const MINUTE = 60_000
// 10 March in Kyiv (UTC+2)
const DAY = { starts: Date.parse('2026-03-09T22:00:00Z'), ends: Date.parse('2026-03-10T22:00:00Z') }

const vehicle = (plate: string, depot: string): Vehicle => ({
  id: `vehicle-${plate}`,
  plate,
  make: 'Renault',
  model: 'Master',
  year: 2022,
  type: 'van',
  status: 'active',
  capacityKg: 1500,
  fuelTankL: 80,
  odometerKm: 120_000,
  homeDepot: { id: `depot-${depot}`, name: depot },
})

const trip = (vehicleId: string, departsAt: string, status: Trip['status'] = 'planned'): Trip => ({
  id: `trip-${departsAt}`,
  number: 1001,
  status,
  vehicle: { id: vehicleId, plate: 'AA 0001 KA', type: 'van' },
  driver: { id: 'driver-1', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Depot → Customer', kind: 'local' },
  departsAt,
  arrivesAt: departsAt,
  returnsAt: departsAt,
  cancelledAt: null,
})

describe('dispatch timeline', () => {
  it('places a span by the time of day, cut off at midnight', () => {
    // 06:00 to 12:00 in Kyiv: a quarter of the way in, a quarter of the day long
    expect(spanOnDay('2026-03-10T04:00:00Z', '2026-03-10T10:00:00Z', DAY)).toEqual({
      left: 25,
      width: 25,
    })
    // A night run from the day before shows only its part after midnight
    expect(spanOnDay('2026-03-09T20:00:00Z', '2026-03-10T01:00:00Z', DAY)).toEqual({
      left: 0,
      width: 12.5,
    })
  })

  it('moves trips in whole quarter hours', () => {
    expect(snapShift(7 * MINUTE)).toBe(0)
    expect(snapShift(8 * MINUTE)).toBe(15 * MINUTE)
    expect(snapShift(-22 * MINUTE)).toBe(-15 * MINUTE)
  })

  it('turns a click across a lane into the quarter hour it lands in', () => {
    // Halfway is noon in Kyiv; a little past it is still the 12:00 quarter
    expect(slotAt(0.5, DAY)).toBe(Date.parse('2026-03-10T10:00:00Z'))
    expect(slotAt(0.51, DAY)).toBe(Date.parse('2026-03-10T10:00:00Z'))
    expect(slotAt(-0.1, DAY)).toBe(DAY.starts)
  })

  it('gives each vehicle a row, by depot and plate, without cancelled trips', () => {
    const later = trip('vehicle-AA 2', '2026-03-10T09:00:00.000Z')
    const earlier = trip('vehicle-AA 2', '2026-03-10T05:00:00.000Z')
    const cancelled = trip('vehicle-AA 2', '2026-03-10T07:00:00.000Z', 'cancelled')

    const rows = boardRows(
      [vehicle('AA 2', 'Brovary'), vehicle('AA 3', 'Boryspil'), vehicle('AA 1', 'Brovary')],
      [later, cancelled, earlier],
    )

    expect(rows.map((row) => row.vehicle.plate)).toEqual(['AA 3', 'AA 1', 'AA 2'])
    expect(rows[2]?.trips).toEqual([earlier, later])
  })
})
