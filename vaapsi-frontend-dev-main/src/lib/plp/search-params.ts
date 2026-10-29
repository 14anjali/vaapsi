import type { ProductFilters, ProductSort } from '@/lib/data'
import type { ListingType } from '@/lib/types'
import { CONDITIONS, GENDERS, PRODUCT_CATEGORIES } from '@/lib/types'
import type { Condition, Gender, ProductCategory, SizeSystem } from '@/lib/types'

/**
 * The listing page's entire state, encoded in the URL.
 *
 * **No filter state lives in Zustand.** Everything a shopper has chosen is in
 * `searchParams`, which buys four things for free: the page is shareable, the
 * back button is correct, the server can render the filtered result, and a
 * refresh does not silently drop what someone spent a minute selecting.
 *
 * Two deliberate choices about the shape of the URL:
 *
 * 1. **Prices are in rupees here, not paise.** Everywhere else in the contract
 *    money is integer paise, and that is right for arithmetic — but `?min=2000`
 *    is a URL a human can read and edit, and `?min=200000` is one they will
 *    misread by a factor of a hundred. The conversion happens in this file and
 *    nowhere else.
 *
 * 2. **Multi-value filters are comma-separated, not repeated keys.**
 *    `?brand=COS,Zara` rather than `?brand=COS&brand=Zara`. Shorter, and Next's
 *    `searchParams` gives a repeated key as `string[]` and a single one as
 *    `string`, which is a union every call site would otherwise have to narrow.
 */

export const PLP_PARAMS = {
  brand: 'brand',
  condition: 'condition',
  gender: 'for',
  material: 'material',
  type: 'type',
  size: 'size',
  min: 'min',
  max: 'max',
  sort: 'sort',
  page: 'page',
  sizeSystem: 'sizes',
  query: 'q',
} as const

/** What Next hands a page as `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>

export const SORTS = ['newest', 'popular', 'price_asc', 'price_desc'] as const
export type PlpSort = (typeof SORTS)[number]

/**
 * Newest is the default. In resale, recency *is* the product — a returning
 * shopper is asking "what is new since I last looked", and relevance ranking
 * over eight hundred one-of-one garments is noise.
 */
export const DEFAULT_SORT: PlpSort = 'newest'

export const PAGE_SIZE = 12

/**
 * Indian sizes only.
 *
 * The picker offered IN, UK and EU, which sounds helpful and is not: the labels
 * collide — an "M" exists on all three and means three different garments — so a
 * size filter listed the same letter repeatedly and a shopper had no way to know
 * which one their own clothes are. Every garment's label is now transcribed on
 * the Indian scale, and the conversion table stays in `lib/format/size` for the
 * size guide, which has room to show the equivalences properly.
 */
export const SIZE_SYSTEMS = ['IN'] as const
export const DEFAULT_SIZE_SYSTEM: SizeSystem = 'IN'

export type PlpState = {
  brands: readonly string[]
  /** Pre-loved only. New stock has no wear to grade. */
  conditions: readonly Condition[]
  /** Who it is cut for. A `unisex` garment answers to any of these. */
  genders: readonly Gender[]
  /** Dominant fibre handles — `cotton`, `linen`. See `primaryMaterial`. */
  materials: readonly string[]
  /** Garment type, as `ProductCategory`. "Is it a jacket, a shirt, legs." */
  types: readonly ProductCategory[]
  sizes: readonly string[]
  /** Rupees, as they appear in the URL. Null means unbounded. */
  minRupees: number | null
  maxRupees: number | null
  sort: PlpSort
  /** 1-based. `page=3` means the first three pages are shown, not just the third. */
  page: number
  sizeSystem: SizeSystem
  query: string | null
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

function readOne(params: RawSearchParams, key: string): string | null {
  const value = params[key]
  if (value === undefined) return null
  const first = Array.isArray(value) ? value[0] : value
  return first === undefined || first === '' ? null : first
}

function readList(params: RawSearchParams, key: string): readonly string[] {
  const raw = readOne(params, key)
  if (raw === null) return []
  return [
    ...new Set(
      raw
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== ''),
    ),
  ]
}

function readPositiveInt(params: RawSearchParams, key: string): number | null {
  const raw = readOne(params, key)
  if (raw === null) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/**
 * Parse, forgivingly. A hand-edited or truncated URL never throws and never
 * 500s — an unrecognised value is dropped and the rest of the state still
 * applies. Someone sharing a filtered link over WhatsApp will have it mangled,
 * and losing one filter is a much better outcome than an error page.
 */
export function parsePlpParams(params: RawSearchParams): PlpState {
  const sortRaw = readOne(params, PLP_PARAMS.sort)
  const systemRaw = readOne(params, PLP_PARAMS.sizeSystem)
  const page = readPositiveInt(params, PLP_PARAMS.page)

  return {
    brands: readList(params, PLP_PARAMS.brand),
    conditions: readList(params, PLP_PARAMS.condition).filter((value): value is Condition =>
      (CONDITIONS as readonly string[]).includes(value),
    ),
    genders: readList(params, PLP_PARAMS.gender).filter((value): value is Gender =>
      (GENDERS as readonly string[]).includes(value),
    ),
    materials: readList(params, PLP_PARAMS.material).map((value) => value.toLowerCase()),
    types: readList(params, PLP_PARAMS.type).filter((value): value is ProductCategory =>
      (PRODUCT_CATEGORIES as readonly string[]).includes(value),
    ),
    sizes: readList(params, PLP_PARAMS.size),
    minRupees: readPositiveInt(params, PLP_PARAMS.min),
    maxRupees: readPositiveInt(params, PLP_PARAMS.max),
    sort: (SORTS as readonly string[]).includes(sortRaw ?? '')
      ? (sortRaw as PlpSort)
      : DEFAULT_SORT,
    page: page === null || page < 1 ? 1 : page,
    sizeSystem: (SIZE_SYSTEMS as readonly string[]).includes(systemRaw ?? '')
      ? (systemRaw as SizeSystem)
      : DEFAULT_SIZE_SYSTEM,
    query: readOne(params, PLP_PARAMS.query),
  }
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/**
 * Serialise back to a query string, omitting anything at its default.
 *
 * Omitting defaults is not cosmetic. `?sort=newest&page=1&sizes=IN` on a page
 * where nothing has been chosen makes a shared link look like a filtered result,
 * and it makes "has this shopper filtered anything?" impossible to answer by
 * looking at the URL.
 */
export function serialisePlpState(state: PlpState): string {
  const params = new URLSearchParams()

  if (state.brands.length > 0) params.set(PLP_PARAMS.brand, [...state.brands].sort().join(','))
  if (state.conditions.length > 0) {
    // Kept in scale order rather than selection order, so two shoppers who pick
    // the same grades get the same URL.
    const ordered = CONDITIONS.filter((c) => state.conditions.includes(c))
    params.set(PLP_PARAMS.condition, ordered.join(','))
  }
  if (state.genders.length > 0) {
    params.set(PLP_PARAMS.gender, GENDERS.filter((g) => state.genders.includes(g)).join(','))
  }
  if (state.materials.length > 0) {
    params.set(PLP_PARAMS.material, [...state.materials].sort().join(','))
  }
  if (state.types.length > 0) {
    params.set(PLP_PARAMS.type, [...state.types].sort().join(','))
  }
  if (state.sizes.length > 0) params.set(PLP_PARAMS.size, [...state.sizes].join(','))
  if (state.minRupees !== null) params.set(PLP_PARAMS.min, String(state.minRupees))
  if (state.maxRupees !== null) params.set(PLP_PARAMS.max, String(state.maxRupees))
  if (state.sort !== DEFAULT_SORT) params.set(PLP_PARAMS.sort, state.sort)
  if (state.page > 1) params.set(PLP_PARAMS.page, String(state.page))
  if (state.sizeSystem !== DEFAULT_SIZE_SYSTEM) params.set(PLP_PARAMS.sizeSystem, state.sizeSystem)
  if (state.query !== null && state.query !== '') params.set(PLP_PARAMS.query, state.query)

  const encoded = params.toString()
  return encoded === '' ? '' : `?${encoded}`
}

/** State with nothing selected. */
export function emptyPlpState(): PlpState {
  return {
    brands: [],
    conditions: [],
    genders: [],
    materials: [],
    types: [],
    sizes: [],
    minRupees: null,
    maxRupees: null,
    sort: DEFAULT_SORT,
    page: 1,
    sizeSystem: DEFAULT_SIZE_SYSTEM,
    query: null,
  }
}

// ---------------------------------------------------------------------------
// Bridging to the data layer
// ---------------------------------------------------------------------------

/** Which filters are actually narrowing the result. Drives the empty state. */
export const FILTER_KEYS = [
  'brands',
  'conditions',
  'genders',
  'materials',
  'types',
  'sizes',
  'price',
  'query',
] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

export function activeFilters(state: PlpState): readonly FilterKey[] {
  const active: FilterKey[] = []
  if (state.brands.length > 0) active.push('brands')
  if (state.conditions.length > 0) active.push('conditions')
  if (state.genders.length > 0) active.push('genders')
  if (state.materials.length > 0) active.push('materials')
  if (state.types.length > 0) active.push('types')
  if (state.sizes.length > 0) active.push('sizes')
  if (state.minRupees !== null || state.maxRupees !== null) active.push('price')
  if (state.query !== null && state.query !== '') active.push('query')
  return active
}

export function activeFilterCount(state: PlpState): number {
  return (
    state.brands.length +
    state.conditions.length +
    state.genders.length +
    state.materials.length +
    state.types.length +
    state.sizes.length +
    (state.minRupees !== null || state.maxRupees !== null ? 1 : 0)
  )
}

/** Clear one filter, leaving the rest. What the empty state offers. */
export function clearFilter(state: PlpState, key: FilterKey): PlpState {
  const next = { ...state, page: 1 }
  switch (key) {
    case 'brands':
      return { ...next, brands: [] }
    case 'conditions':
      return { ...next, conditions: [] }
    case 'genders':
      return { ...next, genders: [] }
    case 'materials':
      return { ...next, materials: [] }
    case 'types':
      return { ...next, types: [] }
    case 'sizes':
      return { ...next, sizes: [] }
    case 'price':
      return { ...next, minRupees: null, maxRupees: null }
    case 'query':
      return { ...next, query: null }
  }
}

/** Translate to the adapter's filter shape. Rupees become paise here. */
export function toProductFilters(
  state: PlpState,
  category?: ProductCategory,
  /**
   * Which half of the catalogue is being browsed. The New listing and the
   * pre-loved marketplace are separate surfaces with separate filters, so this
   * is set by the page rather than by anything a shopper can put in the URL.
   */
  listingType?: ListingType,
): ProductFilters {
  const filters: ProductFilters = {
    ...(category !== undefined ? { category } : {}),
    ...(listingType !== undefined ? { listingType } : {}),
    ...(state.brands.length > 0 ? { brands: state.brands } : {}),
    ...(state.conditions.length > 0 ? { conditions: state.conditions } : {}),
    ...(state.genders.length > 0 ? { genders: state.genders } : {}),
    ...(state.materials.length > 0 ? { materials: state.materials } : {}),
    // The panel's "Type" and the `/shop/[category]` route filter the same field.
    // A route category wins: the URL path is the stronger statement, and a panel
    // that could contradict it would let a shopper land on /shop/outerwear
    // showing shirts.
    ...(category === undefined && state.types.length > 0 ? { categories: state.types } : {}),
    ...(state.sizes.length > 0 ? { sizes: state.sizes } : {}),
    ...(state.minRupees !== null ? { minPriceInr: state.minRupees * 100 } : {}),
    ...(state.maxRupees !== null ? { maxPriceInr: state.maxRupees * 100 } : {}),
    ...(state.query !== null && state.query !== '' ? { query: state.query } : {}),
  }
  return filters
}

/** The PLP's sorts are a subset of the adapter's. */
export function toProductSort(sort: PlpSort): ProductSort {
  return sort
}
