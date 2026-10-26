import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { useServerTableContext } from '@/shared/lib/table'
import { cn } from '@/shared/lib/utils'

import { Skeleton } from './skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

interface DataTableProps {
  /** The first page is still loading: placeholder rows stand in for it */
  isLoading?: boolean
  /** The rows on screen are from the previous request while a new one runs */
  isStale?: boolean
  emptyMessage?: ReactNode
}

type SortDirection = false | 'asc' | 'desc'

const LOADING_ROWS = 8

const alignClass = (align: 'start' | 'end' | undefined) => (align === 'end' ? 'text-right' : '')

const ariaSort = (direction: SortDirection) =>
  direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ArrowUpIcon />
  if (direction === 'desc') return <ArrowDownIcon />
  return <ChevronsUpDownIcon className="opacity-40" />
}

/** Renders the table of the nearest `<table.AppTable>` (see useServerTable). */
export function DataTable({
  isLoading = false,
  isStale = false,
  emptyMessage = 'Nothing to show.',
}: DataTableProps) {
  const table = useServerTableContext()
  const columns = table.getAllLeafColumns()
  const rows = table.getRowModel().rows

  return (
    <div className="rounded-lg border">
      <Table
        aria-busy={isLoading || isStale}
        className={cn('transition-opacity', isStale && 'opacity-60')}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  aria-sort={ariaSort(header.column.getIsSorted())}
                  className={alignClass(header.column.columnDef.meta?.align)}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5 [&_svg]:shrink-0"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                      <SortIcon direction={header.column.getIsSorted()} />
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: LOADING_ROWS }, (_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-5" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={alignClass(cell.column.columnDef.meta?.align)}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
