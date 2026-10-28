import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { useCanEdit } from '@/entities/session'
import { WORK_ORDER_STATUS_LABELS } from '@/entities/work-order'
import { NewWorkOrderSheet, type WorkOrderDraft } from '@/features/create-work-order'
import { addDays, fleetDate } from '@/shared/lib/fleet-time'
import { useSearchState } from '@/shared/lib/use-search-state'
import { Button } from '@/shared/ui/button'
import { DayPicker } from '@/shared/ui/day-picker'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { PageHeader } from '@/shared/ui/page-header'

import {
  MaintenanceSearchSchema,
  PERIOD_DAYS,
  WORK_ORDER_STATUS_OPTIONS,
} from '../model/maintenance-search'
import { WorkOrdersTable } from './work-orders-table'

// Parsing through the URL schema turns "" and bad values into undefined
const fields = MaintenanceSearchSchema.shape

export function MaintenancePage() {
  const [search, setSearch] = useSearchState(MaintenanceSearchSchema)
  const canEdit = useCanEdit()
  const [draft, setDraft] = useState<WorkOrderDraft | null>(null)
  const today = fleetDate()
  const from = search.from ?? today

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Time in the workshop: a routine service for every vehicle once a fortnight, and the repairs you book. A vehicle in the workshop can't go on a trip."
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <DayPicker
            day={from}
            today={today}
            // Today is where the page starts without a day, so it stays out of the URL
            onDayChange={(day) => setSearch({ from: day === today ? undefined : day })}
          />
          <span className="text-sm text-muted-foreground">
            and the {PERIOD_DAYS - 1} days after
          </span>
          <NativeSelect
            aria-label="Status"
            value={search.status ?? ''}
            onChange={(event) => setSearch({ status: fields.status.parse(event.target.value) })}
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            {WORK_ORDER_STATUS_OPTIONS.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {WORK_ORDER_STATUS_LABELS[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {canEdit && (
            <Button className="ml-auto" onClick={() => setDraft({ day: from })}>
              <PlusIcon data-icon="inline-start" />
              New work order
            </Button>
          )}
        </div>

        <WorkOrdersTable
          from={from}
          to={addDays(from, PERIOD_DAYS - 1)}
          status={search.status}
          canEdit={canEdit}
        />
      </div>

      <NewWorkOrderSheet draft={draft} onClose={() => setDraft(null)} />
    </>
  )
}
