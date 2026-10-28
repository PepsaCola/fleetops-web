import { useEffect, useState } from 'react'

/** The current time in ms, refreshed every `intervalMs`, for what moves with the clock. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
