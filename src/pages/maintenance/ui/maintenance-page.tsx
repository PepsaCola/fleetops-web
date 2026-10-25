import { WrenchIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function MaintenancePage() {
  return (
    <>
      <PageHeader title="Maintenance" description="Service schedule and work orders." />
      <PagePlaceholder
        icon={WrenchIcon}
        title="Maintenance is on the way"
        description="A service calendar, mileage-based service plans and a work-order board."
      />
    </>
  )
}
