import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'

import { useThemeSync } from '@/shared/lib/theme'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { queryClient } from './query-client'

/** App-wide setup: server-state cache, theme, tooltips and toasts. */
export function AppProviders({ children }: { children: ReactNode }) {
  useThemeSync()

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
      {/* Renders nothing in production builds */}
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
