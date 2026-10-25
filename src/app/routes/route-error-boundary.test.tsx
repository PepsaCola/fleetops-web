import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RouteErrorBoundary } from './route-error-boundary'

function renderCrashingPage(error: Error) {
  function CrashingPage(): never {
    throw error
  }
  const router = createMemoryRouter([
    { path: '/', Component: CrashingPage, ErrorBoundary: RouteErrorBoundary },
  ])
  render(<RouterProvider router={router} />)
}

describe('RouteErrorBoundary', () => {
  // React and the router log caught render errors; keep the test output readable
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('shows what went wrong and a way back', async () => {
    renderCrashingPage(new Error('Telemetry feed is down'))

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Telemetry feed is down')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/')
  })

  it('asks for a reload when a deploy replaced the page chunks', async () => {
    renderCrashingPage(new TypeError('Failed to fetch dynamically imported module: /assets/x.js'))

    expect(await screen.findByText('A new version is available')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })
})
