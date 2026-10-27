import { useQuery } from '@tanstack/react-query'

import {
  DriverDocuments,
  DriverStatusBadge,
  driverName,
  driverQueries,
  formatPhone,
  type Driver,
} from '@/entities/driver'
import { createServerColumnHelper, useListTableState, useServerTable } from '@/shared/lib/table'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorState } from '@/shared/ui/error-state'

import {
  DRIVERS_PAGE_SIZE,
  DriverListSearchSchema,
  isFiltered,
  type DriverListSearch,
} from '../model/driver-list-search'

const column = createServerColumnHelper<Driver>()

// Sortable columns use the API's sort field names as their ids
const columns = column.columns([
  column.accessor('lastName', {
    header: 'Driver',
    enableSorting: true,
    cell: ({ row }) => <span className="font-medium">{driverName(row.original)}</span>,
  }),
  column.accessor('phone', {
    header: 'Phone',
    cell: (info) => <span className="tabular-nums">{formatPhone(info.getValue())}</span>,
  }),
  column.accessor('licenseCategories', {
    header: 'Licence',
    cell: (info) => info.getValue().join(', '),
  }),
  column.accessor('documentsExpireOn', {
    header: 'Documents',
    enableSorting: true,
    cell: ({ row }) => <DriverDocuments driver={row.original} />,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: (info) => <DriverStatusBadge status={info.getValue()} />,
  }),
  column.accessor('homeDepot.name', { header: 'Home depot' }),
])

// A stable fallback: a new [] on every render would make the table rebuild its rows each time
const NO_DRIVERS: Driver[] = []

const parseSort = (sort: string | undefined) => DriverListSearchSchema.shape.sort.parse(sort)

interface DriversTableProps {
  search: DriverListSearch
  onSearchChange: (patch: Partial<DriverListSearch>) => void
}

export function DriversTable({ search, onSearchChange }: DriversTableProps) {
  const { data, error, isPending, isError, isPlaceholderData, refetch } = useQuery(
    driverQueries.list({
      page: search.page,
      pageSize: DRIVERS_PAGE_SIZE,
      sort: search.sort,
      search: search.search,
      status: search.status,
      documents: search.documents,
    }),
  )
  // The URL owns page and order; the table only reports what the user asked for
  const tableState = useListTableState({
    page: search.page,
    pageSize: DRIVERS_PAGE_SIZE,
    sort: search.sort,
    parseSort,
    onChange: onSearchChange,
  })
  const table = useServerTable({
    columns,
    data: data?.items ?? NO_DRIVERS,
    rowCount: data?.total,
    ...tableState,
  })

  if (isError && !data) return <ErrorState error={error} onRetry={refetch} />

  return (
    <table.AppTable>
      <DataTable
        isLoading={isPending}
        isStale={isPlaceholderData}
        emptyMessage={emptyMessage(search, data?.total ?? 0)}
      />
      {data !== undefined && data.total > 0 && <DataTablePagination />}
    </table.AppTable>
  )
}

function emptyMessage(search: DriverListSearch, total: number) {
  // Rows exist, just not here: the URL points past the last page
  if (total > 0) return 'There are no drivers on this page.'
  return isFiltered(search) ? 'No drivers match these filters.' : 'No drivers yet.'
}
