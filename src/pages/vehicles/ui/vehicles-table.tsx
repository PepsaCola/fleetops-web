import { useQuery } from '@tanstack/react-query'
import { functionalUpdate, type PaginationState } from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  VEHICLE_TYPE_LABELS,
  VehicleStatusBadge,
  vehicleQueries,
  type Vehicle,
} from '@/entities/vehicle'
import {
  createServerColumnHelper,
  sortingFromParam,
  sortingToParam,
  useServerTable,
} from '@/shared/lib/table'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorState } from '@/shared/ui/error-state'

import {
  VEHICLES_PAGE_SIZE,
  VehicleListSearchSchema,
  type VehicleListSearch,
} from '../model/vehicle-list-search'

const column = createServerColumnHelper<Vehicle>()
const numbers = new Intl.NumberFormat('en-US')

// Sortable columns use the API's sort field names as their ids
const columns = column.columns([
  column.accessor('plate', {
    header: 'Plate',
    enableSorting: true,
    cell: (info) => <span className="font-mono font-medium">{info.getValue()}</span>,
  }),
  column.accessor('model', {
    header: 'Vehicle',
    cell: ({ row }) => `${row.original.make} ${row.original.model}`,
  }),
  column.accessor('year', { header: 'Year', enableSorting: true }),
  column.accessor('type', {
    header: 'Type',
    cell: (info) => VEHICLE_TYPE_LABELS[info.getValue()],
  }),
  column.accessor('status', {
    header: 'Status',
    cell: (info) => <VehicleStatusBadge status={info.getValue()} />,
  }),
  column.accessor('homeDepot.name', { header: 'Home depot' }),
  column.accessor('odometerKm', {
    header: 'Odometer',
    enableSorting: true,
    cell: (info) => `${numbers.format(info.getValue())} km`,
    meta: { align: 'end' },
  }),
  column.accessor('capacityKg', {
    header: 'Capacity',
    enableSorting: true,
    cell: (info) => `${numbers.format(info.getValue())} kg`,
    meta: { align: 'end' },
  }),
])

// A stable fallback: a new [] on every render would make the table rebuild its rows each time
const NO_VEHICLES: Vehicle[] = []

interface VehiclesTableProps {
  search: VehicleListSearch
  onSearchChange: (patch: Partial<VehicleListSearch>) => void
}

export function VehiclesTable({ search, onSearchChange }: VehiclesTableProps) {
  const { data, error, isPending, isError, isPlaceholderData, refetch } = useQuery(
    vehicleQueries.list({ page: search.page, pageSize: VEHICLES_PAGE_SIZE, sort: search.sort }),
  )

  // The URL owns page and order; the table only reports what the user asked for
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: search.page - 1, pageSize: VEHICLES_PAGE_SIZE }),
    [search.page],
  )
  const sorting = useMemo(() => sortingFromParam(search.sort), [search.sort])

  const table = useServerTable({
    columns,
    data: data?.items ?? NO_VEHICLES,
    rowCount: data?.total,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      onSearchChange({ page: functionalUpdate(updater, pagination).pageIndex + 1 })
    },
    onSortingChange: (updater) => {
      const sort = sortingToParam(functionalUpdate(updater, sorting))
      // A new order starts again from the first page
      onSearchChange({ sort: VehicleListSearchSchema.shape.sort.parse(sort), page: 1 })
    },
  })

  if (isError && !data) return <ErrorState error={error} onRetry={refetch} />

  return (
    <table.AppTable>
      <DataTable
        isLoading={isPending}
        isStale={isPlaceholderData}
        // Total above zero with no rows means the URL points past the last page
        emptyMessage={data?.total ? 'There are no vehicles on this page.' : 'No vehicles yet.'}
      />
      {data !== undefined && data.total > 0 && <DataTablePagination />}
    </table.AppTable>
  )
}
