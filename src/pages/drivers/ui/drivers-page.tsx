import { UsersIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function DriversPage() {
  return (
    <>
      <PageHeader title="Drivers" description="Shifts, driving hours and safety." />
      <PagePlaceholder
        icon={UsersIcon}
        title="Driver list is on the way"
        description="Shifts and driving hours, licence expiry dates and a safety score."
      />
    </>
  )
}
