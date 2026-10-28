import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { addDays, type IsoDate } from '@/shared/lib/fleet-time'

import { Button } from './button'
import { Input } from './input'

interface DayPickerProps {
  day: IsoDate
  /** Where "Today" leads, and what a cleared date falls back to */
  today: IsoDate
  onDayChange: (day: IsoDate) => void
}

/** Steps through days with arrows, picks one from a calendar, or jumps back to today. */
export function DayPicker({ day, today, onDayChange }: DayPickerProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous day"
        onClick={() => onDayChange(addDays(day, -1))}
      >
        <ChevronLeftIcon />
      </Button>
      <Input
        type="date"
        aria-label="Day"
        required
        className="w-40"
        value={day}
        onChange={(event) => onDayChange(event.target.value || today)}
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="Next day"
        onClick={() => onDayChange(addDays(day, 1))}
      >
        <ChevronRightIcon />
      </Button>
      {day !== today && (
        <Button variant="ghost" onClick={() => onDayChange(today)}>
          Today
        </Button>
      )}
    </div>
  )
}
