import { useSearchState } from '@/shared/lib/use-search-state'
import { PageHeader } from '@/shared/ui/page-header'

import { VehicleListSearchSchema } from '../model/vehicle-list-search'
import { VehiclesTable } from './vehicles-table'
import { VehiclesToolbar } from './vehicles-toolbar'

export function VehiclesPage() {
  const [search, setSearch] = useSearchState(VehicleListSearchSchema)

  return (
    <>
      <PageHeader title="Vehicles" description="Your fleet and its condition." />
      <div className="flex flex-col gap-4">
        <VehiclesToolbar search={search} onSearchChange={setSearch} />
        <VehiclesTable search={search} onSearchChange={setSearch} />
      </div>
    </>
  )
}
