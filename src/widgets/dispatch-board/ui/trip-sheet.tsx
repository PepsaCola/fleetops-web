import { Link } from 'react-router'

import { driverName } from '@/entities/driver'
import { TripStatusBadge, type Trip } from '@/entities/trip'
import { CancelTripButton } from '@/features/cancel-trip'
import { fleetDate, fleetTime } from '@/shared/lib/fleet-time'
import { driverPath, vehiclePath } from '@/shared/routes'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

interface TripSheetProps {
  /** The trip to show; the sheet is closed without one */
  trip: Trip | undefined
  /** Whether the user may change trips; a viewer only sees the details */
  canEdit: boolean
  onClose: () => void
}

/** A trip's details beside the board, with what can still be done to it. */
export function TripSheet({ trip, canEdit, onClose }: TripSheetProps) {
  return (
    <Sheet open={trip !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {trip && (
          <>
            <SheetHeader>
              <SheetTitle>Trip #{trip.number}</SheetTitle>
              <SheetDescription>{trip.route.name}</SheetDescription>
            </SheetHeader>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 px-4 text-sm">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <TripStatusBadge status={trip.status} />
              </dd>
              <dt className="text-muted-foreground">Vehicle</dt>
              <dd>
                <Link
                  to={vehiclePath(trip.vehicle.id)}
                  className="font-mono underline-offset-4 hover:underline"
                >
                  {trip.vehicle.plate}
                </Link>
              </dd>
              <dt className="text-muted-foreground">Driver</dt>
              <dd>
                <Link
                  to={driverPath(trip.driver.id)}
                  className="underline-offset-4 hover:underline"
                >
                  {driverName(trip.driver)}
                </Link>
              </dd>
              <dt className="text-muted-foreground">Day</dt>
              <dd className="tabular-nums">{fleetDate(trip.departsAt)}</dd>
              <dt className="text-muted-foreground">Leaves the depot</dt>
              <dd className="tabular-nums">{fleetTime(trip.departsAt)}</dd>
              <dt className="text-muted-foreground">At the customer</dt>
              <dd className="tabular-nums">{fleetTime(trip.arrivesAt)}</dd>
              <dt className="text-muted-foreground">Back at the depot</dt>
              <dd className="tabular-nums">{fleetTime(trip.returnsAt)}</dd>
            </dl>
            {canEdit && trip.status === 'planned' && (
              <SheetFooter>
                <CancelTripButton trip={trip} onCancelled={onClose} />
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
