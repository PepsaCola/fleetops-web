import {
  createTableHook,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

export interface DataColumnMeta {
  /** Numbers read best right-aligned */
  align?: 'start' | 'end'
}

// FleetOps lists are paged and sorted by the API, so the table never processes rows itself: it
// renders the page it is given and reports what the user asked for (another page, another sort
// order) back to the page, which turns that into a new query.
export const {
  createAppColumnHelper: createServerColumnHelper,
  useAppTable: useServerTable,
  useTableContext: useServerTableContext,
} = createTableHook({
  features: tableFeatures({
    rowPaginationFeature,
    rowSortingFeature,
    columnMeta: metaHelper<DataColumnMeta>(),
  }),
  manualPagination: true,
  manualSorting: true,
  // The API sorts by one field from a fixed list, so a column opts in with enableSorting
  // and a click only flips the direction: there is always an order
  defaultColumn: { enableSorting: false },
  enableMultiSort: false,
  enableSortingRemoval: false,
  getRowId: (row: { id: string }) => row.id,
})
