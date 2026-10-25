import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { getErrorMessage } from '@/shared/api'
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

// After a deploy the old lazy chunks are gone, so opening a page fails until the tab reloads
const isStaleChunkError = (error: unknown) =>
  error instanceof TypeError &&
  /dynamically imported module|module script failed/i.test(error.message)

function describe(error: unknown) {
  if (isStaleChunkError(error)) {
    return {
      title: 'A new version is available',
      description:
        'FleetOps was updated while this tab was open. Reload to get the latest version.',
    }
  }
  if (isRouteErrorResponse(error)) {
    return { title: 'Something went wrong', description: `${error.status} ${error.statusText}` }
  }
  return { title: 'Something went wrong', description: getErrorMessage(error) }
}

export function RouteErrorBoundary() {
  const { title, description } = describe(useRouteError())

  return (
    <Empty className="min-h-full flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <RotateCwIcon />
            Reload
          </Button>
          <Button variant="outline" asChild>
            <Link to={paths.dashboard}>Back to dashboard</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
