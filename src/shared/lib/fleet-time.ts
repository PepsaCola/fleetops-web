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
