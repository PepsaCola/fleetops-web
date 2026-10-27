import type { Driver } from '@/shared/api'
import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'

import { documentsNote } from '../model/driver-format'
import { DOCUMENT_STATE_LABELS, type DocumentState } from '../model/driver-labels'

const TONES: Record<DocumentState, StatusTone> = {
  valid: 'success',
  expiring: 'warning',
  expired: 'danger',
}

/** The state of a driver's licence and medical certificate, and when the first one runs out. */
export function DriverDocuments({ driver }: { driver: Driver }) {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge tone={TONES[driver.documents]}>
        {DOCUMENT_STATE_LABELS[driver.documents]}
      </StatusBadge>
      <span className="text-xs text-muted-foreground">{documentsNote(driver)}</span>
    </div>
  )
}
