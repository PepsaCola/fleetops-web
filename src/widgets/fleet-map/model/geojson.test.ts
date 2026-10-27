import { describe, expect, it } from 'vitest'

import type { TrackingRoute, VehiclePosition } from '@/entities/tracking'

import { routesToGeoJson, vehiclesToGeoJson } from './geojson'

const van: VehiclePosition = {
  vehicleId: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  plate: 'AA 1234 KB',
  type: 'van',
  lng: 30.512345,
  lat: 50.45,
  headingDeg: 87,
  speedKmh: 40,
  activity: 'to_depot',
  routeId: 'depot-customer',
}

describe('fleet map GeoJSON', () => {
  it('turns vehicles into points coloured by how they move', () => {
    const { features } = vehiclesToGeoJson([van, { ...van, activity: 'at_customer' }])

    expect(features[0]).toEqual({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [30.512345, 50.45] },
      properties: { vehicleId: van.vehicleId, plate: 'AA 1234 KB', motion: 'moving' },
    })
    expect(features[1]?.properties.motion).toBe('standing')
  })

  it('turns routes into lines', () => {
    const route: TrackingRoute = {
      id: 'depot-customer',
      name: 'Depot → Customer',
      kind: 'local',
      path: [
        [30, 50],
        [30.2, 50],
      ],
    }

    expect(routesToGeoJson([route]).features[0]).toMatchObject({
      geometry: { type: 'LineString', coordinates: route.path },
      properties: { routeId: 'depot-customer', kind: 'local' },
    })
  })
})
