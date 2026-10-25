import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ThemeSwitcher } from './theme-switcher'

describe('ThemeSwitcher', () => {
  it('lets the user pick a theme', async () => {
    const user = userEvent.setup()
    render(<ThemeSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Change theme' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }))
    await user.click(screen.getByRole('button', { name: 'Change theme' }))

    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeChecked()
  })
})
