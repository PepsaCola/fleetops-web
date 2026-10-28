import { useQuery } from '@tanstack/react-query'

import { costQueries } from '@/entities/cost'
import { addDays, fleetDate } from '@/shared/lib/fleet-time'
import { formatUah, formatUahPrecise } from '@/shared/lib/money'
import { useSearchState } from '@/shared/lib/use-search-state'
import { ErrorState } from '@/shared/ui/error-state'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'

import { CostsSearchSchema, PERIOD_OPTIONS } from '../model/costs-search'
import { DailyCostsChart } from './daily-costs-chart'
import { VehicleCostsTable } from './vehicle-costs-table'

// Parsing through the URL schema turns a bad value into the default
const fields = CostsSearchSchema.shape
const kilometres = new Intl.NumberFormat('uk-UA')

export function CostsPage() {
  const [search, setSearch] = useSearchState(CostsSearchSchema)
  const to = fleetDate()
  const from = addDays(to, -(Number(search.days) - 1))
  const { data, error, refetch } = useQuery(costQueries.report({ from, to }))

  const totals = data?.totals
  const spent = totals && totals.fuelUah + totals.maintenanceUah

  return (
    <>
      <PageHeader
        title="Costs"
        description="What the fleet spends: fuel for every trip that's back, and every job done in the workshop."
      />

      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          aria-label="Period"
          value={search.days}
          onChange={(event) => setSearch({ days: fields.days.parse(event.target.value) })}
        >
          {PERIOD_OPTIONS.map((days) => (
            <NativeSelectOption key={days} value={days}>
              Last {days} days
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Spent"
              value={spent === undefined ? undefined : formatUah(spent)}
              note={totals && `${kilometres.format(totals.km)} km driven`}
            />
            <StatCard
              label="Fuel"
              value={totals && formatUah(totals.fuelUah)}
              note={data && `Diesel at ${data.dieselUahPerLitre} ₴ a litre`}
            />
            <StatCard
              label="Maintenance"
              value={totals && formatUah(totals.maintenanceUah)}
              note="Routine services and repairs"
            />
            <StatCard
              label="Per km"
              value={
                spent === undefined || !totals
                  ? undefined
                  : totals.km > 0
                    ? formatUahPrecise(spent / totals.km)
                    : '—'
              }
              note="Fuel and the workshop, for each km driven"
            />
          </div>

          {data ? (
            <>
              <DailyCostsChart days={data.days} />
              <VehicleCostsTable rows={data.vehicles} />
            </>
          ) : (
            <Skeleton className="h-72 w-full" />
          )}
        </>
      )}
    </>
  )
}
