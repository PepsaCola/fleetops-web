import { z } from 'zod'

import type { Driver } from '@/entities/driver'
import type { TrackingRoute } from '@/entities/tracking'
import type { Vehicle } from '@/entities/vehicle'
import { fleetInstant, fleetTime } from '@/shared/lib/fleet-time'

import { ceilToQuarter } from './availability'

const TIME = /^(\d{2}):(\d{2})$/

/** Where the booking form starts: a day, and maybe a time and a vehicle picked on the board */
export type TripDraft = { day: string; time?: string; vehicleId?: string }

export const isDay = (value: string) => z.iso.date().safeParse(value).success

export const NewTripSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  driverId: z.string().min(1, 'Pick a driver'),
  routeId: z.string().min(1, 'Pick a route'),
  day: z.iso.date({ error: 'Pick a day' }),
  time: z.string().regex(TIME, 'Pick a time'),
})

export type NewTripValues = z.infer<typeof NewTripSchema>

/** When the trip leaves, from a day and a time read on Kyiv clocks; null until both are set. */
export function departureOf(day: string, time: string): number | null {
  const match = TIME.exec(time)
  if (!match || !isDay(day)) return null
  return fleetInstant(day, Number(match[1]) * 60 + Number(match[2])).getTime()
}

/** The booking the API takes: the day and the time become one instant. */
export function bookingOf({ vehicleId, driverId, routeId, day, time }: NewTripValues) {
  const departs = departureOf(day, time)
  if (departs === null) throw new Error('A checked booking always has a day and a time')
  return { vehicleId, driverId, routeId, departsAt: new Date(departs).toISOString() }
}

/** A first guess at the departure: the next quarter hour at least half an hour from now. */
export const nextSlot = (now = Date.now()) => fleetTime(new Date(ceilToQuarter(now + 30 * 60_000)))

/** A trip's length for people: "45 min", "3 h 05 min". */
export function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000)
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours} h ${String(minutes % 60).padStart(2, '0')} min` : `${minutes} min`
}

// The API has the last word on every booking; these only keep the choices to ones it will take.
// Trucks need category C and run the regional routes; vans and cars run local ones on a B licence.
const NEEDS: Record<Vehicle['type'], { license: string; kind: TrackingRoute['kind'] }> = {
  truck: { license: 'C', kind: 'regional' },
  van: { license: 'B', kind: 'local' },
  car: { license: 'B', kind: 'local' },
}

/** Routes the vehicle can drive: of its kind, from its depot (demo routes are named "Depot → Customer"). */
export function routesFor(vehicle: Vehicle, routes: TrackingRoute[]) {
  return routes.filter(
    (route) =>
      route.kind === NEEDS[vehicle.type].kind &&
      route.name.startsWith(`${vehicle.homeDepot.name} →`),
  )
}

/** Drivers who may take the vehicle out, those from its own depot first. */
export function driversFor(vehicle: Vehicle, drivers: Driver[]) {
  const ownDepot = (driver: Driver) => Number(driver.homeDepot.id === vehicle.homeDepot.id)
  return drivers
    .filter(
      (driver) =>
        driver.status === 'active' &&
        driver.documents !== 'expired' &&
        driver.licenseCategories.includes(NEEDS[vehicle.type].license),
    )
    .toSorted((a, b) => ownDepot(b) - ownDepot(a))
}
