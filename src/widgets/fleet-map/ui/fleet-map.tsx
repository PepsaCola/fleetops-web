import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { Layer, Source, type MapRef } from 'react-map-gl/maplibre'

import { trackingQueries, type TrackingRoute, type VehiclePosition } from '@/entities/tracking'
import { getErrorMessage } from '@/shared/api'
import { useResolvedTheme } from '@/shared/lib/theme'
import { cn } from '@/shared/lib/utils'
import { MapView } from '@/shared/ui/map-view'

import { KYIV_REGION, routeLayer, VEHICLES_LAYER } from '../config/map-layers'
import { routesToGeoJson } from '../model/geojson'
import { FleetLegend } from './fleet-legend'
import { FleetList } from './fleet-list'
import { FleetVehicles } from './fleet-vehicles'

// Stable fallbacks, so the map sources aren't rebuilt on every render while data loads
const NO_VEHICLES: VehiclePosition[] = []
const NO_ROUTES: TrackingRoute[] = []
// Close enough to tell the streets apart around a vehicle picked from the list
const FOCUS_ZOOM = 13

/** The whole fleet on a map and in a list, refreshed every few seconds. */
export function FleetMap({ className }: { className?: string }) {
  const theme = useResolvedTheme()
  const positions = useQuery(trackingQueries.positions())
  const routes = useQuery(trackingQueries.routes())
  const mapRef = useRef<MapRef>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  const vehicles = positions.data?.vehicles ?? NO_VEHICLES
  const routeData = useMemo(() => routesToGeoJson(routes.data?.routes ?? NO_ROUTES), [routes.data])

  function showVehicle(vehicle: VehiclePosition) {
    setSelectedId(vehicle.vehicleId)
    const map = mapRef.current
    if (!map) return
    // Zooms in when the map is further out, but never out of a closer look
    map.flyTo({
      center: [vehicle.lng, vehicle.lat],
      zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
    })
  }

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row', className)}>
      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg border">
        <MapView
          ref={mapRef}
          initialViewState={KYIV_REGION}
          style={{ width: '100%', height: '100%' }}
          interactiveLayerIds={[VEHICLES_LAYER]}
          cursor={hovering ? 'pointer' : 'grab'}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={(event) => {
            // A click on the map itself, away from any vehicle, closes the details
            const vehicleId: unknown = event.features?.[0]?.properties?.vehicleId
            setSelectedId(typeof vehicleId === 'string' ? vehicleId : null)
          }}
        >
          <Source id="routes" type="geojson" data={routeData}>
            <Layer {...routeLayer(theme)} />
          </Source>
          <FleetVehicles fleet={positions.data} selectedId={selectedId} />
        </MapView>

        <FleetLegend vehicles={vehicles} updatedAt={positions.data?.at} />

        {positions.isError && !positions.data && (
          <p
            role="alert"
            className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/90 px-3 py-2 text-sm"
          >
            {getErrorMessage(positions.error)}
          </p>
        )}
      </div>

      {/* The list fills whatever height the map has, so 40 rows can't stretch the page */}
      <div className="relative h-80 lg:h-auto lg:w-72">
        <FleetList
          className="absolute inset-0"
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={showVehicle}
        />
      </div>
    </div>
  )
}
