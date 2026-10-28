import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'

import type { TripDraft } from '../model/new-trip'
import { NewTripForm } from './new-trip-form'

interface NewTripSheetProps {
  /** What the form starts from; the sheet is closed without one */
  draft: TripDraft | null
  onClose: () => void
}

/** The booking form beside the page, opened from a button or from a spot on the board. */
export function NewTripSheet({ draft, onClose }: NewTripSheetProps) {
  return (
    <Sheet open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New trip</SheetTitle>
          <SheetDescription>
            Pick when it leaves, a vehicle, a customer and a driver. The form shows who is free then
            and when the trip is back.
          </SheetDescription>
        </SheetHeader>
        {draft && <NewTripForm draft={draft} onBooked={onClose} />}
      </SheetContent>
    </Sheet>
  )
}
