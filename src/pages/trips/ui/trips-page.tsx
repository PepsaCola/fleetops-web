import { useSearchState } from '@/shared/lib/use-search-state'
import { PageHeader } from '@/shared/ui/page-header'

import { TripListSearchSchema } from '../model/trip-list-search'
import { TripsTable } from './trips-table'
import { TripsToolbar } from './trips-toolbar'

export function TripsPage() {
  const [search, setSearch] = useSearchState(TripListSearchSchema)

  return (
    <>
      <PageHeader
        title="Trips"
        description="Who drives which vehicle where, day by day. Times are Kyiv time; statuses follow the clock."
      />
      <div className="flex flex-col gap-4">
        <TripsToolbar search={search} onSearchChange={setSearch} />
        <TripsTable search={search} onSearchChange={setSearch} />
      </div>
    </>
  )
}
