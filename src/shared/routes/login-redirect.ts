import { paths } from './paths'

/** The login page, remembering where to go once signed in. */
export function loginPath(next?: string) {
  return next && next !== paths.dashboard
    ? `${paths.login}?${new URLSearchParams({ next })}`
    : paths.login
}

/** Where to go after signing in: a page of this app only, never another site (`//evil.example` included). */
export function afterLoginPath(next: string | null) {
  return next?.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : paths.dashboard
}
