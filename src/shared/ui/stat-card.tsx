import { ChevronRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/shared/lib/utils'

import { Skeleton } from './skeleton'

interface StatCardProps {
  label: string
  /** The number, "—" when it couldn't be loaded, or undefined while it loads */
  value: number | string | undefined
  note?: ReactNode
  /** Where the details behind the number are; a card without one is just the number */
  to?: string
  /** Draws the eye when the number is something to act on */
  alert?: boolean
}

/** One number that matters, a word on it, and the way to the details behind it. */
export function StatCard({ label, value, note, to, alert = false }: StatCardProps) {
  const className = cn(
    'flex flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground',
    alert && 'border-amber-500/60',
  )
  const content = (
    <>
      <span className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {to && (
          <ChevronRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </span>
      {value === undefined ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
      )}
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </>
  )

  if (!to) return <div className={className}>{content}</div>

  return (
    <Link
      to={to}
      className={cn(
        className,
        'group transition-colors outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {content}
    </Link>
  )
}
