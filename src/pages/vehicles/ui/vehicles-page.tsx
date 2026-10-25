import { TruckIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function VehiclesPage() {
  return (
    <>
      <PageHeader title="Vehicles" description="Your fleet and its condition." />
      <PagePlaceholder
        icon={TruckIcon}
        title="Vehicle list is on the way"
        description="A fleet table and vehicle cards with service history, documents and telemetry."
      />
    </>
  )
}
