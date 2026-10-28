import { describe, expect, it } from 'vitest'

import { afterLoginPath, loginPath } from './login-redirect'

describe('login redirects', () => {
  it('remembers the page to come back to', () => {
    expect(loginPath('/dispatch?day=2026-03-10')).toBe('/login?next=%2Fdispatch%3Fday%3D2026-03-10')
    expect(loginPath('/')).toBe('/login')
    expect(afterLoginPath('/dispatch?day=2026-03-10')).toBe('/dispatch?day=2026-03-10')
  })

  it('never sends anyone to another site after signing in', () => {
    expect(afterLoginPath('//evil.example')).toBe('/')
    expect(afterLoginPath('/\\evil.example')).toBe('/')
    expect(afterLoginPath('https://evil.example')).toBe('/')
    expect(afterLoginPath(null)).toBe('/')
  })
})
