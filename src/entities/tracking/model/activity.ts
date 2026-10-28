import type { VehiclePosition } from '@/shared/api'

export type Activity = VehiclePosition['activity']

/** What the map shows a vehicle as: driving, standing on its round, in the workshop, or not working */
export type Motion = 'moving' | 'standing' | 'workshop' | 'off_duty'

// Records, so an activity the API adds later fails the typecheck until it is placed here
export const ACTIVITY_LABELS: Record<Activity, string> = {
  to_customer: 'On the way to a customer',
  at_customer: 'At a customer',
  to_depot: 'Returning to the depot',
  at_depot: 'At the depot',
  in_workshop: 'In the workshop',
  off_duty: 'Off duty',
}

const MOTIONS: Record<Activity, Motion> = {
  to_customer: 'moving',
  to_depot: 'moving',
  at_customer: 'standing',
  at_depot: 'standing',
  in_workshop: 'workshop',
  off_duty: 'off_duty',
}

export const MOTION_LABELS: Record<Motion, string> = {
  moving: 'Moving',
  standing: 'Standing',
  workshop: 'In the workshop',
  off_duty: 'Off duty',
}

export const motionOf = (activity: Activity) => MOTIONS[activity]

export function countByMotion(vehicles: Pick<VehiclePosition, 'activity'>[]) {
  const counts: Record<Motion, number> = { moving: 0, standing: 0, workshop: 0, off_duty: 0 }
  for (const vehicle of vehicles) counts[motionOf(vehicle.activity)] += 1
  return counts
}
