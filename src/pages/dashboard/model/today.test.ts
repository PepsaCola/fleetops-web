import { describe, expect, it } from 'vitest'

import type { Trip } from '@/entities/trip'

import { countByStatus, nextDepartures, onTheRoad } from './today'

// 10 March in Kyiv (UTC+2)
const DAY = { starts: Date.parse('2026-03-09T22:00:00Z'), ends: Date.parse('2026-03-10T22:00:00Z') }
const at = (time: string) => Date.parse(`2026-03-10T${time}:00Z`)

const trip = (number: number, status: Trip['status'], from: string, to: string): Trip => ({
  id: `trip-${number}`,
  number,
  status,
  vehicle: { id: `vehicle-${number}`, plate: 'AA 1234 KB', type: 'van' },
  driver: { id: 'driver-1', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Depot → Customer', kind: 'local' },
  departsAt: `2026-03-10T${from}:00.000Z`,
  arrivesAt: `2026-03-10T${from}:00.000Z`,
  returnsAt: `2026-03-10T${to}:00.000Z`,
  cancelledAt: null,
})

const trips = [
  trip(1040, 'completed', '05:00', '07:00'),
  trip(1041, 'in_progress', '06:00', '08:00'),
  trip(1042, 'planned', '12:00', '13:00'),
  trip(1043, 'cancelled', '06:00', '09:00'),
]

describe('today on the dashboard', () => {
  it('counts trips by status and picks the next ones to leave', () => {
    expect(countByStatus(trips)).toEqual({
      planned: 1,
      in_progress: 1,
      completed: 1,
      cancelled: 1,
    })
    expect(nextDepartures(trips, 5).map(({ number }) => number)).toEqual([1042])
  })

  it('counts the vehicles out on a trip each quarter hour, leaving cancelled trips out', () => {
    const slots = onTheRoad(trips, DAY)
    const vehiclesAt = (time: string) => slots.find((slot) => slot.at === at(time))?.vehicles

    expect(slots).toHaveLength(96)
    expect(vehiclesAt('04:45')).toBe(0)
    expect(vehiclesAt('06:30')).toBe(2)
    // Back at 07:00 is back: that quarter hour belongs to the next trip only
    expect(vehiclesAt('07:00')).toBe(1)
    expect(vehiclesAt('12:15')).toBe(1)
  })
})
