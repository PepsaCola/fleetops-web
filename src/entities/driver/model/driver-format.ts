import { differenceInCalendarDays, format, parseISO } from 'date-fns'

import type { Driver } from '@/shared/api'

const relativeDays = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export const driverName = (driver: Pick<Driver, 'firstName' | 'lastName'>) =>
  `${driver.lastName} ${driver.firstName}`

/** "+380671234567" → "+380 67 123 45 67"; any other format is shown as stored */
export function formatPhone(phone: string) {
  const match = /^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone)
  return match ? `+380 ${match.slice(1).join(' ')}` : phone
}

/**
 * When the documents run out, in the words that matter for their state:
 * "until 12 Nov 2027", "expires in 9 days", "expired yesterday".
 * The state itself comes from the API; this only phrases the date.
 */
export function documentsNote(
  driver: Pick<Driver, 'documents' | 'documentsExpireOn'>,
  today: Date = new Date(),
) {
  const expiresOn = parseISO(driver.documentsExpireOn)
  if (driver.documents === 'valid') return `until ${format(expiresOn, 'd MMM yyyy')}`

  const days = relativeDays.format(differenceInCalendarDays(expiresOn, today), 'day')
  return driver.documents === 'expired' ? `expired ${days}` : `expires ${days}`
}
