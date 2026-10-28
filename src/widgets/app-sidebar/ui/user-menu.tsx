import { useQuery } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'

import { ROLE_LABELS, sessionQueries } from '@/entities/session'
import { useSignOut } from '@/features/sign-out'
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar'

/** Who is signed in, and the way out. */
export function UserMenu() {
  const { data: user } = useQuery(sessionQueries.me())
  const signOut = useSignOut()

  if (!user) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        tooltip="Sign out"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        <LogOutIcon />
        <span className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {ROLE_LABELS[user.role]} · Sign out
          </span>
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
