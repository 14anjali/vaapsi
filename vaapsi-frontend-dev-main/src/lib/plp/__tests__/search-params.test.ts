import {
  DEFAULT_SIZE_SYSTEM,
  DEFAULT_SORT,
  activeFilterCount,
  activeFilters,
  clearFilter,
  emptyPlpState,
  parsePlpParams,
  serialisePlpState,
  toProductFilters,
} from '../search-params'
import type { PlpState } from '../search-params'

describe('parsePlpParams', () => {
  it('returns the empty state for no params', () => {
    expect(parsePlpParams({})).toEqual(emptyPlpState())
  })

  it('reads comma-separated multi-value filters', () => {
    const state = parsePlpParams({ brand: 'COS,Zara', size: 'm,l' })
    expect(state.brands).toEqual(['COS', 'Zara'])
    expect(state.sizes).toEqual(['m', 'l'])
  })

  it('de-duplicates and trims', () => {
    expect(parsePlpParams({ brand: 'COS, COS ,Zara' }).brands).toEqual(['COS', 'Zara'])
  })

  it('takes the first value when a key is repeated', () => {
    expect(parsePlpParams({ sort: ['price_asc', 'price_desc'] }).sort).toBe('price_asc')
  })

  it('drops unknown conditions rather than failing', () => {
    const state = parsePlpParams({ condition: 'good,perfect,pristine' })
    expect(state.conditions).toEqual(['good', 'pristine'])
  })

  it('falls back to defaults for an unrecognised sort or size system', () => {
    const state = parsePlpParams({ sort: 'cheapest', sizes: 'JP' })
    expect(state.sort).toBe(DEFAULT_SORT)
    expect(state.sizeSystem).toBe(DEFAULT_SIZE_SYSTEM)
  })

  it('survives a mangled URL without throwing', () => {
    for (const params of [
      { min: 'abc' },
      { max: '-40' },
      { page: '0' },
      { page: 'seven' },
      { brand: ',,,' },
      { passport: 'yes' },
    ]) {
      expect(() => parsePlpParams(params)).not.toThrow()
    }
    expect(parsePlpParams({ min: 'abc' }).minRupees).toBeNull()
    expect(parsePlpParams({ max: '-40' }).maxRupees).toBeNull()
    expect(parsePlpParams({ page: '0' }).page).toBe(1)
    expect(parsePlpParams({ brand: ',,,' }).brands).toEqual([])
  })

  it('ignores the retired passport param that old links still carry', () => {
    // The filter is gone — every garment has a record, so filtering on one
    // sorted the catalogue by how complete our data was. A bookmarked
    // `?passport=1` has to keep working rather than 404 or throw.
    const state = parsePlpParams({ passport: '1' })
    expect(state).toEqual(emptyPlpState())
    expect(Object.keys(state)).not.toContain('hasPassport')
  })
})

describe('serialisePlpState', () => {
  it('produces an empty string when nothing is selected', () => {
    expect(serialisePlpState(emptyPlpState())).toBe('')
  })

  it('omits every default, so a clean URL looks clean', () => {
    const state: PlpState = { ...emptyPlpState(), sort: DEFAULT_SORT, page: 1 }
    expect(serialisePlpState(state)).not.toContain('sort=')
    expect(serialisePlpState(state)).not.toContain('page=')
    expect(serialisePlpState(state)).not.toContain('sizes=')
  })

  it('normalises list order, so one selection is always one URL', () => {
    // Two shoppers who tick the same boxes in a different order must get the
    // same link — otherwise the same result set has several URLs, which costs
    // cache hits and makes "has this been filtered?" unanswerable from the URL.
    const a = serialisePlpState({ ...emptyPlpState(), types: ['tops', 'bottoms'] })
    const b = serialisePlpState({ ...emptyPlpState(), types: ['bottoms', 'tops'] })
    expect(a).toBe(b)

    const women = serialisePlpState({ ...emptyPlpState(), genders: ['men', 'women'] })
    // Ladder order, not selection order.
    expect(women).toContain('for=women%2Cmen')
  })

  it('round-trips every field', () => {
    const state: PlpState = {
      brands: ['COS', 'Zara'],
      conditions: ['pristine', 'good'],
      genders: ['women', 'men'],
      materials: ['cotton'],
      types: ['bottoms', 'tops'],
      sizes: ['m', 'w30'],
      minRupees: 1000,
      maxRupees: 20000,
      sort: 'price_desc',
      page: 3,
      sizeSystem: 'IN',
      query: 'linen',
    }
    const round = parsePlpParams(
      Object.fromEntries(new URLSearchParams(serialisePlpState(state)).entries()),
    )
    expect(round).toEqual(state)
  })

  it('orders conditions by the scale, so equivalent selections share a URL', () => {
    const a = serialisePlpState({ ...emptyPlpState(), conditions: ['good', 'pristine'] })
    const b = serialisePlpState({ ...emptyPlpState(), conditions: ['pristine', 'good'] })
    expect(a).toBe(b)
    expect(a).toContain('condition=pristine%2Cgood')
  })

  it('sorts brands, so equivalent selections share a URL', () => {
    const a = serialisePlpState({ ...emptyPlpState(), brands: ['Zara', 'COS'] })
    const b = serialisePlpState({ ...emptyPlpState(), brands: ['COS', 'Zara'] })
    expect(a).toBe(b)
  })
})

describe('toProductFilters', () => {
  it('converts rupees in the URL to paise for the adapter', () => {
    const filters = toProductFilters({ ...emptyPlpState(), minRupees: 2000, maxRupees: 15000 })
    expect(filters.minPriceInr).toBe(200_000)
    expect(filters.maxPriceInr).toBe(1_500_000)
  })

  it('omits keys entirely rather than passing empty arrays', () => {
    const filters = toProductFilters(emptyPlpState())
    expect(filters).toEqual({})
  })

  it('passes the category through when given', () => {
    expect(toProductFilters(emptyPlpState(), 'knitwear').category).toBe('knitwear')
  })

  it('never asks the adapter to filter on the passport', () => {
    // The capability still exists in the data layer; the storefront does not
    // use it, and a filter nobody can set must not leak into a query.
    expect(toProductFilters(emptyPlpState()).hasPassport).toBeUndefined()
  })
})

describe('activeFilters', () => {
  it('reports nothing for a clean state', () => {
    expect(activeFilters(emptyPlpState())).toEqual([])
    expect(activeFilterCount(emptyPlpState())).toBe(0)
  })

  it('does not count sort, page or size system as filters', () => {
    const state: PlpState = { ...emptyPlpState(), sort: 'price_asc', page: 4, sizeSystem: 'EU' }
    expect(activeFilters(state)).toEqual([])
  })

  it('counts a price bound as one filter, not two', () => {
    expect(activeFilterCount({ ...emptyPlpState(), minRupees: 100, maxRupees: 900 })).toBe(1)
  })
})

describe('clearFilter', () => {
  const full: PlpState = {
    ...emptyPlpState(),
    brands: ['COS'],
    conditions: ['good'],
    sizes: ['m'],
    minRupees: 500,
    maxRupees: 900,
    page: 4,
  }

  it('clears one filter and leaves the others', () => {
    const next = clearFilter(full, 'sizes')
    expect(next.sizes).toEqual([])
    expect(next.brands).toEqual(['COS'])
  })

  it('clears both price bounds together', () => {
    const next = clearFilter(full, 'price')
    expect(next.minRupees).toBeNull()
    expect(next.maxRupees).toBeNull()
  })

  it('always returns to page 1, so nobody lands past the end of a shorter result', () => {
    for (const key of ['brands', 'conditions', 'sizes', 'price', 'query'] as const) {
      expect(clearFilter(full, key).page).toBe(1)
    }
  })
})
