import { MapIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function LiveMapPage() {
  return (
    <>
      <PageHeader title="Live map" description="Every vehicle in real time." />
      <PagePlaceholder
        icon={MapIcon}
        title="Live map is on the way"
        description="Vehicles moving in real time, status filters, trip routes and track replay."
      />
    </>
  )
}
