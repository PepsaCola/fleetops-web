import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Layer, Popup, Source } from 'react-map-gl/maplibre'

import {
  ACTIVITY_LABELS,
  trackingQueries,
  type TrackingRoute,
  type VehiclePosition,
} from '@/entities/tracking'
import { getErrorMessage } from '@/shared/api'
import { useResolvedTheme } from '@/shared/lib/theme'
import { cn } from '@/shared/lib/utils'
import { MapView } from '@/shared/ui/map-view'

import { KYIV_REGION, routeLayer, vehicleLayer, VEHICLES_LAYER } from '../config/map-layers'
import { routesToGeoJson, vehiclesToGeoJson } from '../model/geojson'
import { FleetLegend } from './fleet-legend'

// Stable fallbacks, so the map sources aren't rebuilt on every render while data loads
const NO_VEHICLES: VehiclePosition[] = []
const NO_ROUTES: TrackingRoute[] = []

/** The whole fleet on a map, refreshed every few seconds; click a vehicle for details. */
export function FleetMap({ className }: { className?: string }) {
  const theme = useResolvedTheme()
  const positions = useQuery(trackingQueries.positions())
  const routes = useQuery(trackingQueries.routes())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  const vehicles = positions.data?.vehicles ?? NO_VEHICLES
  const vehicleData = useMemo(() => vehiclesToGeoJson(vehicles), [vehicles])
  const routeData = useMemo(() => routesToGeoJson(routes.data?.routes ?? NO_ROUTES), [routes.data])
  // Looked up on every refresh, so the popup follows the vehicle as it moves
  const selected = vehicles.find((vehicle) => vehicle.vehicleId === selectedId)

  return (
    <div className={cn('relative overflow-hidden rounded-lg border', className)}>
      <MapView
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
        <Source id="vehicles" type="geojson" data={vehicleData}>
          <Layer {...vehicleLayer(theme)} />
        </Source>
        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            offset={12}
            closeButton={false}
            closeOnClick={false}
            // MapLibre's own CSS sits outside Tailwind's cascade layers and so wins over any
            // utility; the ! (important) lets ours restyle the popup to match the theme
            className="[&_.maplibregl-popup-content]:rounded-lg! [&_.maplibregl-popup-content]:bg-popover! [&_.maplibregl-popup-content]:px-3! [&_.maplibregl-popup-content]:py-2! [&_.maplibregl-popup-content]:text-popover-foreground [&_.maplibregl-popup-content]:shadow-md! [&_.maplibregl-popup-tip]:hidden"
          >
            <p className="font-mono font-medium">{selected.plate}</p>
            <p className="text-muted-foreground">{ACTIVITY_LABELS[selected.activity]}</p>
            {selected.speedKmh > 0 && <p className="tabular-nums">{selected.speedKmh} km/h</p>}
          </Popup>
        )}
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
  )
}
