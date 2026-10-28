import { useTheme } from '@/shared/lib/theme'

import { THEME_OPTIONS } from '../config/theme-options'

/** The three themes side by side, the one in use marked: for the settings page. */
export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">Theme</legend>
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent/50 has-checked:border-primary has-checked:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            className="sr-only"
          />
          <Icon className="size-4" />
          {label}
        </label>
      ))}
    </fieldset>
  )
}
