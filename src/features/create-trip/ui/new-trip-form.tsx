import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId, useMemo, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { driverName, driverQueries } from '@/entities/driver'
import { trackingQueries, type TrackingRoute } from '@/entities/tracking'
import { tripQueries, type Trip } from '@/entities/trip'
import { VEHICLE_TYPE_LABELS, vehicleQueries } from '@/entities/vehicle'
import { workOrderQueries, type WorkOrder } from '@/entities/work-order'
import { createTrip, getErrorMessage } from '@/shared/api'
import { addDays, fleetDayStart, fleetTime } from '@/shared/lib/fleet-time'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

import {
  availabilityNote,
  busyTimes,
  clashIn,
  nextFreeStart,
  type BusySpan,
} from '../model/availability'
import {
  bookingOf,
  departureOf,
  driversFor,
  formatDuration,
  isDay,
  NewTripSchema,
  nextSlot,
  routesFor,
  type NewTripValues,
  type TripDraft,
} from '../model/new-trip'

// Stable fallbacks, so availability isn't worked out again on every render while data loads
const NO_TRIPS: Trip[] = []
const NO_WORK_ORDERS: WorkOrder[] = []

interface FieldProps {
  id: string
  label: string
  error: string | undefined
  children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

interface BookingCheckProps {
  departs: number
  route: TrackingRoute
  vehicleSpans: BusySpan[] | undefined
  driverSpans: BusySpan[] | undefined
  /** No suggestion runs past this moment: the end of the day */
  until: number
  onMove: (departs: number) => void
}

/** When the trip will be where, whether the vehicle and the driver are free for all of it, and if not, when they are. */
function BookingCheck({
  departs,
  route,
  vehicleSpans,
  driverSpans,
  until,
  onMove,
}: BookingCheckProps) {
  const returns = departs + route.roundTripMs
  const vehicleClash = clashIn(vehicleSpans, departs, returns)
  const driverClash = clashIn(driverSpans, departs, returns)
  const clashes = vehicleClash !== undefined || driverClash !== undefined
  const next = clashes
    ? nextFreeStart(
        [...(vehicleSpans ?? []), ...(driverSpans ?? [])],
        departs,
        route.roundTripMs,
        until,
      )
    : null

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-md border px-3 py-2 text-sm',
        clashes && 'border-amber-500/50 bg-amber-500/10',
      )}
    >
      <p className="tabular-nums">
        Leaves {fleetTime(new Date(departs))} · at the customer{' '}
        {fleetTime(new Date(departs + route.driveMs))} · back {fleetTime(new Date(returns))}
      </p>
      {vehicleClash && (
        <p>
          The vehicle is {vehicleClash.doing} until {fleetTime(new Date(vehicleClash.to))}.
        </p>
      )}
      {driverClash && (
        <p>
          The driver is {driverClash.doing} until {fleetTime(new Date(driverClash.to))}.
        </p>
      )}
      {clashes &&
        (next === null ? (
          <p>Nothing fits the whole trip later this day.</p>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onMove(next)}
          >
            Move to {fleetTime(new Date(next))}, the next free time
          </Button>
        ))}
    </div>
  )
}

interface NewTripFormProps {
  /** What the form starts from: the day on the board, and maybe a vehicle and a time picked on it */
  draft: TripDraft
  onBooked: () => void
}

/** Books a trip, showing who is free when, so a dispatcher doesn't have to guess. */
export function NewTripForm({ draft, onBooked }: NewTripFormProps) {
  const id = useId()
  const queryClient = useQueryClient()
  // The whole fleet and every driver fit on one page each
  const vehicles = useQuery(vehicleQueries.list({ pageSize: 100 }))
  const drivers = useQuery(driverQueries.list({ pageSize: 100, status: 'active' }))
  const routes = useQuery(trackingQueries.routes())

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NewTripValues>({
    resolver: zodResolver(NewTripSchema),
    defaultValues: {
      vehicleId: draft.vehicleId ?? '',
      driverId: '',
      routeId: '',
      day: draft.day,
      time: draft.time ?? nextSlot(),
    },
  })
  const [day, time, vehicleId, routeId, driverId] = useWatch({
    control,
    name: ['day', 'time', 'vehicleId', 'routeId', 'driverId'],
  })

  // The same trips and work orders the board shows, so who is booked when comes for free
  const trips = useQuery({ ...tripQueries.day(day), enabled: isDay(day) })
  const workOrders = useQuery({ ...workOrderQueries.day(day), enabled: isDay(day) })
  const busy = useMemo(
    () => busyTimes(trips.data ?? NO_TRIPS, workOrders.data?.items ?? NO_WORK_ORDERS),
    [trips.data, workOrders.data],
  )

  const book = useMutation({
    mutationFn: (values: NewTripValues) => createTrip({ body: bookingOf(values) }),
    onSuccess: async (trip) => {
      toast.success(
        `Trip #${trip.number} is booked: ${fleetTime(trip.departsAt)}–${fleetTime(trip.returnsAt)}, ${trip.vehicle.plate}`,
      )
      onBooked()
      await queryClient.invalidateQueries({ queryKey: tripQueries.all() })
    },
  })

  const loadError = vehicles.error ?? drivers.error ?? routes.error
  if (loadError) {
    return (
      <p role="alert" className="px-4 text-sm text-destructive">
        {getErrorMessage(loadError)}
      </p>
    )
  }
  // The selects appear only once their options are here: a select drawn before its options
  // drops the vehicle picked on the board and doesn't take it back when they arrive
  if (!vehicles.data || !drivers.data || !routes.data) {
    return <p className="px-4 text-sm text-muted-foreground">Loading the fleet…</p>
  }

  const vehicle = vehicles.data.items.find((candidate) => candidate.id === vehicleId)
  const route = routes.data.routes.find((candidate) => candidate.id === routeId)
  const departs = departureOf(day, time)
  // Until a route is picked, only the moment of departure is known
  const returns = departs !== null && route ? departs + route.roundTripMs : departs
  const note = (spans: BusySpan[] | undefined, to: number | null) =>
    departs === null || to === null ? '' : ` — ${availabilityNote(spans, departs, to)}`
  const isBusy = (spans: BusySpan[] | undefined) =>
    departs !== null && returns !== null && clashIn(spans, departs, returns) !== undefined

  return (
    <form
      noValidate
      className="flex flex-col gap-4 px-4"
      onSubmit={handleSubmit((values) => book.mutate(values))}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field id={`${id}-day`} label="Day" error={errors.day?.message}>
          <Input id={`${id}-day`} type="date" {...register('day')} />
        </Field>
        <Field id={`${id}-time`} label="Leaves at" error={errors.time?.message}>
          <Input id={`${id}-time`} type="time" step={900} {...register('time')} />
        </Field>
      </div>

      <Field id={`${id}-vehicle`} label="Vehicle" error={errors.vehicleId?.message}>
        <NativeSelect
          id={`${id}-vehicle`}
          aria-invalid={errors.vehicleId ? true : undefined}
          {...register('vehicleId', {
            // Another vehicle may need another licence and drives from another depot
            onChange: () => {
              setValue('driverId', '')
              setValue('routeId', '')
            },
          })}
        >
          <NativeSelectOption value="">Pick a vehicle</NativeSelectOption>
          {vehicles.data.items
            .filter((candidate) => candidate.status === 'active')
            .map((candidate) => (
              <NativeSelectOption key={candidate.id} value={candidate.id}>
                {`${candidate.plate} · ${VEHICLE_TYPE_LABELS[candidate.type]} · ${candidate.homeDepot.name}${note(busy.vehicles.get(candidate.id), departs)}`}
              </NativeSelectOption>
            ))}
        </NativeSelect>
      </Field>

      <Field id={`${id}-route`} label="Route" error={errors.routeId?.message}>
        <NativeSelect
          id={`${id}-route`}
          disabled={!vehicle}
          aria-invalid={errors.routeId ? true : undefined}
          {...register('routeId')}
        >
          <NativeSelectOption value="">
            {vehicle ? 'Pick a customer' : 'Pick a vehicle first'}
          </NativeSelectOption>
          {vehicle &&
            routesFor(vehicle, routes.data.routes).map((candidate) => (
              <NativeSelectOption key={candidate.id} value={candidate.id}>
                {/* Every route here starts at the vehicle's depot, so the customer is enough */}
                {`${candidate.name.split(' → ')[1] ?? candidate.name} · ${formatDuration(candidate.roundTripMs)}`}
              </NativeSelectOption>
            ))}
        </NativeSelect>
      </Field>

      <Field id={`${id}-driver`} label="Driver" error={errors.driverId?.message}>
        <NativeSelect
          id={`${id}-driver`}
          disabled={!vehicle}
          aria-invalid={errors.driverId ? true : undefined}
          {...register('driverId')}
        >
          <NativeSelectOption value="">
            {vehicle ? 'Pick a driver' : 'Pick a vehicle first'}
          </NativeSelectOption>
          {vehicle &&
            driversFor(vehicle, drivers.data.items)
              .map((candidate) => ({ candidate, spans: busy.drivers.get(candidate.id) }))
              // Drivers free for the whole trip come first
              .toSorted((a, b) => Number(isBusy(a.spans)) - Number(isBusy(b.spans)))
              .map(({ candidate, spans }) => (
                <NativeSelectOption key={candidate.id} value={candidate.id}>
                  {`${driverName(candidate)} · ${candidate.homeDepot.name}${note(spans, returns)}`}
                </NativeSelectOption>
              ))}
        </NativeSelect>
      </Field>

      {vehicle && route && departs !== null && (
        <BookingCheck
          departs={departs}
          route={route}
          vehicleSpans={busy.vehicles.get(vehicle.id)}
          driverSpans={driverId ? busy.drivers.get(driverId) : undefined}
          until={fleetDayStart(addDays(day, 1)).getTime()}
          onMove={(next) => setValue('time', fleetTime(new Date(next)), { shouldValidate: true })}
        />
      )}

      {book.isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getErrorMessage(book.error)}
        </p>
      )}

      <Button type="submit" disabled={book.isPending}>
        {book.isPending ? 'Booking…' : 'Book trip'}
      </Button>
    </form>
  )
}
