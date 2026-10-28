import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { tripQueries, type Trip } from '@/entities/trip'
import { getErrorMessage, updateTrip } from '@/shared/api'
import { fleetTime } from '@/shared/lib/fleet-time'

/** A trip moved on the board: by some time, onto a vehicle (perhaps the same one) */
export type TripMove = { trip: Trip; shiftMs: number; vehicle: Trip['vehicle'] }

const shifted = (at: string, shiftMs: number) => new Date(Date.parse(at) + shiftMs).toISOString()

/** The trip as it will be once moved, to show before the API confirms it. */
export function movedTrip(trip: Trip, { shiftMs, vehicle }: Omit<TripMove, 'trip'>): Trip {
  return {
    ...trip,
    vehicle,
    departsAt: shifted(trip.departsAt, shiftMs),
    arrivesAt: shifted(trip.arrivesAt, shiftMs),
    returnsAt: shifted(trip.returnsAt, shiftMs),
  }
}

/**
 * Moves a planned trip to another time or vehicle. The board shows the move at once; when the
 * API refuses it (the vehicle is busy then, the driver may not drive it…), the trip goes back
 * where it was and a toast says why.
 */
export function useMoveTrip(day: string) {
  const queryClient = useQueryClient()
  const { queryKey } = tripQueries.day(day)

  return useMutation({
    mutationFn: ({ trip, shiftMs, vehicle }: TripMove) =>
      updateTrip({
        path: { tripId: trip.id },
        body: { departsAt: shifted(trip.departsAt, shiftMs), vehicleId: vehicle.id },
      }),
    onMutate: async (move) => {
      // A refresh landing mid-move would put the trip back before the API has answered
      await queryClient.cancelQueries({ queryKey })
      const before = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (trips) =>
        trips?.map((trip) => (trip.id === move.trip.id ? movedTrip(trip, move) : trip)),
      )
      return { before }
    },
    onError: (error, _move, saved) => {
      if (saved) queryClient.setQueryData(queryKey, saved.before)
      toast.error(getErrorMessage(error))
    },
    onSuccess: (trip) =>
      toast.success(
        `Trip #${trip.number} now leaves at ${fleetTime(trip.departsAt)} with ${trip.vehicle.plate}`,
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: tripQueries.all() }),
  })
}
