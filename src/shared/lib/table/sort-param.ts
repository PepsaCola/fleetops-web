import type { SortingState } from '@tanstack/react-table'

// The API sorts by one field, written as "year" (ascending) or "-year" (descending)

/** Turns the API's sort parameter into table sorting state. */
export function sortingFromParam(sort: string): SortingState {
  const desc = sort.startsWith('-')
  return [{ id: desc ? sort.slice(1) : sort, desc }]
}

/** Turns table sorting state into the API's sort parameter; undefined when nothing is sorted. */
export function sortingToParam(sorting: SortingState): string | undefined {
  const [first] = sorting
  if (!first) return undefined
  return first.desc ? `-${first.id}` : first.id
}
