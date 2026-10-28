import { Link } from 'react-router'

import { driverName } from '@/entities/driver'
import type { Trip } from '@/entities/trip'
import { fleetTime } from '@/shared/lib/fleet-time'
import { paths, vehiclePath } from '@/shared/routes'
import { Skeleton } from '@/shared/ui/skeleton'

/** The next few trips to leave: who drives what, where, and when. */
export function NextDepartures({ trips }: { trips: Trip[] | undefined }) {
  return (
    <section aria-labelledby="next-departures" className="rounded-lg border">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 id="next-departures" className="font-medium">
          Next departures
        </h2>
        <Link to={paths.dispatch} className="text-sm text-muted-foreground hover:text-foreground">
          Dispatch board
        </Link>
      </header>
      {trips === undefined ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Nothing else leaves today.</p>
      ) : (
        <ul className="divide-y">
          {trips.map((trip) => (
            <li key={trip.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-12 font-medium tabular-nums">{fleetTime(trip.departsAt)}</span>
              <Link
                to={vehiclePath(trip.vehicle.id)}
                className="font-mono underline-offset-4 hover:underline"
              >
                {trip.vehicle.plate}
              </Link>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {/* Every route starts at a depot, so the customer is what tells trips apart */}
                {trip.route.name.split(' → ')[1] ?? trip.route.name} · {driverName(trip.driver)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
