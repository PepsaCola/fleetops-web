import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ROLE_LABELS, sessionQueries, type UserRole } from '@/entities/session'
import { SignOutButton } from '@/features/sign-out'
import { ThemePicker } from '@/features/switch-theme'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const ROLE_RIGHTS: Record<UserRole, string> = {
  dispatcher: 'Plans trips, moves them on the dispatch board, books and cancels work orders.',
  viewer: 'Sees everything the fleet does, but changes nothing.',
}

const LINKS = [
  { label: 'API documentation', href: 'https://fleetops-api-nine.vercel.app/docs' },
  { label: 'Frontend code', href: 'https://github.com/PepsaCola/fleetops-web' },
  { label: 'Backend code', href: 'https://github.com/PepsaCola/fleetops-api' },
]

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 id={id} className="font-medium">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function SettingsPage() {
  const { data: user } = useQuery(sessionQueries.me())

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your account, how the app looks, and how the demo works."
      />

      <div className="grid max-w-3xl gap-4">
        <Section id="settings-account" title="Account">
          {user ? (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd>{user.name}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
                <dt className="text-muted-foreground">Role</dt>
                <dd>
                  <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                  <span className="block text-muted-foreground">{ROLE_RIGHTS[user.role]}</span>
                </dd>
              </dl>
              <div>
                <SignOutButton />
              </div>
            </>
          ) : (
            <Skeleton className="h-24 w-full" />
          )}
        </Section>

        <Section id="settings-appearance" title="Appearance">
          <p className="text-sm text-muted-foreground">
            System follows your device, and switches when it does.
          </p>
          <ThemePicker />
        </Section>

        <Section id="settings-demo" title="How the demo works">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              A fleet of 40 vehicles and 55 drivers at three depots around Kyiv. There are no
              trackers: where a vehicle is follows from its trips and the clock, along real roads.
            </li>
            <li>
              Each day&apos;s timetable is planned the first time anyone opens that day. Every
              working vehicle gets a driver and a 10-hour shift of trips: trucks run round the
              clock, vans and cars by day.
            </li>
            <li>
              Every vehicle goes in for a routine service once a fortnight, from 08:00 to 14:00. It
              can&apos;t take trips then, and the planned trips go around it.
            </li>
            <li>
              Costs count diesel at 98 ₴ a litre: trucks burn 28, vans 11 and cars 7 litres per 100
              km, there and back.
            </li>
            <li>Times are Kyiv time, wherever you are.</li>
          </ul>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  )
}
