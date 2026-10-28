import type { Trip } from '@/entities/trip'
import type { WorkOrder } from '@/entities/work-order'
import { fleetTime } from '@/shared/lib/fleet-time'

// Who is booked when, worked out from the trips and work orders the board already has. The API
// checks every booking again, so this only has to be right enough to steer the dispatcher.

/** A stretch of time a vehicle or a driver is taken */
export type BusySpan = {
  from: number
  to: number
  /** What takes them, to finish "The vehicle is …", e.g. "on trip #1042" */
  doing: string
}

const QUARTER_HOUR = 15 * 60_000

/** The first quarter hour at or after a moment. */
export const ceilToQuarter = (at: number) => Math.ceil(at / QUARTER_HOUR) * QUARTER_HOUR

/** What every vehicle and every driver is booked for, by id; cancelled bookings hold nothing. */
export function busyTimes(trips: Trip[], workOrders: WorkOrder[] = []) {
  const vehicles = new Map<string, BusySpan[]>()
  const drivers = new Map<string, BusySpan[]>()
  const add = (spans: Map<string, BusySpan[]>, id: string, span: BusySpan) =>
    spans.set(id, [...(spans.get(id) ?? []), span])

  for (const trip of trips) {
    if (trip.status === 'cancelled') continue
    const span = {
      from: Date.parse(trip.departsAt),
      to: Date.parse(trip.returnsAt),
      doing: `on trip #${trip.number}`,
    }
    add(vehicles, trip.vehicle.id, span)
    add(drivers, trip.driver.id, span)
  }
  // The workshop takes the vehicle only; its driver is free for another one
  for (const order of workOrders) {
    if (order.status === 'cancelled') continue
    add(vehicles, order.vehicle.id, {
      from: Date.parse(order.startsAt),
      to: Date.parse(order.endsAt),
      doing: `in the workshop (work order #${order.number})`,
    })
  }
  return { vehicles, drivers }
}

/** The booking that shares time with the span from `from` to `to`; back-to-back is fine. */
export function clashIn(spans: BusySpan[] | undefined, from: number, to: number) {
  return spans?.find((span) => span.from < to && from < span.to)
}

/**
 * The earliest quarter hour at or after `from` when a trip `length` long clashes with none of
 * `spans`, or null when none starts before `until`.
 */
export function nextFreeStart(
  spans: BusySpan[],
  from: number,
  length: number,
  until: number,
): number | null {
  for (let start = ceilToQuarter(from); start < until;) {
    const blocking = clashIn(spans, start, start + length)
    if (!blocking) return start
    start = ceilToQuarter(blocking.to)
  }
  return null
}

/** How someone stands for the span from `from` to `to`: "free", "free until 13:10", "busy until 11:40". */
export function availabilityNote(spans: BusySpan[] | undefined, from: number, to: number) {
  const clash = clashIn(spans, from, to)
  if (clash) return `busy until ${fleetTime(new Date(clash.to))}`

  const next = spans?.filter((span) => span.from >= to).toSorted((a, b) => a.from - b.from)[0]
  return next ? `free until ${fleetTime(new Date(next.from))}` : 'free'
}
