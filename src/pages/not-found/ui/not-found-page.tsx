import { MapPinOffIcon } from 'lucide-react'
import { Link } from 'react-router'

import { paths } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

export function NotFoundPage() {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinOffIcon />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          This route doesn&apos;t lead anywhere. Check the address or head back to the dashboard.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={paths.dashboard}>Back to dashboard</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
