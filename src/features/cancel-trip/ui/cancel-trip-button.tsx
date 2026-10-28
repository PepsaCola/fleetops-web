import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { tripQueries, type Trip } from '@/entities/trip'
import { cancelTrip, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'

interface CancelTripButtonProps {
  trip: Trip
  onCancelled?: () => void
}

/** Cancels a planned trip; it stays on record, and its vehicle and driver are free again. */
export function CancelTripButton({ trip, onCancelled }: CancelTripButtonProps) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => cancelTrip({ path: { tripId: trip.id } }),
    onSuccess: async () => {
      toast.success(`Trip #${trip.number} is cancelled`)
      onCancelled?.()
      await queryClient.invalidateQueries({ queryKey: tripQueries.all() })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      Cancel trip
    </Button>
  )
}
