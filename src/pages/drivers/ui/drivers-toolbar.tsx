import { XIcon } from 'lucide-react'
import type { NavigateOptions } from 'react-router'

import { DOCUMENT_STATE_LABELS, DRIVER_STATUS_LABELS } from '@/entities/driver'
import { Button } from '@/shared/ui/button'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { SearchInput } from '@/shared/ui/search-input'

import {
  DOCUMENT_STATE_OPTIONS,
  DRIVER_STATUS_OPTIONS,
  DriverListSearchSchema,
  isFiltered,
  type DriverListSearch,
} from '../model/driver-list-search'

// Parsing through the URL schema turns "" (the "All …" option) and bad values into undefined
const fields = DriverListSearchSchema.shape

interface DriversToolbarProps {
  search: DriverListSearch
  onSearchChange: (patch: Partial<DriverListSearch>, options?: NavigateOptions) => void
}

/** Search and filters above the driver table; every change starts again from the first page. */
export function DriversToolbar({ search, onSearchChange }: DriversToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        aria-label="Search drivers"
        placeholder="Name, phone or licence"
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
        {DRIVER_STATUS_OPTIONS.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {DRIVER_STATUS_LABELS[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Documents"
        value={search.documents ?? ''}
        onChange={(event) =>
          onSearchChange({ documents: fields.documents.parse(event.target.value), page: 1 })
        }
      >
        <NativeSelectOption value="">All documents</NativeSelectOption>
        {DOCUMENT_STATE_OPTIONS.map((state) => (
          <NativeSelectOption key={state} value={state}>
            {DOCUMENT_STATE_LABELS[state]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {isFiltered(search) && (
        <Button
          variant="ghost"
          onClick={() =>
            onSearchChange({ search: undefined, status: undefined, documents: undefined, page: 1 })
          }
        >
          Reset
          <XIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}
