import { conditionCopy } from '@/content/product'
import { CONDITIONS, conditionRank } from '@/lib/types'

describe('condition scale', () => {
  it('has exactly five levels, best to worst', () => {
    expect(CONDITIONS).toHaveLength(5)
    expect(conditionRank('pristine')).toBe(1)
    expect(conditionRank('well_loved')).toBe(5)
  })

  it('gives every level a public-facing definition', () => {
    for (const condition of CONDITIONS) {
      const copy = conditionCopy[condition]
      expect(copy.label.length).toBeGreaterThan(0)
      expect(copy.short.length).toBeGreaterThan(0)
      // A one-line definition is not a definition. These are the promise.
      expect(copy.definition.length).toBeGreaterThan(40)
    }
  })

  it('never leaves a level undefined', () => {
    expect(Object.keys(conditionCopy).sort()).toEqual([...CONDITIONS].sort())
  })
})
