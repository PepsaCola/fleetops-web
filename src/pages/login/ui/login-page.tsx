import { TruckIcon } from 'lucide-react'
import { Link } from 'react-router'

import { APP_NAME } from '@/shared/config'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { paths } from '@/shared/routes'
import { Button } from '@/shared/ui/button'

export function LoginPage() {
  useDocumentTitle('Sign in')

  return (
    <main className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TruckIcon className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">Fleet operations</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign-in arrives together with the backend. You will enter the demo as a fleet manager,
          dispatcher, mechanic or driver — no password needed.
        </p>
        <Button asChild className="w-full">
          <Link to={paths.dashboard}>Continue to the demo</Link>
        </Button>
      </div>
    </main>
  )
}
