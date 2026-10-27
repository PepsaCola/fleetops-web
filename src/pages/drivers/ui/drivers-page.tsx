import { useSearchState } from '@/shared/lib/use-search-state'
import { PageHeader } from '@/shared/ui/page-header'

import { DriverListSearchSchema } from '../model/driver-list-search'
import { DriversTable } from './drivers-table'
import { DriversToolbar } from './drivers-toolbar'

export function DriversPage() {
  const [search, setSearch] = useSearchState(DriverListSearchSchema)

  return (
    <>
      <PageHeader title="Drivers" description="Your drivers and the state of their documents." />
      <div className="flex flex-col gap-4">
        <DriversToolbar search={search} onSearchChange={setSearch} />
        <DriversTable search={search} onSearchChange={setSearch} />
      </div>
    </>
  )
}
