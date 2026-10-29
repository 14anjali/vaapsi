/**
 * When a parcel actually arrives, as a date.
 *
 * ## Why this exists
 *
 * The checkout used to say "4–6 working days" and "arrives in about 30 days",
 * which makes the shopper do the arithmetic — and working days is arithmetic
 * they will get wrong, because it depends on which day of the week they are
 * ordering on. Every ecommerce checkout worth using states the date. "Tue 9 –
 * Thu 11 Sep" answers the question; "4–6 working days" asks one back.
 *
 * ## Working days versus calendar days
 *
 * Standard shipping is quoted in *working* days, so the estimate skips
 * weekends: ordering on a Thursday with a 4-day floor lands the following
 * Wednesday, not Monday. The consolidated tiers are quoted in calendar days
 * ("about 30 days") because that is how a month-long hold is understood, and
 * counting 30 working days would silently mean six weeks.
 *
 * ⚠️ **Public holidays are not modelled.** India has enough regional holidays
 * that a real implementation needs a calendar per state, and a wrong holiday is
 * worse than none. The courier's own API is the right source for this once the
 * contract exists (PRD open question #8). Until then the estimate can run one
 * or two days optimistic around Diwali or Holi, which is exactly why the
 * checkout labels these as estimates rather than promises.
 *
 * ## `now` is always a parameter
 *
 * Same rule as the rest of `lib/format`: nothing here reads the clock. A date
 * computed during SSR and recomputed on hydration is a mismatch warning, and a
 * test that depends on today's date fails on a Sunday.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
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

/** How long a delivery option takes, and in which kind of day. */
export type LeadTime = {
  /** Earliest arrival, in days. */
  minDays: number
  /** Latest arrival. Equal to `minDays` for a single-date estimate. */
  maxDays: number
  /** True to skip weekends; false to count calendar days. */
  workingDays: boolean
}

export type ArrivalWindow = {
  from: Date
  to: Date
  /** True when both ends land on the same day, so the copy can say "on". */
  exact: boolean
}

/** Midnight, so a range never depends on the hour someone checked out. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * `days` days after `from`, skipping weekends when asked.
 *
 * Counting forward one day at a time rather than adding an offset, because the
 * number of weekends inside a span depends on where the span starts — there is
 * no closed form that stays right for every starting weekday.
 */
function addDays(from: Date, days: number, workingDays: boolean): Date {
  const date = startOfDay(from)
  let remaining = Math.max(0, Math.floor(days))
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    if (!workingDays || !isWeekend(date)) remaining -= 1
  }
  // A calendar-day estimate can still land on a weekend, and couriers do not
  // deliver then. Nudge it to the Monday rather than quoting a date nothing
  // arrives on.
  while (isWeekend(date)) date.setDate(date.getDate() + 1)
  return date
}

/** The window a delivery option lands in, counted from `now`. */
export function arrivalWindow(lead: LeadTime, now: Date): ArrivalWindow {
  const from = addDays(now, lead.minDays, lead.workingDays)
  const to = addDays(now, lead.maxDays, lead.workingDays)
  return { from, to, exact: from.getTime() === to.getTime() }
}

/** `Tue 9 Sep`. Weekday first, because that is what people plan around. */
export function formatArrivalDate(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()] ?? ''
  const month = MONTHS[date.getMonth()] ?? ''
  return `${weekday} ${date.getDate()} ${month}`
}

/**
 * The window as one phrase.
 *
 * `Tue 9 – Thu 11 Sep` when both ends share a month, `Thu 30 Oct – Mon 3 Nov`
 * when they do not, and `Tue 9 Sep` when it is a single day. Repeating the
 * month on both ends of "9 Sep – 11 Sep" is noise; dropping it when the month
 * changes would be wrong.
 */
export function formatArrivalWindow(window: ArrivalWindow): string {
  if (window.exact) return formatArrivalDate(window.from)

  const sameMonth =
    window.from.getMonth() === window.to.getMonth() &&
    window.from.getFullYear() === window.to.getFullYear()

  if (sameMonth) {
    const weekday = WEEKDAYS[window.from.getDay()] ?? ''
    return `${weekday} ${window.from.getDate()} – ${formatArrivalDate(window.to)}`
  }
  return `${formatArrivalDate(window.from)} – ${formatArrivalDate(window.to)}`
}

/** The whole job in one call, for a caller that only wants the string. */
export function formatArrival(lead: LeadTime, now: Date): string {
  return formatArrivalWindow(arrivalWindow(lead, now))
}
