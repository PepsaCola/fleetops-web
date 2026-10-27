import { describe, expect, it } from 'vitest'

import { documentsNote, driverName, formatPhone } from './driver-format'

const TODAY = new Date(2026, 9, 27) // 27 October 2026, local time

describe('driver formatting', () => {
  it('puts the surname first, the way the list is sorted', () => {
    expect(driverName({ firstName: 'Olena', lastName: 'Kovalenko' })).toBe('Kovalenko Olena')
  })

  it('groups the digits of a Ukrainian phone number', () => {
    expect(formatPhone('+380671234567')).toBe('+380 67 123 45 67')
    expect(formatPhone('+48123456789')).toBe('+48123456789')
  })

  it.each([
    [{ documents: 'valid', documentsExpireOn: '2027-11-12' }, 'until 12 Nov 2027'],
    [{ documents: 'expiring', documentsExpireOn: '2026-11-05' }, 'expires in 9 days'],
    [{ documents: 'expiring', documentsExpireOn: '2026-10-27' }, 'expires today'],
    [{ documents: 'expired', documentsExpireOn: '2026-10-26' }, 'expired yesterday'],
    [{ documents: 'expired', documentsExpireOn: '2026-10-20' }, 'expired 7 days ago'],
  ] as const)('describes %j as "%s"', (driver, note) => {
    expect(documentsNote(driver, TODAY)).toBe(note)
  })
})
