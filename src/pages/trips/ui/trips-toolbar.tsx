import { XIcon } from 'lucide-react'
import type { NavigateOptions } from 'react-router'

import { TRIP_STATUS_LABELS } from '@/entities/trip'
import { fleetDate } from '@/shared/lib/fleet-time'
import { Button } from '@/shared/ui/button'
import { DayPicker } from '@/shared/ui/day-picker'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

import {
  isFiltered,
  TRIP_STATUS_OPTIONS,
  TripListSearchSchema,
  type TripListSearch,
} from '../model/trip-list-search'

// Parsing through the URL schema turns "" and bad values into undefined
const fields = TripListSearchSchema.shape

interface TripsToolbarProps {
  search: TripListSearch
  onSearchChange: (patch: Partial<TripListSearch>, options?: NavigateOptions) => void
}

/** The day and the status filter above the trip table; every change starts again from the first page. */
export function TripsToolbar({ search, onSearchChange }: TripsToolbarProps) {
  const today = fleetDate()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DayPicker
        day={search.day ?? today}
        today={today}
        // Today is what the page shows without a day, so it stays out of the URL
        onDayChange={(day) => onSearchChange({ day: day === today ? undefined : day, page: 1 })}
      />
      <NativeSelect
        aria-label="Status"
        value={search.status ?? ''}
        onChange={(event) =>
          onSearchChange({ status: fields.status.parse(event.target.value), page: 1 })
        }
      >
        <NativeSelectOption value="">All statuses</NativeSelectOption>
        {TRIP_STATUS_OPTIONS.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {TRIP_STATUS_LABELS[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {isFiltered(search) && (
        <Button variant="ghost" onClick={() => onSearchChange({ status: undefined, page: 1 })}>
          Reset
          <XIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}
