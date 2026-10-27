import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { sortingFromParam, sortingToParam } from './sort-param'

interface ListTableStateOptions<TSort extends string> {
  page: number
  pageSize: number
  sort: TSort
  /** Turns a sort parameter into a valid one, e.g. with the URL schema's sort field */
  parseSort: (sort: string | undefined) => TSort
  onChange: (patch: { page?: number; sort?: TSort }) => void
}

/**
 * Pagination and sorting for a server table whose page and order live outside it, in the URL.
 * The table shows them and reports what the user asked for through `onChange`; spread the result
 * into the useServerTable options.
 */
export function useListTableState<TSort extends string>({
  page,
  pageSize,
  sort,
  parseSort,
  onChange,
}: ListTableStateOptions<TSort>) {
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  )
  const sorting = useMemo(() => sortingFromParam(sort), [sort])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    onChange({ page: functionalUpdate(updater, pagination).pageIndex + 1 })
  }
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    // A new order starts again from the first page
    onChange({ sort: parseSort(sortingToParam(functionalUpdate(updater, sorting))), page: 1 })
  }

  return { state: { pagination, sorting }, onPaginationChange, onSortingChange }
}
