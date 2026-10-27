import { useQuery } from '@tanstack/react-query'

import { driverName } from '@/entities/driver'
import { ROUTE_KIND_LABELS, TripStatusBadge, tripQueries, type Trip } from '@/entities/trip'
import { fleetDate, fleetTime } from '@/shared/lib/fleet-time'
import { createServerColumnHelper, useListTableState, useServerTable } from '@/shared/lib/table'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorState } from '@/shared/ui/error-state'

import {
  isFiltered,
  TRIPS_PAGE_SIZE,
  TripListSearchSchema,
  type TripListSearch,
} from '../model/trip-list-search'

const column = createServerColumnHelper<Trip>()

const time = (at: string) => <span className="tabular-nums">{fleetTime(at)}</span>

// Sortable columns use the API's sort field names as their ids
const columns = column.columns([
  column.accessor('number', {
    header: 'Trip',
    enableSorting: true,
    cell: (info) => <span className="font-mono font-medium">#{info.getValue()}</span>,
  }),
  column.accessor('departsAt', {
    header: 'Departs',
    enableSorting: true,
    cell: (info) => time(info.getValue()),
  }),
  column.accessor('route', {
    header: 'Route',
    cell: (info) => (
      <div className="min-w-48">
        <div className="font-medium">{info.getValue().name}</div>
        <div className="text-muted-foreground">{ROUTE_KIND_LABELS[info.getValue().kind]}</div>
      </div>
    ),
  }),
  column.accessor('vehicle.plate', {
    header: 'Vehicle',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  column.accessor('driver', {
    header: 'Driver',
    cell: (info) => driverName(info.getValue()),
  }),
  column.accessor('arrivesAt', {
    header: 'At customer',
    cell: (info) => time(info.getValue()),
  }),
  column.accessor('returnsAt', {
    header: 'Back',
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {time(row.original.returnsAt)}
        {/* Night runs come back after midnight */}
        {fleetDate(row.original.returnsAt) !== fleetDate(row.original.departsAt) && (
          <span className="text-muted-foreground"> +1 day</span>
        )}
      </span>
    ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: (info) => <TripStatusBadge status={info.getValue()} />,
  }),
])

// A stable fallback: a new [] on every render would make the table rebuild its rows each time
const NO_TRIPS: Trip[] = []

const parseSort = (sort: string | undefined) => TripListSearchSchema.shape.sort.parse(sort)

interface TripsTableProps {
  search: TripListSearch
  onSearchChange: (patch: Partial<TripListSearch>) => void
}

export function TripsTable({ search, onSearchChange }: TripsTableProps) {
  const { data, error, isPending, isError, isPlaceholderData, refetch } = useQuery(
    tripQueries.list({
      page: search.page,
      pageSize: TRIPS_PAGE_SIZE,
      sort: search.sort,
      day: search.day,
      status: search.status,
    }),
  )
  // The URL owns page and order; the table only reports what the user asked for
  const tableState = useListTableState({
    page: search.page,
    pageSize: TRIPS_PAGE_SIZE,
    sort: search.sort,
    parseSort,
    onChange: onSearchChange,
  })
  const table = useServerTable({
    columns,
    data: data?.items ?? NO_TRIPS,
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

function emptyMessage(search: TripListSearch, total: number) {
  // Rows exist, just not here: the URL points past the last page
  if (total > 0) return 'There are no trips on this page.'
  return isFiltered(search) ? 'No trips match these filters.' : 'No trips on this day.'
}
