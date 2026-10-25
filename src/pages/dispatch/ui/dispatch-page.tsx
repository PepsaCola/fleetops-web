import { CalendarRangeIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function DispatchPage() {
  return (
    <>
      <PageHeader title="Dispatch" description="Assign trips to vehicles and drivers." />
      <PagePlaceholder
        icon={CalendarRangeIcon}
        title="Dispatch board is on the way"
        description="A Gantt timeline per vehicle with drag-and-drop assignment and conflict checks."
      />
    </>
  )
}
