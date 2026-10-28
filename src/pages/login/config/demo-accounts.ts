// The demo's own sign-ins, created by the API's seed. Every visitor is offered them, so they
// are no secret.
export const DEMO_ACCOUNTS = [
  {
    role: 'dispatcher',
    description: 'Plans trips, moves them on the board, books new ones',
    email: 'dispatcher@fleetops.demo',
    password: 'fleetops-demo',
  },
  {
    role: 'viewer',
    description: 'Sees everything, changes nothing',
    email: 'viewer@fleetops.demo',
    password: 'fleetops-demo',
  },
] as const
