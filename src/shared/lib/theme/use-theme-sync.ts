import { useEffect } from 'react'

import { applyTheme, DARK_SCHEME_QUERY, resolveTheme } from './dom'
import { useThemeStore } from './model'

/** Applies the chosen theme to <html> and follows OS changes while "system" is selected. */
export function useThemeSync() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    applyTheme(resolveTheme(theme))
    if (theme !== 'system') return

    const media = window.matchMedia(DARK_SCHEME_QUERY)
    const handleChange = () => applyTheme(resolveTheme('system'))
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [theme])
}
