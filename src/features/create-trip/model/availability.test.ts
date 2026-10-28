import { describe, expect, it } from 'vitest'

import type { Trip } from '@/entities/trip'
import type { WorkOrder } from '@/entities/work-order'

import { availabilityNote, busyTimes, clashIn, nextFreeStart } from './availability'

const MINUTE = 60_000
// 10 March: Kyiv is UTC+2, so 07:00Z shows as 09:00
const at = (time: string) => Date.parse(`2026-03-10T${time}:00Z`)
const span = (from: string, to: string, doing = 'on trip #1040') => ({
  from: at(from),
  to: at(to),
  doing,
})

const trip = (number: number, status: Trip['status']): Trip => ({
  id: `trip-${number}`,
  number,
  status,
  vehicle: { id: 'vehicle-1', plate: 'AA 1234 KB', type: 'van' },
  driver: { id: 'driver-1', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Depot → Customer', kind: 'local' },
  departsAt: '2026-03-10T07:00:00.000Z',
  arrivesAt: '2026-03-10T07:30:00.000Z',
  returnsAt: '2026-03-10T08:30:00.000Z',
  cancelledAt: null,
})

const service: WorkOrder = {
  id: 'order-5001',
  number: 5001,
  kind: 'service',
  status: 'scheduled',
  vehicle: { id: 'vehicle-1', plate: 'AA 1234 KB', type: 'van' },
  startsAt: '2026-03-10T10:00:00.000Z',
  endsAt: '2026-03-10T12:00:00.000Z',
  costUah: 4800,
  note: '',
  cancelledAt: null,
}

describe('availability', () => {
  it('books the vehicle and the driver of every trip still on, and the vehicle alone in the workshop', () => {
    const { vehicles, drivers } = busyTimes(
      [trip(1040, 'planned'), trip(1041, 'cancelled')],
      [service],
    )

    expect(vehicles.get('vehicle-1')).toEqual([
      span('07:00', '08:30'),
      span('10:00', '12:00', 'in the workshop (work order #5001)'),
    ])
    expect(drivers.get('driver-1')).toEqual([span('07:00', '08:30')])
  })

  it('counts overlapping time as a clash, and back-to-back bookings as none', () => {
    expect(clashIn([span('07:00', '08:30')], at('08:00'), at('09:00'))?.doing).toBe('on trip #1040')
    expect(clashIn([span('07:00', '08:30')], at('08:30'), at('09:30'))).toBeUndefined()
  })

  it('finds the first quarter hour a whole trip fits into', () => {
    const spans = [span('07:00', '08:20'), span('09:00', '10:00')]

    // Half an hour fits between 08:30 (08:20 rounded up) and 09:00; an hour only after 10:00
    expect(nextFreeStart(spans, at('07:30'), 30 * MINUTE, at('22:00'))).toBe(at('08:30'))
    expect(nextFreeStart(spans, at('07:30'), 60 * MINUTE, at('22:00'))).toBe(at('10:00'))
    expect(nextFreeStart(spans, at('07:30'), 60 * MINUTE, at('09:30'))).toBeNull()
  })

  it('says how someone stands, on Kyiv clocks', () => {
    const spans = [span('07:00', '08:30')]

    expect(availabilityNote(spans, at('08:00'), at('08:00'))).toBe('busy until 10:30')
    expect(availabilityNote(spans, at('06:00'), at('06:00'))).toBe('free until 09:00')
    expect(availabilityNote(spans, at('09:00'), at('10:00'))).toBe('free')
    expect(availabilityNote(undefined, at('09:00'), at('10:00'))).toBe('free')
  })
})
