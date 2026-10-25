import { beforeEach, describe, expect, it } from 'vitest'

import { isTheme, THEME_STORAGE_KEY, useThemeStore } from './model'

describe('theme store', () => {
  beforeEach(() => useThemeStore.setState({ theme: 'system' }))

  it('remembers the chosen theme across reloads', () => {
    useThemeStore.getState().setTheme('dark')

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })
})

describe('isTheme', () => {
  it.each(['light', 'dark', 'system'])('accepts %s', (value) => {
    expect(isTheme(value)).toBe(true)
  })

  it.each(['sepia', '', null])('rejects %j', (value) => {
    expect(isTheme(value)).toBe(false)
  })
})
