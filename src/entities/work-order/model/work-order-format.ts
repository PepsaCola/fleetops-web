import { format, parseISO } from 'date-fns'

import type { WorkOrder } from '@/shared/api'
import { fleetDate, fleetTime } from '@/shared/lib/fleet-time'

/** "Tue 10 Mar" for a moment, by the fleet's calendar */
const dayOf = (at: string) => format(parseISO(fleetDate(at)), 'EEE d MMM')

/** When the vehicle is in, on the fleet's clocks: "Tue 10 Mar, 08:00–14:00", or across days. */
export function workOrderTime(order: Pick<WorkOrder, 'startsAt' | 'endsAt'>) {
  const sameDay = fleetDate(order.startsAt) === fleetDate(order.endsAt)
  return sameDay
    ? `${dayOf(order.startsAt)}, ${fleetTime(order.startsAt)}–${fleetTime(order.endsAt)}`
    : `${dayOf(order.startsAt)} ${fleetTime(order.startsAt)} – ${dayOf(order.endsAt)} ${fleetTime(order.endsAt)}`
}
