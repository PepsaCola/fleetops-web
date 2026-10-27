import { useEffect, useRef, useState } from 'react'

import {
  POSITIONS_REFRESH_MS,
  type FleetPositions,
  type VehiclePosition,
} from '@/entities/tracking'

// A longer gap means the tab was in the background: the fleet jumps to where it is now
const MAX_GLIDE_MS = 2 * POSITIONS_REFRESH_MS
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * The fleet part of the way from one snapshot to the next: 0 is `from`, 1 is `to`.
 * Each vehicle moves in a straight line, which over a few seconds of driving stays on the
 * road; one that wasn't on the map before appears straight at its new place.
 */
export function interpolatePositions(
  from: VehiclePosition[],
  to: VehiclePosition[],
  progress: number,
): VehiclePosition[] {
  if (progress >= 1) return to
  const previous = new Map(from.map((vehicle) => [vehicle.vehicleId, vehicle]))

  return to.map((vehicle) => {
    const start = previous.get(vehicle.vehicleId)
    if (!start) return vehicle
    return {
      ...vehicle,
      lng: start.lng + (vehicle.lng - start.lng) * progress,
      lat: start.lat + (vehicle.lat - start.lat) * progress,
    }
  })
}

/**
 * The fleet as it should be drawn right now. Vehicles glide to each new snapshot from
 * wherever they are on screen, taking as long as passed between the snapshots on the
 * server, so the map runs one refresh behind the API but nothing jumps.
 */
export function useSmoothPositions(snapshot: FleetPositions | undefined): VehiclePosition[] {
  const [shown, setShown] = useState<VehiclePosition[]>([])
  // The same as `shown`, readable from the effect without restarting it on every frame
  const shownRef = useRef(shown)
  const lastAt = useRef<number | null>(null)

  useEffect(() => {
    if (!snapshot) return

    const at = Date.parse(snapshot.at)
    const gap = lastAt.current === null ? Infinity : at - lastAt.current
    lastAt.current = at
    const glides = gap <= MAX_GLIDE_MS && !window.matchMedia(REDUCED_MOTION_QUERY).matches
    const duration = glides ? gap : 0
    const from = shownRef.current

    let start: number | undefined
    let frame = requestAnimationFrame(function step(now) {
      start ??= now
      const progress = duration > 0 ? Math.min((now - start) / duration, 1) : 1
      shownRef.current = interpolatePositions(from, snapshot.vehicles, progress)
      setShown(shownRef.current)
      if (progress < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [snapshot])

  return shown
}
