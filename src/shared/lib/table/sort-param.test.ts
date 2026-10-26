import { describe, expect, it } from 'vitest'

import { sortingFromParam, sortingToParam } from './sort-param'

describe('sort parameter', () => {
  it.each([
    ['year', [{ id: 'year', desc: false }]],
    ['-odometerKm', [{ id: 'odometerKm', desc: true }]],
  ])('reads %s', (param, sorting) => {
    expect(sortingFromParam(param)).toEqual(sorting)
  })

  it.each([
    [[{ id: 'year', desc: false }], 'year'],
    [[{ id: 'odometerKm', desc: true }], '-odometerKm'],
    [[], undefined],
  ])('writes %j as %s', (sorting, param) => {
    expect(sortingToParam(sorting)).toBe(param)
  })
})
