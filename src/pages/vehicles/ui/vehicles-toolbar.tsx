import { XIcon } from 'lucide-react'
import type { NavigateOptions } from 'react-router'

import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS } from '@/entities/vehicle'
import { Button } from '@/shared/ui/button'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { SearchInput } from '@/shared/ui/search-input'

import {
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  VehicleListSearchSchema,
  isFiltered,
  type VehicleListSearch,
} from '../model/vehicle-list-search'

// Parsing through the URL schema turns "" (the "All …" option) and bad values into undefined
const fields = VehicleListSearchSchema.shape

interface VehiclesToolbarProps {
  search: VehicleListSearch
  onSearchChange: (patch: Partial<VehicleListSearch>, options?: NavigateOptions) => void
}

/** Search and filters above the vehicle table; every change starts again from the first page. */
export function VehiclesToolbar({ search, onSearchChange }: VehiclesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        aria-label="Search vehicles"
        placeholder="Plate, make or model"
        maxLength={50}
        className="w-full sm:w-64"
        value={search.search ?? ''}
        // Typing replaces the history entry, so Back doesn't step through every search term
        onValueChange={(text) =>
          onSearchChange({ search: fields.search.parse(text), page: 1 }, { replace: true })
        }
      />
      <NativeSelect
        aria-label="Status"
        value={search.status ?? ''}
        onChange={(event) =>
          onSearchChange({ status: fields.status.parse(event.target.value), page: 1 })
        }
      >
        <NativeSelectOption value="">All statuses</NativeSelectOption>
        {VEHICLE_STATUS_OPTIONS.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {VEHICLE_STATUS_LABELS[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Type"
        value={search.type ?? ''}
        onChange={(event) =>
          onSearchChange({ type: fields.type.parse(event.target.value), page: 1 })
        }
      >
        <NativeSelectOption value="">All types</NativeSelectOption>
        {VEHICLE_TYPE_OPTIONS.map((type) => (
          <NativeSelectOption key={type} value={type}>
            {VEHICLE_TYPE_LABELS[type]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {isFiltered(search) && (
        <Button
          variant="ghost"
          onClick={() =>
            onSearchChange({ search: undefined, status: undefined, type: undefined, page: 1 })
          }
        >
          Reset
          <XIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}
