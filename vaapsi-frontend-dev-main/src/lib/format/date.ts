import type { IsoDate, IsoDateTime } from '@/lib/types'

/**
 * Relative and absolute date formatting.
 *
 * Every function takes an explicit `now` so behaviour is deterministic in tests
 * and identical on the server and the client — a relative date computed during
 * SSR and recomputed on hydration is a classic mismatch warning.
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function monthName(index: number): string {
  return MONTHS[index] ?? ''
}

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`
}

/** `14 Mar 2026`. Day first, as India reads dates. */
export function formatDate(iso: IsoDate | IsoDateTime): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getUTCDate()} ${monthName(date.getUTCMonth())} ${date.getUTCFullYear()}`
}

/** `Mar 2026`. For timeline events where the exact day is noise. */
export function formatMonthYear(iso: IsoDate | IsoDateTime): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${monthName(date.getUTCMonth())} ${date.getUTCFullYear()}`
}

/**
 * Human relative time, past only.
 *
 * Degrades to an absolute month beyond a year, because "2 years ago" is less
 * informative than "Mar 2024" once a garment has a real history.
 */
export function formatRelative(iso: IsoDate | IsoDateTime, now: Date): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const delta = now.getTime() - then.getTime()
  if (delta < 0) return formatDate(iso)
  if (delta < MINUTE) return 'just now'

  const minutes = Math.floor(delta / MINUTE)
  if (minutes < 60) return `${minutes} ${plural(minutes, 'minute')} ago`

  const hours = Math.floor(delta / HOUR)
  if (hours < 24) return `${hours} ${plural(hours, 'hour')} ago`

  const days = Math.floor(delta / DAY)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} ${plural(weeks, 'week')} ago`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${plural(months, 'month')} ago`
  }

  return formatMonthYear(iso)
}

/** Years elapsed, floored. For "owned 3 years" in the passport chain. */
export function yearsSince(iso: IsoDate | IsoDateTime, now: Date): number {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 0
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / (365.25 * DAY)))
}
