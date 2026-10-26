import { CircleAlertIcon } from 'lucide-react'

import { getErrorMessage } from '@/shared/api'

import { Button } from './button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

interface ErrorStateProps {
  title?: string
  error: unknown
  onRetry?: () => void
}

/** Shown in place of content that failed to load, with a way to try again. */
export function ErrorState({ title = "Couldn't load the data", error, onRetry }: ErrorStateProps) {
  return (
    <Empty role="alert" className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={() => onRetry()}>
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
