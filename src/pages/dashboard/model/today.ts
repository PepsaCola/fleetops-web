import type { Trip, TripStatus } from '@/entities/trip'

/** The day from Kyiv midnight to the next one, in ms */
export type DaySpan = { starts: number; ends: number }

/** One quarter hour of the day and how many vehicles were (or will be) out on a trip then */
export type RoadSlot = { at: number; vehicles: number }

const QUARTER_HOUR = 15 * 60_000

/** The day's trips counted by status. */
export function countByStatus(trips: Trip[]) {
  const counts: Record<TripStatus, number> = {
    planned: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  }
  for (const trip of trips) counts[trip.status] += 1
  return counts
}

/** The next trips to leave the depot, soonest first. */
export function nextDepartures(trips: Trip[], count: number) {
  return trips
    .filter((trip) => trip.status === 'planned')
    .toSorted((a, b) => a.departsAt.localeCompare(b.departsAt))
    .slice(0, count)
}

/**
 * How many vehicles are out on a trip at each quarter hour of the day. A vehicle is never on
 * two trips at once, so counting trips counts vehicles. Cancelled trips hold no one.
 */
export function onTheRoad(trips: Trip[], day: DaySpan): RoadSlot[] {
  const spans = trips
    .filter((trip) => trip.status !== 'cancelled')
    .map((trip) => ({ from: Date.parse(trip.departsAt), to: Date.parse(trip.returnsAt) }))

  return Array.from({ length: Math.round((day.ends - day.starts) / QUARTER_HOUR) }, (_, index) => {
    const at = day.starts + index * QUARTER_HOUR
    return { at, vehicles: spans.filter((span) => span.from <= at && at < span.to).length }
  })
}
