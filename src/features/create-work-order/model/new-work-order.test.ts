import { describe, expect, it } from 'vitest'

import type { Trip } from '@/entities/trip'
import type { WorkOrder } from '@/entities/work-order'

import { bookingsOf, workOrderOf } from './new-work-order.ts'

const trip = (number: number, departsAt: string, returnsAt: string): Trip => ({
  id: `trip-${number}`,
  number,
  status: 'planned',
  vehicle: { id: 'vehicle-1', plate: 'AA 1234 KB', type: 'van' },
  driver: { id: 'driver-1', firstName: 'Olena', lastName: 'Bondar' },
  route: { id: 'route-1', name: 'Depot → Customer', kind: 'local' },
  departsAt,
  arrivesAt: departsAt,
  returnsAt,
  cancelledAt: null,
})

const service: WorkOrder = {
  id: 'order-5001',
  number: 5001,
  kind: 'service',
  status: 'scheduled',
  vehicle: { id: 'vehicle-1', plate: 'AA 1234 KB', type: 'van' },
  startsAt: '2026-03-10T06:00:00.000Z',
  endsAt: '2026-03-10T12:00:00.000Z',
  costUah: 4800,
  note: '',
  cancelledAt: null,
}

describe('new work order', () => {
  it('reads the days and times on Kyiv clocks', () => {
    expect(
      workOrderOf({
        vehicleId: 'vehicle-1',
        kind: 'repair',
        startDay: '2026-03-10',
        startTime: '14:00',
        endDay: '2026-03-11',
        endTime: '10:30',
        costUah: 12_500,
        note: 'Clutch',
      }),
    ).toEqual({
      vehicleId: 'vehicle-1',
      kind: 'repair',
      startsAt: '2026-03-10T12:00:00.000Z',
      endsAt: '2026-03-11T08:30:00.000Z',
      costUah: 12_500,
      note: 'Clutch',
    })
  })

  it('lists what the vehicle is already booked for, in time order', () => {
    const trips = [
      trip(1047, '2026-03-10T13:00:00.000Z', '2026-03-10T14:40:00.000Z'),
      trip(1042, '2026-03-10T04:00:00.000Z', '2026-03-10T05:40:00.000Z'),
      {
        ...trip(1050, '2026-03-10T15:00:00.000Z', '2026-03-10T16:00:00.000Z'),
        status: 'cancelled' as const,
      },
    ]

    expect(bookingsOf('vehicle-1', trips, [service])).toEqual([
      'trip #1042 06:00–07:40',
      'work order #5001 08:00–14:00',
      'trip #1047 15:00–16:40',
    ])
  })
})
