import { formatComposition } from '../composition'
import { formatSizeRange } from '../size'
import type { Size } from '@/lib/types'

const size = (label: string, normalized: string): Size => ({
  label,
  system: 'IN',
  normalized,
})

/**
 * Both of these shorten a fact to fit one line on a card, so both can shorten
 * it into a lie. These tests are mostly about where they must refuse to.
 */

describe('formatComposition', () => {
  it('drops a trace fibre and keeps the percentage', () => {
    // "98% cotton" is honest short form. "cotton" would imply 100% and quietly
    // lose the stretch, which is the thing a denim shopper wants to know.
    expect(formatComposition('98% cotton, 2% elastane')).toBe('98% cotton')
    expect(formatComposition('99% cotton, 1% elastane')).toBe('99% cotton')
  })

  it('leaves a single fibre alone', () => {
    expect(formatComposition('100% cotton')).toBe('100% cotton')
  })

  it('names every fibre in a genuine blend', () => {
    // A 60/40 is not a "60% cotton" garment in any useful sense, and hiding the
    // 40% would be a misrepresentation rather than a tidy-up.
    expect(formatComposition('60% cotton, 40% hemp')).toBe('60% cotton, 40% hemp')
    expect(formatComposition('50% linen, 50% cotton')).toBe('50% linen, 50% cotton')
  })

  it('orders a blend heaviest first, whatever order it arrives in', () => {
    expect(formatComposition('30% hemp, 70% cotton')).toBe('70% cotton, 30% hemp')
  })

  it('treats 80% as the line between a blend and a dominant fibre', () => {
    expect(formatComposition('80% cotton, 20% wool')).toBe('80% cotton')
    expect(formatComposition('79% cotton, 21% wool')).toBe('79% cotton, 21% wool')
  })

  it('ignores unmeasured trim when picking the dominant fibre', () => {
    // "leather trim" has no percentage, so it can never win — and it is trim,
    // not composition.
    expect(formatComposition('100% cotton, leather trim')).toBe('100% cotton')
  })

  it('returns anything it cannot parse unchanged, rather than empty', () => {
    expect(formatComposition('Cotton canvas')).toBe('Cotton canvas')
    expect(formatComposition('')).toBe('')
  })
})

describe('formatSizeRange', () => {
  it('collapses a contiguous run to its endpoints', () => {
    expect(formatSizeRange([size('W28', 'w28'), size('W30', 'w30'), size('W32', 'w32')])).toBe(
      'W28–W32',
    )
    expect(formatSizeRange([size('S', 's'), size('M', 'm'), size('L', 'l')])).toBe('S–L')
  })

  it('returns a single size as itself', () => {
    expect(formatSizeRange([size('M', 'm')])).toBe('M')
  })

  it('returns nothing for nothing', () => {
    expect(formatSizeRange([])).toBe('')
  })

  it('lists a gappy set rather than implying stock that is not there', () => {
    // "W28–W36" would promise a W32 nobody can buy. This is the assertion that
    // matters most in this file.
    expect(formatSizeRange([size('W28', 'w28'), size('W30', 'w30'), size('W36', 'w36')])).toBe(
      'W28, W30, W36',
    )
  })

  it('orders by the size ladder, not by the order it was given', () => {
    expect(formatSizeRange([size('L', 'l'), size('S', 's'), size('M', 'm')])).toBe('S–L')
  })

  it('de-duplicates sizes repeated across colourways', () => {
    // The caller flattens several colourways, so repeats are the normal case.
    expect(formatSizeRange([size('S', 's'), size('M', 'm'), size('S', 's'), size('M', 'm')])).toBe(
      'S–M',
    )
  })

  it('does not let an unknown label become the low end of a span', () => {
    // An unrecognised normalized value sorts last rather than to -1, where it
    // would silently define the start of the range.
    const out = formatSizeRange([size('M', 'm'), size('Bespoke', 'bespoke')])
    expect(out.startsWith('M')).toBe(true)
  })
})
