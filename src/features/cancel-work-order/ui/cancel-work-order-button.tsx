import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { workOrderQueries, type WorkOrder } from '@/entities/work-order'
import { cancelWorkOrder, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'

/** Cancels a scheduled work order; it stays on record, and the vehicle is free for trips again. */
export function CancelWorkOrderButton({ order }: { order: WorkOrder }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => cancelWorkOrder({ path: { workOrderId: order.id } }),
    onSuccess: async () => {
      toast.success(`Work order #${order.number} is cancelled`)
      await queryClient.invalidateQueries({ queryKey: workOrderQueries.all() })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Cancel work order ${order.number}`}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      Cancel
    </Button>
  )
}
