import { setupServer } from 'msw/node'

/** API mock shared by all tests; a test adds the handlers it needs with server.use(...) */
export const server = setupServer()
