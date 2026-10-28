import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Link, useParams } from 'react-router'

import {
  DOCUMENT_STATE_LABELS,
  DriverStatusBadge,
  documentsNote,
  driverName,
  driverQueries,
  formatPhone,
} from '@/entities/driver'
import { TripStatusBadge, tripQueries, type Trip } from '@/entities/trip'
import { fleetDate, fleetTime } from '@/shared/lib/fleet-time'
import { paths, vehiclePath } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'

const dateOf = (date: string) => format(parseISO(date), 'd MMM yyyy')

/** Where the driver is in their day: on a trip, waiting for the next one, or done */
function NowLine({ trips }: { trips: Trip[] }) {
  const current = trips.find((trip) => trip.status === 'in_progress')
  if (current) {
    return (
      <span>
        On trip #{current.number} with{' '}
        <Link to={vehiclePath(current.vehicle.id)} className="font-mono hover:underline">
          {current.vehicle.plate}
        </Link>
      </span>
    )
  }
  const next = trips.find((trip) => trip.status === 'planned')
  return <span>{next ? `Next trip at ${fleetTime(next.departsAt)}` : 'No more trips today'}</span>
}

/** One driver: their documents, and their trips today. */
export function DriverPage() {
  const { driverId = '' } = useParams()
  const today = fleetDate()
  const driver = useQuery(driverQueries.detail(driverId))
  const trips = useQuery(tripQueries.list({ day: today, driverId, pageSize: 100 }))

  if (driver.error && !driver.data) {
    return <ErrorState error={driver.error} onRetry={driver.refetch} />
  }
  if (!driver.data) return <Skeleton className="h-64 w-full" />

  const person = driver.data
  const todays = trips.data?.items
  const count = (status: Trip['status']) => todays?.filter((trip) => trip.status === status).length

  return (
    <>
      <PageHeader
        title={driverName(person)}
        description={`${person.homeDepot.name} · ${formatPhone(person.phone)}`}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <DriverStatusBadge status={person.status} />
        {todays && <NowLine trips={todays} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Licence"
          value={person.licenseCategories.join(', ')}
          note={`No. ${person.licenseNumber} · until ${dateOf(person.licenseExpiresOn)}`}
        />
        <StatCard
          label="Medical certificate"
          value={dateOf(person.medicalExpiresOn)}
          note="Valid until"
        />
        <StatCard
          label="Documents"
          value={DOCUMENT_STATE_LABELS[person.documents]}
          note={documentsNote(person)}
          alert={person.documents !== 'valid'}
        />
        <StatCard
          label="Trips today"
          value={todays?.filter((trip) => trip.status !== 'cancelled').length}
          note={
            todays &&
            `${count('completed')} done · ${count('in_progress')} under way · ${count('planned')} to go`
          }
        />
      </div>

      <section aria-labelledby="driver-trips" className="rounded-lg border">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 id="driver-trips" className="font-medium">
            Today&apos;s trips
          </h2>
          <Link
            to={`${paths.trips}?status=in_progress`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            All trips
          </Link>
        </header>
        {!todays ? (
          trips.isError ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">The trips couldn’t be loaded.</p>
          ) : (
            <div className="p-4">
              <Skeleton className="h-16 w-full" />
            </div>
          )
        ) : todays.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No trips today.</p>
        ) : (
          <ul className="divide-y">
            {todays.map((trip) => (
              <li key={trip.id} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
                <span className="font-medium tabular-nums">
                  {fleetTime(trip.departsAt)}–{fleetTime(trip.returnsAt)}
                </span>
                <Link to={vehiclePath(trip.vehicle.id)} className="font-mono hover:underline">
                  {trip.vehicle.plate}
                </Link>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {trip.route.name.split(' → ')[1] ?? trip.route.name}
                </span>
                <TripStatusBadge status={trip.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
