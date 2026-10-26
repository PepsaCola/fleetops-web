import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

import { useServerTableContext } from '@/shared/lib/table'

import { Button } from './button'

const numbers = new Intl.NumberFormat('en-US')

/** Page position and navigation for the table of the nearest `<table.AppTable>`. */
export function DataTablePagination() {
  const table = useServerTableContext()
  const { pageIndex, pageSize } = table.state.pagination
  const rowCount = table.getRowCount()
  const pageCount = Math.max(table.getPageCount(), 1)

  const first = Math.min(pageIndex * pageSize + 1, rowCount)
  const last = Math.min((pageIndex + 1) * pageSize, rowCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
      <p className="text-muted-foreground">
        {numbers.format(first)}–{numbers.format(last)} of {numbers.format(rowCount)}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <span className="mr-2 tabular-nums">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden sm:inline-flex"
          aria-label="First page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.firstPage()}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden sm:inline-flex"
          aria-label="Last page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.lastPage()}
        >
          <ChevronsRightIcon />
        </Button>
      </nav>
    </div>
  )
}
