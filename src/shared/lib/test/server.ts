import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { CurrentUser, WorkOrderList } from '@/shared/api'

/** Who tests are signed in as unless they say otherwise: a dispatcher, who may change anything */
export const testDispatcher: CurrentUser = {
  id: '0199d2a4-0000-7000-8000-0000000000aa',
  email: 'dispatcher@fleetops.demo',
  name: 'Demo Dispatcher',
  role: 'dispatcher',
}

/** API mock shared by all tests; a test adds the handlers it needs with server.use(...) */
export const server = setupServer(
  http.get('/api/v1/auth/me', () => HttpResponse.json(testDispatcher)),
  // The workshop is empty unless a test books it
  http.get('/api/v1/work-orders', () => HttpResponse.json({ items: [] } satisfies WorkOrderList)),
)
