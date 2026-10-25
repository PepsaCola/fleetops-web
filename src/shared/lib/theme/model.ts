import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<Theme, 'system'>

// Keep in sync with the inline script in index.html that applies the theme before first paint
export const THEME_STORAGE_KEY = 'fleetops-theme'

export const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system'

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // storage is unavailable (e.g. private mode) — the choice lives until reload
    }
    set({ theme })
  },
}))

export function useTheme() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  return { theme, setTheme }
}
