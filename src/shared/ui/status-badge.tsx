import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { Badge } from './badge'

export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral'

const DOT_COLORS: Record<StatusTone, string> = {
  success: 'bg-emerald-500',
  info: 'bg-blue-600',
  warning: 'bg-amber-500',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground/50',
}

/** A status label with a coloured dot; the colour only repeats what the text already says. */
export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <Badge variant="outline">
      <span aria-hidden className={cn('size-1.5 rounded-full', DOT_COLORS[tone])} />
      {children}
    </Badge>
  )
}
