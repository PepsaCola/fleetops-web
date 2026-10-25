import { WalletIcon } from 'lucide-react'

import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function CostsPage() {
  return (
    <>
      <PageHeader title="Costs" description="Fuel, repairs, fines and tolls." />
      <PagePlaceholder
        icon={WalletIcon}
        title="Costs are on the way"
        description="Cost per kilometre by vehicle, monthly trends and suspicious fuel purchases."
      />
    </>
  )
}
