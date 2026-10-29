import { formatDate, formatMonthYear, formatRelative, yearsSince } from '../date'

const now = new Date('2026-08-23T12:00:00.000Z')
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString()

describe('formatDate', () => {
  it('formats day first', () => {
    expect(formatDate('2026-03-14T09:12:00.000Z')).toBe('14 Mar 2026')
    expect(formatDate('2026-03-14')).toBe('14 Mar 2026')
  })

  it('returns an empty string for an unparseable date', () => {
    expect(formatDate('not a date')).toBe('')
  })
})

describe('formatMonthYear', () => {
  it('drops the day', () => {
    expect(formatMonthYear('2024-03-14')).toBe('Mar 2024')
  })
})

describe('formatRelative', () => {
  it('handles the recent past', () => {
    expect(formatRelative(new Date(now.getTime() - 30_000).toISOString(), now)).toBe('just now')
    expect(formatRelative(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe(
      '5 minutes ago',
    )
    expect(formatRelative(new Date(now.getTime() - 60_000).toISOString(), now)).toBe('1 minute ago')
    expect(formatRelative(new Date(now.getTime() - 3 * 3_600_000).toISOString(), now)).toBe(
      '3 hours ago',
    )
  })

  it('handles days and weeks', () => {
    expect(formatRelative(daysAgo(1), now)).toBe('yesterday')
    expect(formatRelative(daysAgo(3), now)).toBe('3 days ago')
    expect(formatRelative(daysAgo(7), now)).toBe('1 week ago')
    expect(formatRelative(daysAgo(21), now)).toBe('3 weeks ago')
  })

  it('handles months', () => {
    expect(formatRelative(daysAgo(31), now)).toBe('1 month ago')
    expect(formatRelative(daysAgo(200), now)).toBe('6 months ago')
  })

  it('degrades to an absolute month past a year', () => {
    expect(formatRelative('2024-03-14T00:00:00.000Z', now)).toBe('Mar 2024')
  })

  it('does not invent a future tense', () => {
    expect(formatRelative('2027-01-01T00:00:00.000Z', now)).toBe('1 Jan 2027')
  })
})

describe('yearsSince', () => {
  it('floors to whole years', () => {
    expect(yearsSince('2026-08-01T00:00:00.000Z', now)).toBe(0)
    expect(yearsSince('2023-01-01T00:00:00.000Z', now)).toBe(3)
  })

  it('never returns a negative', () => {
    expect(yearsSince('2030-01-01T00:00:00.000Z', now)).toBe(0)
  })
})
