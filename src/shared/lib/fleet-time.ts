// The fleet works on Kyiv time: a trip's day and times are shown as a dispatcher in Kyiv sees
// them, wherever the person looking at them happens to be.

export const FLEET_TIME_ZONE = 'Europe/Kyiv'

/** A calendar date, YYYY-MM-DD */
export type IsoDate = string

// The en-CA locale writes dates as YYYY-MM-DD; en-GB writes times as 07:45
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: FLEET_TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: FLEET_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})
const clockFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: FLEET_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})

/** The fleet's calendar date at a moment; today by default. */
export const fleetDate = (at: Date | string = new Date()): IsoDate =>
  dateFormat.format(new Date(at))

/** Hours and minutes on the fleet's clocks, e.g. "07:45". */
export const fleetTime = (at: Date | string) => timeFormat.format(new Date(at))

export function addDays(date: IsoDate, days: number): IsoDate {
  const result = new Date(`${date}T00:00:00Z`)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

/** How far the fleet's clocks are ahead of UTC at a moment: 2 hours in winter, 3 in summer */
function offsetAt(at: number): number {
  const parts = clockFormat.formatToParts(at)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((candidate) => candidate.type === type)?.value)
  const shown = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
  )
  return shown - (at - (at % 1000))
}

/** The moment the fleet's clocks show `minutes` past midnight on `day`. */
export function fleetInstant(day: IsoDate, minutes = 0): Date {
  const shown = Date.parse(`${day}T00:00:00Z`) + minutes * 60_000
  // The offset depends on the moment itself, so a second pass settles the days clocks change
  const guess = shown - offsetAt(shown)
  return new Date(shown - offsetAt(guess))
}

/** The moment a day begins on the fleet's clocks: midnight in Kyiv. */
export const fleetDayStart = (day: IsoDate) => fleetInstant(day)
