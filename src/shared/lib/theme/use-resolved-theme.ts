import { useSyncExternalStore } from 'react'

import { DARK_SCHEME_QUERY } from './dom'
import { useThemeStore, type ResolvedTheme } from './model'

function subscribeToScheme(onChange: () => void) {
  const media = window.matchMedia(DARK_SCHEME_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const prefersDark = () => window.matchMedia(DARK_SCHEME_QUERY).matches

/** The theme on screen: the one the user picked, or the OS's while "system" is picked. */
export function useResolvedTheme(): ResolvedTheme {
  const theme = useThemeStore((state) => state.theme)
  const systemIsDark = useSyncExternalStore(subscribeToScheme, prefersDark)

  if (theme !== 'system') return theme
  return systemIsDark ? 'dark' : 'light'
}
