import { describe, expect, it } from 'vitest'

import { isRouteHandle } from './handle'

describe('isRouteHandle', () => {
  it.each([
    [{ title: 'Trips' }, true],
    [{ title: 42 }, false],
    [{}, false],
    [null, false],
    ['Trips', false],
  ])('%j → %s', (value, expected) => {
    expect(isRouteHandle(value)).toBe(expected)
  })
})
