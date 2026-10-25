import { Outlet } from 'react-router'

import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { AppHeader } from '@/widgets/app-header'
import { AppSidebar } from '@/widgets/app-sidebar'

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* SidebarInset already renders <main>, so the page area is a plain div */}
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
