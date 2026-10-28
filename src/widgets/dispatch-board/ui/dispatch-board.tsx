import {
  DndContext,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragMoveEvent,
} from '@dnd-kit/core'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { useCanEdit } from '@/entities/session'
import { TRIP_STATUS_LABELS, tripQueries, type Trip } from '@/entities/trip'
import { VEHICLE_STATUS_LABELS, vehicleQueries, type Vehicle } from '@/entities/vehicle'
import { workOrderQueries, type WorkOrder } from '@/entities/work-order'
import { NewTripSheet, type TripDraft } from '@/features/create-trip'
import { movedTrip, useMoveTrip, type TripMove } from '@/features/move-trip'
import { addDays, fleetDayStart, fleetTime } from '@/shared/lib/fleet-time'
import { useNow } from '@/shared/lib/use-now'
import { cn } from '@/shared/lib/utils'
import { vehiclePath } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'

import { BAR_STYLES, BOARD_STATUSES, WORKSHOP_STRIPES } from '../config/bar-styles'
import { boardRows, slotAt, snapShift, spanOnDay, type DayWindow } from '../model/timeline'
import { TripBar } from './trip-bar'
import { TripSheet } from './trip-sheet'
import { VehicleLane } from './vehicle-lane'
import { WorkshopBar } from './workshop-bar'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

// Stable fallbacks, so the rows aren't rebuilt on every render while data loads
const NO_VEHICLES: Vehicle[] = []
const NO_TRIPS: Trip[] = []
const NO_WORK_ORDERS: WorkOrder[] = []

/**
 * Every vehicle's trips and time in the workshop across one day, a row per vehicle. Click a trip
 * for its details; a dispatcher can also drag a planned one to another time or vehicle, or click
 * empty time to book a trip there.
 */
export function DispatchBoard({ day }: { day: string }) {
  // The whole fleet fits on one page
  const vehicles = useQuery(vehicleQueries.list({ pageSize: 100 }))
  const trips = useQuery(tripQueries.day(day))
  // The board still works without them: a failed load only leaves the workshop off
  const workOrders = useQuery(workOrderQueries.day(day))
  const canEdit = useCanEdit()
  const moveTrip = useMoveTrip(day)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TripDraft | null>(null)
  const [move, setMove] = useState<TripMove | null>(null)
  // A drop ends with a click on the bar that moved; that click shouldn't open its details
  const justDragged = useRef(false)
  // A bar starts moving only after a few pixels, so a plain click still opens the details.
  // There's no keyboard dragging: Space and Enter already open the details.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const now = useNow(60_000)

  const dayWindow = useMemo<DayWindow>(
    () => ({
      starts: fleetDayStart(day).getTime(),
      ends: fleetDayStart(addDays(day, 1)).getTime(),
    }),
    [day],
  )
  const rows = useMemo(
    () =>
      boardRows(
        vehicles.data?.items ?? NO_VEHICLES,
        trips.data ?? NO_TRIPS,
        workOrders.data?.items ?? NO_WORK_ORDERS,
      ),
    [vehicles.data, trips.data, workOrders.data],
  )
  // Looked up on every refresh, so the details follow changes made since it was opened
  const selected = trips.data?.find((trip) => trip.id === selectedId)

  /** Where a dragged bar would land: the lane under the pointer, moved by whole quarter hours */
  function landingOf({ active, over, delta }: DragMoveEvent): TripMove | null {
    const trip = active.data.current?.trip as Trip | undefined
    const vehicle = over?.data.current?.vehicle as Vehicle | undefined
    if (!trip || !vehicle || !over) return null

    const shiftMs = snapShift((delta.x / over.rect.width) * (dayWindow.ends - dayWindow.starts))
    return { trip, shiftMs, vehicle: { id: vehicle.id, plate: vehicle.plate, type: vehicle.type } }
  }

  function endDrag(event: DragMoveEvent | null) {
    setMove(null)
    // Cleared after the click that follows the drop has been ignored
    setTimeout(() => {
      justDragged.current = false
    })
    const landing = event && landingOf(event)
    if (!landing || (landing.shiftMs === 0 && landing.vehicle.id === landing.trip.vehicle.id)) {
      return
    }
    moveTrip.mutate(landing)
  }

  /** Opens the booking form on the vehicle and the quarter hour that was clicked */
  function bookAt(vehicle: Vehicle, share: number) {
    if (justDragged.current) return
    setDraft({ day, time: fleetTime(new Date(slotAt(share, dayWindow))), vehicleId: vehicle.id })
  }

  const error = vehicles.error ?? trips.error
  if (error && !(vehicles.data && trips.data)) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void vehicles.refetch()
          void trips.refetch()
        }}
      />
    )
  }

  if (vehicles.isPending || trips.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  const nowAt =
    now >= dayWindow.starts && now < dayWindow.ends
      ? ((now - dayWindow.starts) / (dayWindow.ends - dayWindow.starts)) * 100
      : null
  const preview = move && movedTrip(move.trip, move)
  const hint = canEdit
    ? 'Drag a planned trip to move it, or click empty time in a row to book one there.'
    : 'You’re signed in as a viewer: you can look at every trip, but not change them.'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <ul className="flex flex-wrap gap-4">
          {BOARD_STATUSES.map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span aria-hidden className={cn('size-3 rounded-sm border', BAR_STYLES[status])} />
              {TRIP_STATUS_LABELS[status]}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-sm border border-dashed border-muted-foreground/60"
              style={WORKSHOP_STRIPES}
            />
            In the workshop
          </li>
        </ul>
        <p aria-live="polite" className={cn(preview && 'font-medium text-foreground')}>
          {preview
            ? `Trip #${preview.number}: ${fleetTime(preview.departsAt)}–${fleetTime(preview.returnsAt)}, ${preview.vehicle.plate}`
            : hint}
        </p>
        {canEdit && (
          <Button className="ml-auto" onClick={() => setDraft({ day })}>
            <PlusIcon data-icon="inline-start" />
            New trip
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[1100px]">
          <div className="flex border-b text-xs text-muted-foreground">
            <div className="sticky left-0 z-10 w-36 shrink-0 border-r bg-background px-3 py-2">
              Vehicle
            </div>
            <div className="relative flex-1">
              {HOURS.map((hour) => (
                <span
                  key={hour}
                  className="absolute top-2 pl-1 tabular-nums"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {String(hour).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={() => {
              justDragged.current = true
            }}
            onDragMove={(event) => setMove(landingOf(event))}
            onDragEnd={endDrag}
            onDragCancel={() => endDrag(null)}
          >
            {rows.map(({ vehicle, trips: vehicleTrips, workshop }) => (
              <div key={vehicle.id} className="flex border-b last:border-b-0">
                <div className="sticky left-0 z-10 w-36 shrink-0 border-r bg-background px-3 py-1.5">
                  <Link
                    to={vehiclePath(vehicle.id)}
                    className="block font-mono text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {vehicle.plate}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    {vehicle.status === 'active'
                      ? vehicle.homeDepot.name
                      : VEHICLE_STATUS_LABELS[vehicle.status]}
                  </div>
                </div>
                <VehicleLane
                  vehicle={vehicle}
                  // Only a dispatcher books, and a vehicle in the workshop can't be booked
                  onPick={
                    canEdit && vehicle.status === 'active'
                      ? (share) => bookAt(vehicle, share)
                      : undefined
                  }
                >
                  {workshop.map((order) => (
                    <WorkshopBar
                      key={order.id}
                      order={order}
                      {...spanOnDay(order.startsAt, order.endsAt, dayWindow)}
                    />
                  ))}
                  {vehicleTrips.map((trip) => (
                    <TripBar
                      key={trip.id}
                      trip={trip}
                      {...spanOnDay(trip.departsAt, trip.returnsAt, dayWindow)}
                      movable={canEdit && trip.status === 'planned'}
                      onSelect={(picked) => {
                        if (!justDragged.current) setSelectedId(picked.id)
                      }}
                    />
                  ))}
                  {nowAt !== null && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-red-500"
                      style={{ left: `${nowAt}%` }}
                    />
                  )}
                </VehicleLane>
              </div>
            ))}
          </DndContext>
        </div>
      </div>

      <TripSheet trip={selected} canEdit={canEdit} onClose={() => setSelectedId(null)} />
      <NewTripSheet draft={draft} onClose={() => setDraft(null)} />
    </div>
  )
}
