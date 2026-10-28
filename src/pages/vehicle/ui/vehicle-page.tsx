import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'

import { costQueries } from '@/entities/cost'
import { driverName } from '@/entities/driver'
import { ACTIVITY_LABELS, trackingQueries } from '@/entities/tracking'
import { TripStatusBadge, tripQueries } from '@/entities/trip'
import { VEHICLE_TYPE_LABELS, VehicleStatusBadge, vehicleQueries } from '@/entities/vehicle'
import {
  WORK_ORDER_KIND_LABELS,
  WorkOrderStatusBadge,
  workOrderQueries,
  workOrderTime,
} from '@/entities/work-order'
import { addDays, fleetDate, fleetTime } from '@/shared/lib/fleet-time'
import { formatUah } from '@/shared/lib/money'
import { paths } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'

const numbers = new Intl.NumberFormat('uk-UA')
const NOTHING_SPENT = { km: 0, fuelUah: 0, maintenanceUah: 0 }

interface PanelProps {
  id: string
  title: string
  note?: string
  link: { to: string; label: string }
  children: ReactNode
}

function Panel({ id, title, note, link, children }: PanelProps) {
  return (
    <section aria-labelledby={id} className="rounded-lg border">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id={id} className="font-medium">
            {title}
          </h2>
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
        <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground">
          {link.label}
        </Link>
      </header>
      {children}
    </section>
  )
}

/** Shown in a panel while its list loads, or when it's empty */
const Placeholder = ({ text }: { text?: string }) =>
  text ? (
    <p className="px-4 py-6 text-sm text-muted-foreground">{text}</p>
  ) : (
    <div className="p-4">
      <Skeleton className="h-16 w-full" />
    </div>
  )

/** One vehicle: what it's doing now, what it has cost, its trips today and its time in the workshop. */
export function VehiclePage() {
  const { vehicleId = '' } = useParams()
  const today = fleetDate()
  const vehicle = useQuery(vehicleQueries.detail(vehicleId))
  // Shared with the live map, so what the vehicle is doing keeps itself up to date
  const positions = useQuery(trackingQueries.positions())
  const trips = useQuery(tripQueries.list({ day: today, vehicleId, pageSize: 100 }))
  const workOrders = useQuery(
    workOrderQueries.list({ from: addDays(today, -30), to: addDays(today, 14), vehicleId }),
  )
  // The same report the Costs page opens with, so the cache usually has it already
  const costs = useQuery(costQueries.report({ from: addDays(today, -29), to: today }))

  if (vehicle.error && !vehicle.data) {
    return <ErrorState error={vehicle.error} onRetry={vehicle.refetch} />
  }
  if (!vehicle.data) return <Skeleton className="h-64 w-full" />

  const { id, plate, make, model, year, type, status, homeDepot } = vehicle.data
  const position = positions.data?.vehicles.find((candidate) => candidate.vehicleId === id)
  const spent =
    costs.data && (costs.data.vehicles.find((row) => row.vehicle.id === id) ?? NOTHING_SPENT)
  // "—" when the report couldn't be loaded, undefined while it loads
  const cost = (pick: (tally: typeof NOTHING_SPENT) => string) =>
    costs.isError ? '—' : spent && pick(spent)

  return (
    <>
      <PageHeader
        title={plate}
        description={`${make} ${model}, ${year} · ${VEHICLE_TYPE_LABELS[type]} · ${homeDepot.name}`}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <VehicleStatusBadge status={status} />
        {position && (
          <span>
            {ACTIVITY_LABELS[position.activity]}
            {position.speedKmh > 0 && `, ${position.speedKmh} km/h`}
          </span>
        )}
        <Link to={paths.liveMap} className="text-muted-foreground hover:text-foreground">
          Live map
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Driven"
          value={cost((tally) => `${numbers.format(tally.km)} km`)}
          note="The last 30 days"
        />
        <StatCard
          label="Fuel"
          value={cost((tally) => formatUah(tally.fuelUah))}
          note="The last 30 days"
        />
        <StatCard
          label="Workshop"
          value={cost((tally) => formatUah(tally.maintenanceUah))}
          note="The last 30 days"
        />
        <StatCard
          label="Odometer"
          value={`${numbers.format(vehicle.data.odometerKm)} km`}
          note={`Carries ${numbers.format(vehicle.data.capacityKg)} kg · ${vehicle.data.fuelTankL} l tank`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          id="vehicle-trips"
          title="Today's trips"
          link={{ to: paths.dispatch, label: 'Dispatch board' }}
        >
          {!trips.data ? (
            <Placeholder text={trips.isError ? 'The trips couldn’t be loaded.' : undefined} />
          ) : trips.data.items.length === 0 ? (
            <Placeholder text="No trips today." />
          ) : (
            <ul className="divide-y">
              {trips.data.items.map((trip) => (
                <li key={trip.id} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
                  <span className="font-medium tabular-nums">
                    {fleetTime(trip.departsAt)}–{fleetTime(trip.returnsAt)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {trip.route.name.split(' → ')[1] ?? trip.route.name} · {driverName(trip.driver)}
                  </span>
                  <TripStatusBadge status={trip.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          id="vehicle-workshop"
          title="In the workshop"
          note="The last 30 days and the next 14"
          link={{ to: paths.maintenance, label: 'Maintenance' }}
        >
          {!workOrders.data ? (
            <Placeholder
              text={workOrders.isError ? 'The work orders couldn’t be loaded.' : undefined}
            />
          ) : workOrders.data.items.length === 0 ? (
            <Placeholder text="No work orders in these weeks." />
          ) : (
            <ul className="divide-y">
              {workOrders.data.items.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
                  <span className="font-mono font-medium">#{order.number}</span>
                  <span>{WORK_ORDER_KIND_LABELS[order.kind]}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground tabular-nums">
                    {workOrderTime(order)}
                  </span>
                  <span className="tabular-nums">{formatUah(order.costUah)}</span>
                  <WorkOrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
