import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from 'lucide-react'

import type { Theme } from '@/shared/lib/theme'

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
] as const satisfies ReadonlyArray<{ value: Theme; label: string; Icon: LucideIcon }>
