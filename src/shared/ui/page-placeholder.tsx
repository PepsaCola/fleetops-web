import type { LucideIcon } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

interface PagePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
}

/** Temporary stand-in for a module that is not built yet. */
export function PagePlaceholder({ icon: Icon, title, description }: PagePlaceholderProps) {
  return (
    <Empty className="flex-1 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
