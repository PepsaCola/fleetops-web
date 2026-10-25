/** Shown on the very first load while the lazy chunk of the opened page is downloading. */
export function HydrateFallback() {
  return (
    <div className="grid min-h-full place-items-center">
      <output aria-label="Loading">
        <span className="block size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </output>
    </div>
  )
}
