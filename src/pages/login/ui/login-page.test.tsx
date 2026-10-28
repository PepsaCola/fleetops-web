import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type { CurrentUser } from '@/shared/api'
import { renderWithProviders, server } from '@/shared/lib/test'

import { LoginPage } from './login-page'

/** An API that knows one password; returns every sign-in attempt it got. */
function serveLogin() {
  const attempts: unknown[] = []
  server.use(
    http.post('/api/v1/auth/login', async ({ request }) => {
      const credentials = (await request.json()) as { email: string; password: string }
      attempts.push(credentials)
      if (credentials.password !== 'fleetops-demo') {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unauthorized',
            status: 401,
            code: 'UNAUTHORIZED',
            detail: 'Wrong email or password',
          },
          { status: 401, headers: { 'content-type': 'application/problem+json' } },
        )
      }
      return HttpResponse.json({
        id: '0199d2a4-0000-7000-8000-000000000001',
        email: credentials.email,
        name: 'Demo Dispatcher',
        role: 'dispatcher',
      } satisfies CurrentUser)
    }),
  )
  return attempts
}

describe('LoginPage', () => {
  it('signs in as the demo dispatcher in one click, then goes where the visitor was heading', async () => {
    const attempts = serveLogin()
    const user = userEvent.setup()

    const { router } = renderWithProviders(<LoginPage />, { url: '/login?next=%2Fdispatch' })
    await user.click(screen.getByRole('button', { name: /Sign in as dispatcher/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/dispatch'))
    expect(attempts).toEqual([{ email: 'dispatcher@fleetops.demo', password: 'fleetops-demo' }])
  })

  it('says so when the password is wrong', async () => {
    serveLogin()
    const user = userEvent.setup()

    renderWithProviders(<LoginPage />, { url: '/login' })
    await user.type(screen.getByLabelText('Email'), 'dispatcher@fleetops.demo')
    await user.type(screen.getByLabelText('Password'), 'guess')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password')
  })
})
