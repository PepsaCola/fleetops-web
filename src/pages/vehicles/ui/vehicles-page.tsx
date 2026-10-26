import { useSearchState } from '@/shared/lib/use-search-state'
import { PageHeader } from '@/shared/ui/page-header'

import { VehicleListSearchSchema } from '../model/vehicle-list-search'
import { VehiclesTable } from './vehicles-table'

export function VehiclesPage() {
  const [search, setSearch] = useSearchState(VehicleListSearchSchema)

  return (
    <>
      <PageHeader title="Vehicles" description="Your fleet and its condition." />
      <VehiclesTable search={search} onSearchChange={setSearch} />
    </>
  )
}
