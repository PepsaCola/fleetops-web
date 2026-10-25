import { RouteIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function TripsPage() {
  return (
    <>
      <PageHeader title="Trips" description="Plan, track and review deliveries." />
      <PagePlaceholder
        icon={RouteIcon}
        title="Trip list is on the way"
        description="A filterable trip table, trip details with a stop timeline and a new-trip wizard."
      />
    </>
  )
}
