import type { VehiclePosition } from '@/shared/api'

export type Activity = VehiclePosition['activity']

/** What the map shows a vehicle as: driving, standing somewhere on its round, or not working */
export type Motion = 'moving' | 'standing' | 'off_duty'

// Records, so an activity the API adds later fails the typecheck until it is placed here
export const ACTIVITY_LABELS: Record<Activity, string> = {
  to_customer: 'On the way to a customer',
  at_customer: 'At a customer',
  to_depot: 'Returning to the depot',
  at_depot: 'At the depot',
  off_duty: 'Off duty',
}

const MOTIONS: Record<Activity, Motion> = {
  to_customer: 'moving',
  to_depot: 'moving',
  at_customer: 'standing',
  at_depot: 'standing',
  off_duty: 'off_duty',
}

export const MOTION_LABELS: Record<Motion, string> = {
  moving: 'Moving',
  standing: 'Standing',
  off_duty: 'Off duty',
}

export const motionOf = (activity: Activity) => MOTIONS[activity]

export function countByMotion(vehicles: Pick<VehiclePosition, 'activity'>[]) {
  const counts: Record<Motion, number> = { moving: 0, standing: 0, off_duty: 0 }
  for (const vehicle of vehicles) counts[motionOf(vehicle.activity)] += 1
  return counts
}
