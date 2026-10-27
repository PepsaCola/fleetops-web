import type { LayerProps } from 'react-map-gl/maplibre'

import type { Motion } from '@/entities/tracking'
import type { ResolvedTheme } from '@/shared/lib/theme'

export const VEHICLES_LAYER = 'vehicles'

/** The demo routes span the Kyiv region: Zhytomyr and Vinnytsia to Chernihiv and Cherkasy */
export const KYIV_REGION = {
  bounds: [
    [28.3, 49.1],
    [32.2, 51.6],
  ] as [[number, number], [number, number]],
  fitBoundsOptions: { padding: 24 },
}

// MapLibre paints with plain colours, not CSS variables; these match the app's palette
export const MOTION_COLORS: Record<Motion, string> = {
  moving: '#2563eb',
  standing: '#f59e0b',
  off_duty: '#9ca3af',
}

const ROUTE_COLORS: Record<ResolvedTheme, string> = { light: '#94a3b8', dark: '#64748b' }
// A ring in the map's background colour keeps overlapping vehicles apart
const RING_COLORS: Record<ResolvedTheme, string> = { light: '#ffffff', dark: '#0a0a0a' }

export const routeLayer = (theme: ResolvedTheme): LayerProps => ({
  id: 'routes',
  type: 'line',
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: {
    'line-color': ROUTE_COLORS[theme],
    'line-opacity': 0.7,
    'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.5, 12, 3],
  },
})

export const vehicleLayer = (theme: ResolvedTheme): LayerProps => ({
  id: VEHICLES_LAYER,
  type: 'circle',
  // Moving vehicles are drawn on top of standing ones
  layout: { 'circle-sort-key': ['match', ['get', 'motion'], 'moving', 2, 'standing', 1, 0] },
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 4, 12, 7],
    'circle-color': [
      'match',
      ['get', 'motion'],
      'moving',
      MOTION_COLORS.moving,
      'standing',
      MOTION_COLORS.standing,
      MOTION_COLORS.off_duty,
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': RING_COLORS[theme],
  },
})
