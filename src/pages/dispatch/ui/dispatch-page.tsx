import { fleetDate } from '@/shared/lib/fleet-time'
import { useSearchState } from '@/shared/lib/use-search-state'
import { DayPicker } from '@/shared/ui/day-picker'
import { PageHeader } from '@/shared/ui/page-header'
import { DispatchBoard } from '@/widgets/dispatch-board'

import { DispatchSearchSchema } from '../model/dispatch-search'

export function DispatchPage() {
  const [search, setSearch] = useSearchState(DispatchSearchSchema)
  const today = fleetDate()
  const day = search.day ?? today

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Every vehicle's trips across the day, on Kyiv time. Click a trip for its details, drag a planned one to move it, or click empty time to book one."
      />
      <div className="flex flex-col gap-4">
        <DayPicker
          day={day}
          today={today}
          // Today is what the board shows without a day, so it stays out of the URL
          onDayChange={(next) => setSearch({ day: next === today ? undefined : next })}
        />
        <DispatchBoard day={day} />
      </div>
    </>
  )
}
