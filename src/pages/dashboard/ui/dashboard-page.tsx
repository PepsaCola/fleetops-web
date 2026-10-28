import { useQuery } from '@tanstack/react-query'

import { driverQueries } from '@/entities/driver'
import { countByMotion, trackingQueries } from '@/entities/tracking'
import { tripQueries } from '@/entities/trip'
import { vehicleQueries } from '@/entities/vehicle'
import { fleetDate } from '@/shared/lib/fleet-time'
import { paths } from '@/shared/routes'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'

import { countByStatus, nextDepartures } from '../model/today'
import { DocumentsToRenew } from './documents-to-renew'
import { NextDepartures } from './next-departures'
import { RoadActivity } from './road-activity'

/** A number, "—" when its query failed, or undefined while it loads */
const shown = <Value,>(
  query: { isError: boolean; data: Value | undefined },
  pick: (data: Value) => number,
) => (query.isError ? '—' : query.data === undefined ? undefined : pick(query.data))

export function DashboardPage() {
  const today = fleetDate()
  // Each of these is shared with the page it leads to, so opening that page is instant
  const positions = useQuery(trackingQueries.positions())
  const trips = useQuery(tripQueries.day(today))
  const drivers = useQuery(driverQueries.list({ sort: 'documentsExpireOn', pageSize: 5 }))
  // Only the totals matter here, so one row is enough
  const expiring = useQuery(driverQueries.list({ documents: 'expiring', pageSize: 1 }))
  const expired = useQuery(driverQueries.list({ documents: 'expired', pageSize: 1 }))
  const workshop = useQuery(vehicleQueries.list({ status: 'maintenance', pageSize: 1 }))

  const motion = positions.data && countByMotion(positions.data.vehicles)
  const statuses = trips.data && countByStatus(trips.data)
  const documentsDue =
    expiring.data && expired.data ? expiring.data.total + expired.data.total : undefined

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today's fleet at a glance. Everything here keeps itself up to date."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="On the road"
          value={shown(positions, () => motion?.moving ?? 0)}
          note={
            motion &&
            [
              `${motion.standing} standing`,
              // Most hours nobody is in, so the workshop is only mentioned when someone is
              motion.workshop > 0 && `${motion.workshop} in the workshop`,
              `${motion.off_duty} off duty`,
            ]
              .filter(Boolean)
              .join(' · ')
          }
          to={paths.liveMap}
        />
        <StatCard
          label="Trips today"
          value={shown(trips, (data) => data.length - (statuses?.cancelled ?? 0))}
          note={
            statuses &&
            `${statuses.completed} done · ${statuses.in_progress} under way · ${statuses.planned} to go`
          }
          to={paths.trips}
        />
        <StatCard
          label="Documents to renew"
          value={expiring.isError || expired.isError ? '—' : documentsDue}
          note={
            expiring.data &&
            expired.data &&
            `${expired.data.total} expired · ${expiring.data.total} expire within 30 days`
          }
          to={`${paths.drivers}?sort=documentsExpireOn`}
          alert={documentsDue !== undefined && documentsDue > 0}
        />
        <StatCard
          label="In the workshop"
          value={shown(workshop, (page) => page.total)}
          note="Vehicles in maintenance"
          to={`${paths.vehicles}?status=maintenance`}
        />
      </div>

      <RoadActivity trips={trips.data} day={today} />

      <div className="grid gap-4 lg:grid-cols-2">
        <NextDepartures trips={trips.data && nextDepartures(trips.data, 5)} />
        <DocumentsToRenew drivers={drivers.data?.items} />
      </div>
    </>
  )
}
