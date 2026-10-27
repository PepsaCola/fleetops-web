import 'maplibre-gl/dist/maplibre-gl.css'

import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Map as MapLibreMap, NavigationControl, type MapProps } from 'react-map-gl/maplibre'

import { useResolvedTheme } from '@/shared/lib/theme'

// MapLibre looks for its worker next to its own file, but the bundler moves that file and
// leaves the worker behind; importing the worker with ?url makes Vite ship it and tell us where
setWorkerUrl(workerUrl)

// Free vector tiles from OpenFreeMap (OpenStreetMap data): no API key, no usage limits
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const

/** A MapLibre map whose base style follows the app's light or dark theme. */
export function MapView({ children, ...props }: Omit<MapProps, 'mapStyle'>) {
  const theme = useResolvedTheme()

  return (
    <MapLibreMap mapStyle={MAP_STYLES[theme]} {...props}>
      <NavigationControl position="top-right" showCompass={false} />
      {children}
    </MapLibreMap>
  )
}
