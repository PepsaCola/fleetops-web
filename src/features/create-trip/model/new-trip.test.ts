import { describe, expect, it } from 'vitest'

import type { Driver } from '@/entities/driver'
import type { TrackingRoute } from '@/entities/tracking'
import type { Vehicle } from '@/entities/vehicle'

import { bookingOf, departureOf, driversFor, formatDuration, nextSlot, routesFor } from './new-trip'

const MINUTE = 60_000
const brovary = { id: 'depot-brovary', name: 'Brovary Logistics Park' }
const boryspil = { id: 'depot-boryspil', name: 'Boryspil Cross-Dock' }

const vehicle = (type: Vehicle['type']): Vehicle => ({
  id: `vehicle-${type}`,
  plate: 'AA 1234 KB',
  make: 'Renault',
  model: 'Master',
  year: 2022,
  type,
  status: 'active',
  capacityKg: 1500,
  fuelTankL: 80,
  odometerKm: 120_000,
  homeDepot: brovary,
})

const driver = (lastName: string, overrides: Partial<Driver> = {}): Driver => ({
  id: `driver-${lastName}`,
  firstName: 'Olena',
  lastName,
  phone: '+380671234567',
  licenseNumber: 'AKH123456',
  licenseCategories: ['B'],
  licenseExpiresOn: '2030-01-01',
  medicalExpiresOn: '2030-01-01',
  documentsExpireOn: '2030-01-01',
  documents: 'valid',
  status: 'active',
  homeDepot: brovary,
  ...overrides,
})

const route = (name: string, kind: TrackingRoute['kind']): TrackingRoute => ({
  id: name,
  name,
  kind,
  path: [],
  driveMs: 20 * MINUTE,
  roundTripMs: 60 * MINUTE,
})

describe('new trip', () => {
  it('reads the day and time on Kyiv clocks', () => {
    const booking = bookingOf({
      vehicleId: 'v',
      driverId: 'd',
      routeId: 'r',
      day: '2026-03-10',
      time: '09:30',
    })

    expect(booking.departsAt).toBe('2026-03-10T07:30:00.000Z')
    expect(departureOf('2026-03-10', '')).toBeNull()
    expect(departureOf('', '09:30')).toBeNull()
  })

  it('suggests the next quarter hour at least half an hour away', () => {
    // 09:31 in Kyiv → 10:01 at the earliest → 10:15
    expect(nextSlot(Date.parse('2026-03-10T07:31:00Z'))).toBe('10:15')
  })

  it('writes trip lengths for people', () => {
    expect(formatDuration(45 * MINUTE)).toBe('45 min')
    expect(formatDuration(185 * MINUTE)).toBe('3 h 05 min')
  })

  it('offers the routes of the vehicle’s kind from its own depot', () => {
    const routes = [
      route('Brovary Logistics Park → Kyiv, Livoberezhna', 'local'),
      route('Brovary Logistics Park → Nizhyn', 'regional'),
      route('Boryspil Cross-Dock → Kyiv, Pechersk', 'local'),
    ]

    expect(routesFor(vehicle('van'), routes).map(({ name }) => name)).toEqual([
      'Brovary Logistics Park → Kyiv, Livoberezhna',
    ])
    expect(routesFor(vehicle('truck'), routes).map(({ name }) => name)).toEqual([
      'Brovary Logistics Park → Nizhyn',
    ])
  })

  it('offers drivers who may drive the vehicle, its own depot’s first', () => {
    const drivers = [
      driver('Andriienko', { homeDepot: boryspil, licenseCategories: ['B', 'C'] }),
      driver('Bondar', { licenseCategories: ['B', 'C', 'CE'] }),
      driver('Chorna', { documents: 'expired', licenseCategories: ['B', 'C'] }),
      driver('Danyliuk', { licenseCategories: ['B'] }),
    ]

    expect(driversFor(vehicle('truck'), drivers).map(({ lastName }) => lastName)).toEqual([
      'Bondar',
      'Andriienko',
    ])
  })
})
