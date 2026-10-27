import { describe, expect, it } from 'vitest'

import { addDays, fleetDate, fleetTime } from './fleet-time'

describe('fleet time', () => {
  it('shows dates and times on Kyiv clocks, not the browser’s', () => {
    // 22:30 UTC on 26 October is already 00:30 on the 27th in Kyiv (UTC+2 in winter)
    expect(fleetDate('2026-10-26T22:30:00Z')).toBe('2026-10-27')
    expect(fleetTime('2026-10-26T22:30:00Z')).toBe('00:30')
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})
