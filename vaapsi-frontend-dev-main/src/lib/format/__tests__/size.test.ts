import type { Size } from '@/lib/types'
import {
  ONE_SIZE,
  convertSize,
  formatSizeWithConversion,
  sizeEquivalents,
  sizeSortIndex,
} from '../size'

const inMedium: Size = { label: 'M', system: 'IN', normalized: 'm' }
const ukTwelve: Size = { label: '12', system: 'UK', normalized: 'l' }
const waist30: Size = { label: '30', system: 'IN', normalized: 'w30' }
const scarf: Size = { label: 'One size', system: 'IN', normalized: ONE_SIZE }
const unknown: Size = { label: 'Free', system: 'IN', normalized: 'free' }

describe('convertSize', () => {
  it('converts across systems', () => {
    expect(convertSize(inMedium, 'UK')).toBe('10')
    expect(convertSize(inMedium, 'EU')).toBe('38')
    expect(convertSize(inMedium, 'US')).toBe('6')
    expect(convertSize(ukTwelve, 'EU')).toBe('40')
  })

  it('converts waist sizes by adding the EU offset', () => {
    expect(convertSize(waist30, 'EU')).toBe('46')
    expect(convertSize(waist30, 'UK')).toBe('30')
  })

  it('returns null rather than guessing', () => {
    expect(convertSize(inMedium, 'IN')).toBeNull()
    expect(convertSize(scarf, 'UK')).toBeNull()
    expect(convertSize(unknown, 'UK')).toBeNull()
  })
})

describe('sizeEquivalents', () => {
  it('returns every system for a known size', () => {
    expect(sizeEquivalents(inMedium)).toEqual({ IN: 'M', UK: '10', EU: '38', US: '6' })
  })

  it('returns nothing for an unknown size', () => {
    expect(sizeEquivalents(unknown)).toEqual({})
  })
})

describe('formatSizeWithConversion', () => {
  it('leads with the printed label', () => {
    expect(formatSizeWithConversion(inMedium, 'UK')).toBe('M (UK 10)')
  })

  it('falls back to the printed label alone', () => {
    expect(formatSizeWithConversion(unknown, 'UK')).toBe('Free')
    expect(formatSizeWithConversion(scarf, 'EU')).toBe('One size')
  })
})

describe('sizeSortIndex', () => {
  it('orders the alpha scale small to large', () => {
    expect(sizeSortIndex('xs')).toBeLessThan(sizeSortIndex('m'))
    expect(sizeSortIndex('m')).toBeLessThan(sizeSortIndex('xxl'))
  })

  it('reports -1 for an unknown size', () => {
    expect(sizeSortIndex('free')).toBe(-1)
  })
})
