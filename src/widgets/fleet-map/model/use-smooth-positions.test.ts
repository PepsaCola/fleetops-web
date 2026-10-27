import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { FleetPositions, VehiclePosition } from '@/entities/tracking'

import { interpolatePositions, useSmoothPositions } from './use-smooth-positions'

const van = (lng: number, lat = 50): VehiclePosition => ({
  vehicleId: '0199d2a4-5f3e-7c11-9a2b-3c4d5e6f7a8b',
  plate: 'AA 1234 KB',
  type: 'van',
  lng,
  lat,
  headingDeg: 90,
  speedKmh: 40,
  activity: 'to_customer',
  routeId: 'kyiv-brovary',
})

const fleetAt = (time: string, ...vehicles: VehiclePosition[]): FleetPositions => ({
  at: `2026-10-27T${time}.000Z`,
  vehicles,
})

describe('interpolatePositions', () => {
  it('moves each vehicle part of the way to its new place', () => {
    const [shown] = interpolatePositions([van(30, 50)], [van(30.2, 50.1)], 0.25)

    expect(shown?.lng).toBeCloseTo(30.05)
    expect(shown?.lat).toBeCloseTo(50.025)
  })

  it('shows a vehicle that has just appeared at its new place', () => {
    const newcomer = { ...van(30.2), vehicleId: '0199d2a4-5f3e-7c11-9a2b-000000000000' }

    expect(interpolatePositions([van(30)], [newcomer], 0.5)).toEqual([newcomer])
  })
})

describe('useSmoothPositions', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('glides to the next positions over the time between them', () => {
    const { result, rerender } = renderHook(({ fleet }) => useSmoothPositions(fleet), {
      initialProps: { fleet: fleetAt('12:00:00', van(30)) },
    })
    act(() => vi.advanceTimersToNextFrame())
    expect(result.current[0]?.lng).toBe(30)

    rerender({ fleet: fleetAt('12:00:05', van(30.1)) })
    act(() => vi.advanceTimersByTime(2_500))
    expect(result.current[0]?.lng).toBeCloseTo(30.05, 2)

    // Frames run until the glide is over, and it ends exactly at the new position
    act(() => vi.runAllTimers())
    expect(result.current[0]?.lng).toBe(30.1)
  })

  it('jumps straight there after a long pause, e.g. while the tab was hidden', () => {
    const { result, rerender } = renderHook(({ fleet }) => useSmoothPositions(fleet), {
      initialProps: { fleet: fleetAt('12:00:00', van(30)) },
    })
    act(() => vi.advanceTimersToNextFrame())

    rerender({ fleet: fleetAt('12:03:00', van(30.1)) })
    act(() => vi.advanceTimersToNextFrame())

    expect(result.current[0]?.lng).toBe(30.1)
  })
})
