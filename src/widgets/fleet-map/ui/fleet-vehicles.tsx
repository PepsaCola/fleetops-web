import { useMemo } from 'react'
import { Layer, Popup, Source } from 'react-map-gl/maplibre'

import { ACTIVITY_LABELS, type FleetPositions } from '@/entities/tracking'
import { useResolvedTheme } from '@/shared/lib/theme'

import { vehicleLayer } from '../config/map-layers'
import { vehiclesToGeoJson } from '../model/geojson'
import { useSmoothPositions } from '../model/use-smooth-positions'

interface FleetVehiclesProps {
  fleet: FleetPositions | undefined
  selectedId: string | null
}

/**
 * The vehicles and the selected one's details. A component of its own because it redraws on
 * every animation frame while the vehicles glide, and the rest of the map doesn't need to.
 */
export function FleetVehicles({ fleet, selectedId }: FleetVehiclesProps) {
  const theme = useResolvedTheme()
  const vehicles = useSmoothPositions(fleet)
  const data = useMemo(() => vehiclesToGeoJson(vehicles), [vehicles])
  // Looked up on every frame, so the popup moves with the vehicle
  const selected = vehicles.find((vehicle) => vehicle.vehicleId === selectedId)

  return (
    <>
      <Source id="vehicles" type="geojson" data={data}>
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
    </>
  )
}
