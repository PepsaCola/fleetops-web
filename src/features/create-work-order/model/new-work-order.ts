import { z } from 'zod'

import type { Trip } from '@/entities/trip'
import type { WorkOrder } from '@/entities/work-order'
import { zWorkOrder } from '@/shared/contract'
import { fleetInstant, fleetTime } from '@/shared/lib/fleet-time.ts'

const TIME = /^(\d{2}):(\d{2})$/

/** Where the form starts: a day, and maybe a vehicle */
export type WorkOrderDraft = { day: string; vehicleId?: string }

/** The kinds of work, straight from the API contract */
export const WORK_ORDER_KIND_OPTIONS = zWorkOrder.shape.kind.options

export const NewWorkOrderSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  kind: zWorkOrder.shape.kind,
  startDay: z.iso.date({ error: 'Pick a day' }),
  startTime: z.string().regex(TIME, 'Pick a time'),
  endDay: z.iso.date({ error: 'Pick a day' }),
  endTime: z.string().regex(TIME, 'Pick a time'),
  costUah: z
    .number({ error: 'Enter the cost in hryvnias' })
    .int('Whole hryvnias, please')
    .min(0, 'The cost can’t be negative'),
  note: z.string().trim().max(500),
})

export type NewWorkOrderValues = z.infer<typeof NewWorkOrderSchema>

const minutesOf = (time: string) => {
  const [, hours = '0', minutes = '0'] = TIME.exec(time) ?? []
  return Number(hours) * 60 + Number(minutes)
}

/** The work order the API takes: the days and times, read on Kyiv clocks, become instants. */
export function workOrderOf(values: NewWorkOrderValues) {
  return {
    vehicleId: values.vehicleId,
    kind: values.kind,
    startsAt: fleetInstant(values.startDay, minutesOf(values.startTime)).toISOString(),
    endsAt: fleetInstant(values.endDay, minutesOf(values.endTime)).toISOString(),
    costUah: values.costUah,
    note: values.note,
  }
}

/** What else the vehicle is booked for, in time order, so the dispatcher sees where the work fits. */
export function bookingsOf(vehicleId: string, trips: Trip[], workOrders: WorkOrder[]) {
  const bookings = [
    ...trips
      .filter((trip) => trip.vehicle.id === vehicleId && trip.status !== 'cancelled')
      .map((trip) => ({ from: trip.departsAt, to: trip.returnsAt, what: `trip #${trip.number}` })),
    ...workOrders
      .filter((order) => order.vehicle.id === vehicleId && order.status !== 'cancelled')
      .map((order) => ({
        from: order.startsAt,
        to: order.endsAt,
        what: `work order #${order.number}`,
      })),
  ]

  return bookings
    .toSorted((a, b) => a.from.localeCompare(b.from))
    .map(({ from, to, what }) => `${what} ${fleetTime(from)}–${fleetTime(to)}`)
}
