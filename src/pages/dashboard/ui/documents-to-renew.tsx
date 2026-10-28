import { Link } from 'react-router'

import { DriverDocuments, driverName, type Driver } from '@/entities/driver'
import { driverPath, paths } from '@/shared/routes'
import { Skeleton } from '@/shared/ui/skeleton'

/** Drivers whose licence or medical certificate has run out or soon will, most urgent first. */
export function DocumentsToRenew({ drivers }: { drivers: Driver[] | undefined }) {
  const due = drivers?.filter((driver) => driver.documents !== 'valid')

  return (
    <section aria-labelledby="documents-to-renew" className="rounded-lg border">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 id="documents-to-renew" className="font-medium">
          Documents to renew
        </h2>
        <Link
          to={`${paths.drivers}?sort=documentsExpireOn`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          All drivers
        </Link>
      </header>
      {due === undefined ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
      ) : due.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Every driver&apos;s documents are in order.
        </p>
      ) : (
        <ul className="divide-y">
          {due.map((driver) => (
            <li
              key={driver.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
            >
              <Link
                to={driverPath(driver.id)}
                className="font-medium underline-offset-4 hover:underline"
              >
                {driverName(driver)}
              </Link>
              <DriverDocuments driver={driver} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
