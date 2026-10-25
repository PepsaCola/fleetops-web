import { LayoutDashboardIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Today's fleet at a glance." />
      <PagePlaceholder
        icon={LayoutDashboardIcon}
        title="Dashboard is on the way"
        description="KPIs, a mini-map, the live activity feed and what needs attention today."
      />
    </>
  )
}
