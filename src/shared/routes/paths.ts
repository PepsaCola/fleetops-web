export const paths = {
  login: '/login',
  dashboard: '/',
  liveMap: '/map',
  trips: '/trips',
  dispatch: '/dispatch',
  vehicles: '/vehicles',
  vehicle: '/vehicles/:vehicleId',
  maintenance: '/maintenance',
  drivers: '/drivers',
  driver: '/drivers/:driverId',
  costs: '/costs',
  settings: '/settings',
} as const

/** The page of one vehicle */
export const vehiclePath = (vehicleId: string) => `${paths.vehicles}/${vehicleId}`

/** The page of one driver */
export const driverPath = (driverId: string) => `${paths.drivers}/${driverId}`
