import { SearchIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useState, type ComponentProps } from 'react'

import { cn } from '@/shared/lib/utils'

import { Input } from './input'

interface SearchInputProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  value: string
  /** Called once the user pauses typing, not on every keystroke */
  onValueChange: (value: string) => void
  delay?: number
}

/** A search box that reports what was typed after a short pause, so a list isn't refetched per key. */
export function SearchInput({
  value,
  onValueChange,
  delay = 300,
  className,
  ...props
}: SearchInputProps) {
  const [text, setText] = useState(value)
  // The value last seen from the parent, and the last one this input reported to it
  const [shown, setShown] = useState(value)
  const [sent, setSent] = useState(value)

  // A value that changes without us sending it (a Reset button, the Back button) replaces the text
  if (value !== shown) {
    setShown(value)
    if (value !== sent) {
      setSent(value)
      setText(value)
    }
  }

  const send = useEffectEvent((next: string) => {
    setSent(next)
    onValueChange(next)
  })

  useEffect(() => {
    if (text === sent) return
    const timer = setTimeout(() => send(text), delay)
    return () => clearTimeout(timer)
  }, [text, sent, delay])

  return (
    <div className={cn('relative', className)}>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="pl-8"
        {...props}
      />
    </div>
  )
}
