import type { FeatureCollection, LineString, Point } from 'geojson'

import {
  motionOf,
  type Motion,
  type TrackingRoute,
  type VehiclePosition,
} from '@/entities/tracking'

export type VehicleFeatureProperties = { vehicleId: string; plate: string; motion: Motion }
export type RouteFeatureProperties = { routeId: string; kind: TrackingRoute['kind'] }

/** Vehicles as map points; the layer colours them by `motion` */
export function vehiclesToGeoJson(
  vehicles: VehiclePosition[],
): FeatureCollection<Point, VehicleFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: vehicles.map((vehicle) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [vehicle.lng, vehicle.lat] },
      properties: {
        vehicleId: vehicle.vehicleId,
        plate: vehicle.plate,
        motion: motionOf(vehicle.activity),
      },
    })),
  }
}

/** The roads the fleet drives, as lines under the vehicles */
export function routesToGeoJson(
  routes: TrackingRoute[],
): FeatureCollection<LineString, RouteFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: route.path },
      properties: { routeId: route.id, kind: route.kind },
    })),
  }
}
