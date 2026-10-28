import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { tripQueries } from '@/entities/trip'
import { vehicleQueries } from '@/entities/vehicle'
import { WORK_ORDER_KIND_LABELS, workOrderQueries } from '@/entities/work-order'
import { createWorkOrder, getErrorMessage } from '@/shared/api'
import { fleetTime } from '@/shared/lib/fleet-time.ts'
import { Button } from '@/shared/ui/button.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet.tsx'

import {
  bookingsOf,
  NewWorkOrderSchema,
  WORK_ORDER_KIND_OPTIONS,
  workOrderOf,
  type NewWorkOrderValues,
  type WorkOrderDraft,
} from '@/features/create-work-order/model/new-work-order.ts'

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

/** What else the picked vehicle is booked for on the first day of the work */
function VehicleDay({ vehicleId, day }: { vehicleId: string; day: string }) {
  const trips = useQuery(tripQueries.day(day))
  const workOrders = useQuery(workOrderQueries.day(day))
  if (!trips.data || !workOrders.data) return null

  const bookings = bookingsOf(vehicleId, trips.data, workOrders.data.items)
  return (
    <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
      {bookings.length > 0
        ? `Booked that day: ${bookings.join(' · ')}`
        : 'Nothing booked for it that day.'}
    </p>
  )
}

function NewWorkOrderForm({ draft, onBooked }: { draft: WorkOrderDraft; onBooked: () => void }) {
  const id = useId()
  const queryClient = useQueryClient()
  // The whole fleet fits on one page
  const vehicles = useQuery(vehicleQueries.list({ pageSize: 100 }))
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewWorkOrderValues>({
    resolver: zodResolver(NewWorkOrderSchema),
    defaultValues: {
      vehicleId: draft.vehicleId ?? '',
      kind: 'repair',
      startDay: draft.day,
      startTime: '08:00',
      endDay: draft.day,
      endTime: '12:00',
      costUah: 0,
      note: '',
    },
  })
  const [vehicleId, startDay] = useWatch({ control, name: ['vehicleId', 'startDay'] })

  const book = useMutation({
    mutationFn: (values: NewWorkOrderValues) => createWorkOrder({ body: workOrderOf(values) }),
    onSuccess: async (order) => {
      toast.success(
        `Work order #${order.number} is booked: ${order.vehicle.plate}, ${fleetTime(order.startsAt)}–${fleetTime(order.endsAt)}`,
      )
      onBooked()
      await queryClient.invalidateQueries({ queryKey: workOrderQueries.all() })
    },
  })

  if (vehicles.error) {
    return (
      <p role="alert" className="px-4 text-sm text-destructive">
        {getErrorMessage(vehicles.error)}
      </p>
    )
  }
  // The vehicle select appears only once its options are here, so a vehicle picked in advance sticks
  if (!vehicles.data) {
    return <p className="px-4 text-sm text-muted-foreground">Loading the fleet…</p>
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4 px-4"
      onSubmit={handleSubmit((values) => book.mutate(values))}
    >
      <Field id={`${id}-vehicle`} label="Vehicle" error={errors.vehicleId?.message}>
        <NativeSelect
          id={`${id}-vehicle`}
          aria-invalid={errors.vehicleId ? true : undefined}
          {...register('vehicleId')}
        >
          <NativeSelectOption value="">Pick a vehicle</NativeSelectOption>
          {/* A vehicle out of service for good doesn't go to the workshop */}
          {vehicles.data.items
            .filter((candidate) => candidate.status !== 'inactive')
            .map((candidate) => (
              <NativeSelectOption key={candidate.id} value={candidate.id}>
                {`${candidate.plate} · ${candidate.make} ${candidate.model} · ${candidate.homeDepot.name}`}
              </NativeSelectOption>
            ))}
        </NativeSelect>
      </Field>

      <Field id={`${id}-kind`} label="Work" error={errors.kind?.message}>
        <NativeSelect id={`${id}-kind`} {...register('kind')}>
          {WORK_ORDER_KIND_OPTIONS.map((kind) => (
            <NativeSelectOption key={kind} value={kind}>
              {WORK_ORDER_KIND_LABELS[kind]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id={`${id}-start-day`} label="From" error={errors.startDay?.message}>
          <Input id={`${id}-start-day`} type="date" {...register('startDay')} />
        </Field>
        <Field id={`${id}-start-time`} label="at" error={errors.startTime?.message}>
          <Input id={`${id}-start-time`} type="time" step={900} {...register('startTime')} />
        </Field>
        <Field id={`${id}-end-day`} label="Until" error={errors.endDay?.message}>
          <Input id={`${id}-end-day`} type="date" {...register('endDay')} />
        </Field>
        <Field id={`${id}-end-time`} label="at" error={errors.endTime?.message}>
          <Input id={`${id}-end-time`} type="time" step={900} {...register('endTime')} />
        </Field>
      </div>

      {vehicleId && startDay && <VehicleDay vehicleId={vehicleId} day={startDay} />}

      <Field id={`${id}-cost`} label="Cost, ₴" error={errors.costUah?.message}>
        <Input
          id={`${id}-cost`}
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          {...register('costUah', { valueAsNumber: true })}
        />
      </Field>

      <Field id={`${id}-note`} label="Note" error={errors.note?.message}>
        <Input id={`${id}-note`} maxLength={500} {...register('note')} />
      </Field>

      {book.isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getErrorMessage(book.error)}
        </p>
      )}

      <Button type="submit" disabled={book.isPending}>
        {book.isPending ? 'Booking…' : 'Book work order'}
      </Button>
    </form>
  )
}

interface NewWorkOrderSheetProps {
  /** What the form starts from; the sheet is closed without one */
  draft: WorkOrderDraft | null
  onClose: () => void
}

/** The form for booking a vehicle into the workshop, beside the page. */
export function NewWorkOrderSheet({ draft, onClose }: NewWorkOrderSheetProps) {
  return (
    <Sheet open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New work order</SheetTitle>
          <SheetDescription>
            Book a vehicle into the workshop. It can&apos;t go on a trip while it&apos;s there, so
            pick a time it&apos;s free.
          </SheetDescription>
        </SheetHeader>
        {draft && <NewWorkOrderForm draft={draft} onBooked={onClose} />}
      </SheetContent>
    </Sheet>
  )
}
