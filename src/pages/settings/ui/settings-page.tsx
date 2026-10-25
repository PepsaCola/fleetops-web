import { SettingsIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Company, users and preferences." />
      <PagePlaceholder
        icon={SettingsIcon}
        title="Settings are on the way"
        description="Company profile, users and roles, units and alert rules."
      />
    </>
  )
}
