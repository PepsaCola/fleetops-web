import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import type { NavigateOptions } from 'react-router'

import { TRIP_STATUS_LABELS } from '@/entities/trip'
import { addDays, fleetDate } from '@/shared/lib/fleet-time'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
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
  const day = search.day ?? today
  // Today is what the page shows without a day, so it stays out of the URL
  const showDay = (next: string) =>
    onSearchChange({ day: next === today ? undefined : next, page: 1 })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous day"
          onClick={() => showDay(addDays(day, -1))}
        >
          <ChevronLeftIcon />
        </Button>
        <Input
          type="date"
          aria-label="Day"
          required
          className="w-40"
          value={day}
          onChange={(event) => showDay(fields.day.parse(event.target.value) ?? today)}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Next day"
          onClick={() => showDay(addDays(day, 1))}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      {day !== today && (
        <Button variant="ghost" onClick={() => showDay(today)}>
          Today
        </Button>
      )}
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
