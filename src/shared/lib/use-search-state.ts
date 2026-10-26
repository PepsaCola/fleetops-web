import { useCallback, useMemo } from 'react'
import { useSearchParams, type NavigateOptions } from 'react-router'
import type { z } from 'zod'

/**
 * State kept in the URL query string, typed by a Zod schema, so a list view can be bookmarked,
 * shared and restored with the Back button.
 *
 * Give every field a `.catch()`: a hand-edited URL then falls back to the default instead of
 * crashing the page. Values equal to their default are left out of the URL.
 */
export function useSearchState<TSchema extends z.ZodObject>(schema: TSchema) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(
    () => schema.parse(Object.fromEntries(searchParams)),
    [schema, searchParams],
  )

  const setState = useCallback(
    (patch: Partial<z.output<TSchema>>, options?: NavigateOptions) => {
      const defaults: Record<string, unknown> = schema.parse({})

      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined || value === defaults[key]) next.delete(key)
          else next.set(key, String(value))
        }
        return next
      }, options)
    },
    [schema, setSearchParams],
  )

  return [state, setState] as const
}
