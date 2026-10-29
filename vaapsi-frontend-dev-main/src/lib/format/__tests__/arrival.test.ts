import { arrivalWindow, formatArrival, formatArrivalWindow } from '../arrival'

/**
 * Delivery estimates.
 *
 * This is arithmetic a shopper would otherwise do in their head and get wrong,
 * which makes it worth asserting rather than eyeballing — and the answers depend
 * on which weekday the order lands on, so every case here fixes a known date
 * instead of using the clock.
 */

// Monday 7 September 2026. Month is zero-indexed.
const MONDAY = new Date(2026, 8, 7)
// Thursday 10 September 2026 — the interesting case, because a working-day
// window from a Thursday has to jump a weekend.
const THURSDAY = new Date(2026, 8, 10)
const FRIDAY = new Date(2026, 8, 11)

describe('working-day estimates', () => {
  it('skips the weekend', () => {
    // 4 working days from Monday: Tue, Wed, Thu, Fri.
    const window = arrivalWindow({ minDays: 4, maxDays: 4, workingDays: true }, MONDAY)
    expect(formatArrivalWindow(window)).toBe('Fri 11 Sep')
  })

  it('carries a window across the weekend from a Thursday', () => {
    // 4 working days from Thursday is Wednesday, not Monday. This is the sum
    // people get wrong, and the reason the interface states a date at all.
    expect(formatArrival({ minDays: 4, maxDays: 6, workingDays: true }, THURSDAY)).toBe(
      'Wed 16 – Fri 18 Sep',
    )
  })

  it('counts from the day after the order, not the day of it', () => {
    // Ordering Friday with a one-working-day window is Monday. Same-day is a
    // promise nothing in this business can keep.
    expect(formatArrival({ minDays: 1, maxDays: 1, workingDays: true }, FRIDAY)).toBe('Mon 14 Sep')
  })
})

describe('calendar-day estimates', () => {
  it('counts every day, weekends included', () => {
    // "About 30 days" means a month. Counting 30 *working* days would quietly
    // mean six weeks, which is a different offer.
    expect(formatArrival({ minDays: 28, maxDays: 32, workingDays: false }, MONDAY)).toBe(
      'Mon 5 – Fri 9 Oct',
    )
  })

  it('never quotes a Saturday or a Sunday, even counting calendar days', () => {
    // Couriers do not deliver at the weekend, so a calendar-day estimate that
    // lands on one is nudged to the Monday rather than promising a date nothing
    // arrives on.
    for (let days = 1; days <= 60; days += 1) {
      const { from, to } = arrivalWindow(
        { minDays: days, maxDays: days, workingDays: false },
        MONDAY,
      )
      expect([0, 6]).not.toContain(from.getDay())
      expect([0, 6]).not.toContain(to.getDay())
    }
  })
})

describe('the phrasing', () => {
  it('states the month once when both ends share it', () => {
    // "Tue 9 Sep – Thu 11 Sep" repeats a word that carries no information.
    expect(formatArrival({ minDays: 1, maxDays: 3, workingDays: true }, MONDAY)).toBe(
      'Tue 8 – Thu 10 Sep',
    )
  })

  it('states both months when the window crosses one', () => {
    // 17 and 19 working days from Mon 7 Sep straddle the month end.
    expect(formatArrival({ minDays: 17, maxDays: 19, workingDays: true }, MONDAY)).toBe(
      'Wed 30 Sep – Fri 2 Oct',
    )
  })

  it('collapses to a single date when the window has no width', () => {
    const window = arrivalWindow({ minDays: 3, maxDays: 3, workingDays: true }, MONDAY)
    expect(window.exact).toBe(true)
    expect(formatArrivalWindow(window)).toBe('Thu 10 Sep')
  })

  it('does not depend on the hour the order was placed', () => {
    const morning = new Date(2026, 8, 7, 1, 0)
    const night = new Date(2026, 8, 7, 23, 59)
    const lead = { minDays: 4, maxDays: 6, workingDays: true }
    expect(formatArrival(lead, morning)).toBe(formatArrival(lead, night))
  })
})
