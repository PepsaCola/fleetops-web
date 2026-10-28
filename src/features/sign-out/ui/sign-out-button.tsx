import { LogOutIcon } from 'lucide-react'

import { Button } from '@/shared/ui/button'

import { useSignOut } from '../model/use-sign-out'

export function SignOutButton() {
  const signOut = useSignOut()

  return (
    <Button variant="outline" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
      <LogOutIcon data-icon="inline-start" />
      Sign out
    </Button>
  )
}
