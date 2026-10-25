import { Fragment } from 'react'
import { Link, useMatches } from 'react-router'

import { ThemeSwitcher } from '@/features/switch-theme'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { isRouteHandle } from '@/shared/routes'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'

/** One crumb per matched route that declares `handle.title`, e.g. Trips › Trip details. */
function useBreadcrumbs() {
  return useMatches().flatMap((match) =>
    isRouteHandle(match.handle)
      ? [{ id: match.id, title: match.handle.title, pathname: match.pathname }]
      : [],
  )
}

export function AppHeader() {
  const crumbs = useBreadcrumbs()
  useDocumentTitle(crumbs.at(-1)?.title)

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.id}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.pathname}>{crumb.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1">
        <ThemeSwitcher />
      </div>
    </header>
  )
}
