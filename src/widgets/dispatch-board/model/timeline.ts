import type { Trip } from '@/entities/trip'
import type { Vehicle } from '@/entities/vehicle'
import type { WorkOrder } from '@/entities/work-order'

/** The day on the board, as instants: from Kyiv midnight to the next one */
export type DayWindow = { starts: number; ends: number }

/** Trips move on the board in steps of a quarter hour */
export const SNAP_MS = 15 * 60_000

/** A shift in time rounded to whole quarter hours. */
export const snapShift = (shiftMs: number) => Math.round(shiftMs / SNAP_MS) * SNAP_MS

/** The moment `share` of the way across the day, down to the quarter hour: where a click on a lane lands. */
export function slotAt(share: number, day: DayWindow) {
  const at = day.starts + Math.min(Math.max(share, 0), 1) * (day.ends - day.starts)
  return Math.floor(at / SNAP_MS) * SNAP_MS
}

/** Where a span sits on the day's timeline, in percent of its width; cut off at either midnight. */
export function spanOnDay(from: string, to: string, day: DayWindow) {
  const length = day.ends - day.starts
  const start = Math.max(Date.parse(from), day.starts)
  const end = Math.min(Date.parse(to), day.ends)
  return {
    left: ((start - day.starts) / length) * 100,
    width: (Math.max(end - start, 0) / length) * 100,
  }
}

export type BoardRow = { vehicle: Vehicle; trips: Trip[]; workshop: WorkOrder[] }

/** Items by vehicle, in time order; cancelled ones hold no time, so they stay off the board */
function byVehicle<Item extends { vehicle: { id: string }; status: string }>(
  items: Item[],
  startOf: (item: Item) => string,
) {
  const groups = new Map<string, Item[]>()
  for (const item of items) {
    if (item.status === 'cancelled') continue
    groups.set(item.vehicle.id, [...(groups.get(item.vehicle.id) ?? []), item])
  }
  for (const [vehicleId, group] of groups) {
    groups.set(
      vehicleId,
      group.toSorted((a, b) => startOf(a).localeCompare(startOf(b))),
    )
  }
  return groups
}

/** A row per vehicle, by depot and plate, with its trips and its time in the workshop. */
export function boardRows(
  vehicles: Vehicle[],
  trips: Trip[],
  workOrders: WorkOrder[] = [],
): BoardRow[] {
  const tripsOf = byVehicle(trips, (trip) => trip.departsAt)
  const workshopOf = byVehicle(workOrders, (order) => order.startsAt)

  return vehicles
    .toSorted(
      (a, b) => a.homeDepot.name.localeCompare(b.homeDepot.name) || a.plate.localeCompare(b.plate),
    )
    .map((vehicle) => ({
      vehicle,
      trips: tripsOf.get(vehicle.id) ?? [],
      workshop: workshopOf.get(vehicle.id) ?? [],
    }))
}
