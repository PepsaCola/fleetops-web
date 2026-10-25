/** Data attached to a route through `handle`; the app header reads it with useMatches(). */
export interface RouteHandle {
  title: string
}

export const isRouteHandle = (value: unknown): value is RouteHandle =>
  typeof value === 'object' && value !== null && 'title' in value && typeof value.title === 'string'
