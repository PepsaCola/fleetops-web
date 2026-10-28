import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, server } from '@/shared/lib/test'

import { SettingsPage } from './settings-page'

describe('SettingsPage', () => {
  it('shows who is signed in and what their role allows', async () => {
    renderWithProviders(<SettingsPage />)

    expect(await screen.findByText('Demo Dispatcher')).toBeInTheDocument()
    expect(screen.getByText('dispatcher@fleetops.demo')).toBeInTheDocument()
    expect(screen.getByText(/Plans trips, moves them on the dispatch board/)).toBeInTheDocument()
  })

  it('switches the theme and remembers it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(localStorage.getItem('fleetops-theme')).toBe('dark')
  })

  it('signs out', async () => {
    let signedOut = false
    server.use(
      http.post('/api/v1/auth/logout', () => {
        signedOut = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />)

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(signedOut).toBe(true))
  })
})
