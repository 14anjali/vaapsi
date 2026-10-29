import { account, orders, RESALE_SHOTS } from './fixtures/account'
import { assess } from './resale'
import { DataError } from './adapter'
import { materialLabel, primaryMaterial } from '@/lib/format/composition'
import { sizeSortIndex } from '@/lib/format/size'
import { CONDITIONS, GENDERS } from '@/lib/types'
import type {
  Account,
  Cart,
  CartLine,
  CartTotals,
  Condition,
  ListingType,
  Order,
  OrderLineId,
  ResaleAssessment,
  ResaleRequest,
  ResaleShot,
  Page,
  Passport,
  PassportId,
  Product,
  ProductCategory,
  ProductId,
  ProductSummary,
  Seller,
  SellerId,
} from '@/lib/types'
import type {
  CartItemRef,
  DataAdapter,
  ListProductsInput,
  ProductFacets,
  ProductFilters,
  ProductSort,
} from './adapter'
import { passports } from './fixtures/passports'
import { products } from './fixtures/products'
import { sellers } from './fixtures/sellers'

/**
 * Mock implementation of `DataAdapter`, backed by local fixtures.
 *
 * Fixtures are imported **here and nowhere else** — an ESLint rule enforces it.
 * The cart is held in module scope, which is deliberately naive: it resets on
 * server restart and is shared across requests. That is fine for a storefront
 * prototype and it is exactly the thing the real adapter replaces.
 */

const EDITORIAL_ORDER: readonly ProductId[] = [
  'prd_bhaane_trucker_indigo',
  'prd_acne_denim_maxi_skirt',
  'prd_cos_denim_jumpsuit',
  'prd_levis_501_indigo',
  'prd_nicobar_chambray_shirtdress',
  'prd_uniqlo_wide_leg_jeans',
]

function toSummary(product: Product): ProductSummary {
  const primary = product.images.find((image) => image.kind === 'primary') ?? product.images[0]
  if (primary === undefined) {
    throw new Error(`Product ${product.id} has no images. Every garment needs at least one.`)
  }
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    listingType: product.listingType,
    gender: product.gender,
    condition: product.condition,
    color: product.color,
    composition: product.composition,
    colorVariants: product.colorVariants,
    size: product.size,
    priceInr: product.priceInr,
    originalRetailInr: product.originalRetailInr,
    currency: product.currency,
    availability: product.availability,
    passportId: product.passportId,
    primaryImage: primary,
  }
}

function matches(product: Product, filters: ProductFilters): boolean {
  if (filters.category !== undefined && product.category !== filters.category) return false
  if (
    filters.category === undefined &&
    filters.categories !== undefined &&
    filters.categories.length > 0 &&
    !filters.categories.includes(product.category)
  ) {
    return false
  }
  if (filters.listingType !== undefined && product.listingType !== filters.listingType) {
    return false
  }
  if (filters.genders !== undefined && filters.genders.length > 0) {
    // A unisex garment answers to every gender rather than to none. Excluding
    // it from both listings is the failure mode here, and it is silent.
    if (product.gender !== 'unisex' && !filters.genders.includes(product.gender)) return false
  }
  if (filters.materials !== undefined && filters.materials.length > 0) {
    const material = primaryMaterial(product.composition)
    if (material === null || !filters.materials.includes(material)) return false
  }
  if (filters.brands !== undefined && filters.brands.length > 0) {
    if (!filters.brands.includes(product.brand)) return false
  }
  if (filters.conditions !== undefined && filters.conditions.length > 0) {
    // New stock has no grade, so a condition filter excludes it rather than
    // matching everything. Asking for "very good" is asking about wear.
    if (product.condition === null) return false
    if (!filters.conditions.includes(product.condition)) return false
  }
  if (filters.sizes !== undefined && filters.sizes.length > 0) {
    if (!filters.sizes.includes(product.size.normalized)) return false
  }
  if (filters.minPriceInr !== undefined && product.priceInr < filters.minPriceInr) return false
  if (filters.maxPriceInr !== undefined && product.priceInr > filters.maxPriceInr) return false
  if (filters.hasPassport === true && product.passportId === null) return false
  if (filters.hasPassport === false && product.passportId !== null) return false
  if (filters.query !== undefined && filters.query.trim() !== '') {
    const needle = filters.query.trim().toLowerCase()
    const haystack = `${product.title} ${product.brand} ${product.subcategory} ${product.category}`
    if (!haystack.toLowerCase().includes(needle)) return false
  }
  return true
}

function sorted(list: readonly Product[], sort: ProductSort): readonly Product[] {
  const copy = [...list]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.priceInr - b.priceInr)
    case 'price_desc':
      return copy.sort((a, b) => b.priceInr - a.priceInr)
    case 'alphabetical':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'newest':
      return copy.sort((a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt))
    case 'popular':
      // **Curated, not measured.** There is no order history in Phase 1, so
      // there is nothing to count — this is the same editorial order that feeds
      // the home page, with everything unranked falling in behind it by
      // recency. When real sales data exists it replaces this case and nothing
      // above it changes.
      //
      // The shopper-facing label says "Popular", never "Best selling", because
      // the second is a factual claim this cannot yet support.
      return copy.sort((a, b) => {
        const rank = (product: Product) => {
          const index = EDITORIAL_ORDER.indexOf(product.id)
          return index === -1 ? Number.MAX_SAFE_INTEGER : index
        }
        const byRank = rank(a) - rank(b)
        if (byRank !== 0) return byRank
        return Date.parse(b.listedAt) - Date.parse(a.listedAt)
      })
    case 'relevance':
    default:
      // Available first, then newest. A sold garment sinking below an available
      // one is the only relevance signal Phase 1 legitimately has.
      return copy.sort((a, b) => {
        const rank = (product: Product) => (product.availability === 'sold' ? 1 : 0)
        const byAvailability = rank(a) - rank(b)
        if (byAvailability !== 0) return byAvailability
        return Date.parse(b.listedAt) - Date.parse(a.listedAt)
      })
  }
}

function countBy<T extends string>(values: readonly T[]): readonly { value: T; count: number }[] {
  const counts = new Map<T, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)))
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

const MOCK_CART_ID = 'crt_mock_session'

/**
 * Status for a remembered garment, resolved fresh every time.
 *
 * `sold_out` is not an error state — it is the expected outcome of a slow
 * checkout on one-of-one inventory, and the cart has to show it rather than
 * silently dropping the line. A garment that vanishes from a bag is worse than
 * one that says it has gone.
 *
 * `price_changed` is never emitted here. The client stores no price, so there is
 * nothing to compare against; a real backend holding a server-side cart can
 * detect it, and the type keeps the case open for when one does.
 */
function statusFor(availability: Product['availability']): CartLine['status'] {
  switch (availability) {
    case 'available':
      return 'active'
    case 'reserved':
      return 'reserved'
    case 'sold':
      return 'sold_out'
  }
}

function totals(lines: readonly CartLine[]): CartTotals {
  // Only lines that can actually be bought count. A sold garment sitting in the
  // bag must not inflate the total the shopper is about to be charged.
  const subtotalInr = lines
    .filter((line) => line.status === 'active')
    .reduce((sum, line) => sum + line.product.priceInr, 0)

  return {
    subtotalInr,
    // Null until a PIN code is known, and null until the merchant-of-record
    // model is settled. The front end does not invent money.
    shippingInr: null,
    taxInr: null,
    discountInr: 0,
    totalInr: subtotalInr,
  }
}

// ---------------------------------------------------------------------------

export const mockAdapter: DataAdapter = {
  async listProducts(input: ListProductsInput = {}): Promise<Page<ProductSummary>> {
    const { filters = {}, sort = 'relevance', limit = 24, cursor = null } = input

    const filtered = products.filter((product) => matches(product, filters))
    const ordered = sorted(filtered, sort)

    const offset = cursor === null ? 0 : Number.parseInt(cursor, 10)
    const start = Number.isNaN(offset) ? 0 : offset
    const slice = ordered.slice(start, start + limit)
    const nextOffset = start + slice.length

    return {
      items: slice.map(toSummary),
      nextCursor: nextOffset < ordered.length ? String(nextOffset) : null,
      total: ordered.length,
    }
  },

  async getProduct(idOrSlug: ProductId | string): Promise<Product | null> {
    return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
  },

  async getProductFacets(listingType?: ListingType): Promise<ProductFacets> {
    // Scoped, so the New listing is never offered a condition grade nothing in
    // it has. Counted against the listing type's whole set rather than against
    // the current filters, so a count does not collapse to zero as a shopper
    // narrows down.
    const scope =
      listingType === undefined
        ? products
        : products.filter((product) => product.listingType === listingType)

    const count = <T>(values: readonly T[]): Map<T, number> => {
      const out = new Map<T, number>()
      for (const value of values) out.set(value, (out.get(value) ?? 0) + 1)
      return out
    }

    const brands = count(scope.map((product) => product.brand))
    const categories = count(scope.map((product) => product.category))
    const conditions = count(
      scope
        .map((product) => product.condition)
        .filter((condition): condition is Condition => condition !== null),
    )
    const genders = count(scope.map((product) => product.gender))

    const materials = new Map<string, number>()
    for (const product of scope) {
      const material = primaryMaterial(product.composition)
      if (material === null) continue
      materials.set(material, (materials.get(material) ?? 0) + 1)
    }

    // Every size a shopper could buy, which for new stock means the colourways'
    // sizes and not the product's own default label.
    const sizes = new Map<string, { label: string; count: number }>()
    for (const product of scope) {
      const offered =
        product.colorVariants.length > 0
          ? product.colorVariants.flatMap((variant) => variant.sizes)
          : [product.size]
      for (const size of new Map(offered.map((s) => [s.normalized, s])).values()) {
        const existing = sizes.get(size.normalized)
        sizes.set(size.normalized, {
          label: size.label,
          count: (existing?.count ?? 0) + 1,
        })
      }
    }

    const prices = scope.map((product) => product.priceInr)

    return {
      brands: [...brands.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      categories: [...categories.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      // Best to worst, not by count. The scale has an order and a filter that
      // reordered it by popularity would read as arbitrary.
      conditions: CONDITIONS.filter((condition) => conditions.has(condition)).map((condition) => ({
        value: condition,
        count: conditions.get(condition) ?? 0,
      })),
      sizes: [...sizes.entries()]
        .map(([value, entry]) => ({ value, label: entry.label, count: entry.count }))
        .sort((a, b) => sizeSortIndex(a.value) - sizeSortIndex(b.value)),
      genders: GENDERS.filter((gender) => genders.has(gender)).map((gender) => ({
        value: gender,
        count: genders.get(gender) ?? 0,
      })),
      materials: [...materials.entries()]
        .map(([value, count]) => ({ value, label: materialLabel(value), count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
      priceRangeInr:
        prices.length === 0
          ? { min: 0, max: 0 }
          : { min: Math.min(...prices), max: Math.max(...prices) },
    }
  },

  async listFeaturedProducts(limit = 6): Promise<readonly ProductSummary[]> {
    const byId = new Map(products.map((product) => [product.id, product]))
    return EDITORIAL_ORDER.map((id) => byId.get(id))
      .filter((product): product is Product => product !== undefined)
      .slice(0, limit)
      .map(toSummary)
  },

  async listRelatedProducts(productId: ProductId, limit = 6): Promise<readonly ProductSummary[]> {
    const subject = products.find((product) => product.id === productId)
    if (subject === undefined) return []

    const candidates = products.filter(
      (product) => product.id !== productId && product.availability === 'available',
    )

    // Different category first, so the row reads as an outfit rather than as
    // five more of the thing the shopper is already looking at. Within each
    // group, newest first — the same recency logic the rest of the site uses.
    const ordered = [...candidates].sort((a, b) => {
      const differs = (product: Product) => (product.category === subject.category ? 1 : 0)
      const byCategory = differs(a) - differs(b)
      if (byCategory !== 0) return byCategory
      return Date.parse(b.listedAt) - Date.parse(a.listedAt)
    })

    return ordered.slice(0, limit).map(toSummary)
  },

  async getPassport(id: PassportId): Promise<Passport | null> {
    return passports.find((passport) => passport.id === id) ?? null
  },

  async getPassportByProduct(productId: ProductId): Promise<Passport | null> {
    return passports.find((passport) => passport.productId === productId) ?? null
  },

  async getSeller(idOrHandle: SellerId | string): Promise<Seller | null> {
    return sellers.find((s) => s.id === idOrHandle || s.handle === idOrHandle) ?? null
  },

  async listPreLovedAlternatives(
    productId: ProductId,
    limit = 4,
  ): Promise<readonly ProductSummary[]> {
    const subject = products.find((product) => product.id === productId)
    if (subject === undefined) return []

    return (
      products
        .filter(
          (product) =>
            product.id !== productId &&
            product.listingType === 'pre_loved' &&
            product.availability === 'available' &&
            product.category === subject.category &&
            // Strictly cheaper. See the contract note — an "alternative" that
            // costs more is an upsell.
            product.priceInr < subject.priceInr,
        )
        // Cheapest first: the saving is the reason this row exists, so lead with
        // the biggest one rather than with whatever is newest.
        .sort((a, b) => a.priceInr - b.priceInr)
        .slice(0, limit)
        .map(toSummary)
    )
  },

  // ---- account, purchases and resale

  async getAccount(): Promise<Account> {
    return account
  },

  async listResaleShots(): Promise<readonly ResaleShot[]> {
    return RESALE_SHOTS
  },

  async listOrders(): Promise<readonly Order[]> {
    // Newest first. A purchase history read in any other order is a filing
    // cabinet rather than a page.
    return [...orders].sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
  },

  async getOrderLine(orderLineId: OrderLineId) {
    for (const order of orders) {
      const line = order.lines.find((candidate) => candidate.id === orderLineId)
      if (line !== undefined) return { order, line }
    }
    return null
  },

  async assessResale(input: {
    orderLineId: OrderLineId
    shotIds: readonly string[]
    declaredFlaws?: readonly string[]
    hasCustomisations?: boolean
  }): Promise<ResaleAssessment> {
    const found = await mockAdapter.getOrderLine(input.orderLineId)
    if (found === null) {
      throw new DataError('not_found', `No order line ${input.orderLineId}`)
    }
    return assess({
      order: found.order,
      line: found.line,
      shotIds: input.shotIds,
      declaredFlaws: input.declaredFlaws,
      hasCustomisations: input.hasCustomisations,
    })
  },

  async createResaleRequest(input: {
    orderLineId: OrderLineId
    askingInr: number
    assessment: ResaleAssessment
  }): Promise<ResaleRequest> {
    const found = await mockAdapter.getOrderLine(input.orderLineId)
    if (found === null) {
      throw new DataError('not_found', `No order line ${input.orderLineId}`)
    }
    // A garment we could not identify must not become a listing. This is the
    // one place the verification verdict is load-bearing rather than
    // informational — see the note in `lib/data/resale`.
    if (input.assessment.verification === 'no_match') {
      throw new DataError('unavailable', 'Cannot list a garment we could not verify')
    }

    return {
      id: `rsl_${found.line.id}`,
      orderLineId: input.orderLineId,
      productId: found.line.product.id,
      createdAt: new Date().toISOString(),
      askingInr: input.askingInr,
      assessment: input.assessment,
      status: 'submitted',
    }
  },

  async resolveCart(items: readonly CartItemRef[]): Promise<Cart> {
    const byId = new Map(products.map((product) => [product.id, product]))

    const lines: CartLine[] = items
      .map((item) => {
        const product = byId.get(item.productId)
        // A garment that no longer exists at all is dropped rather than shown as
        // an error. Delisted is different from sold, and there is nothing for a
        // shopper to do about it.
        if (product === undefined) return null

        // Resolve the stored choice against live stock rather than trusting it.
        const variant =
          item.colorSlug === undefined || item.colorSlug === null
            ? null
            : (product.colorVariants.find((candidate) => candidate.color.slug === item.colorSlug) ??
              null)

        const size =
          item.sizeNormalized === undefined || item.sizeNormalized === null
            ? null
            : (variant?.sizes.find((candidate) => candidate.normalized === item.sizeNormalized) ??
              null)

        return {
          // The line id includes the variant, so two colourways of one style are
          // two lines rather than one that overwrites the other.
          id: `crl_${product.id}${item.colorSlug != null ? `_${item.colorSlug}` : ''}${
            item.sizeNormalized != null ? `_${item.sizeNormalized}` : ''
          }`,
          product: toSummary(product),
          // A colourway may be priced differently from the style.
          priceAtAddInr: variant?.priceInr ?? product.priceInr,
          addedAt: item.addedAt,
          // A chosen colourway that has since sold out makes the line stale,
          // even though the style itself is still available.
          status:
            variant !== null && variant.availability !== 'available'
              ? statusFor(variant.availability)
              : statusFor(product.availability),
          selection:
            variant === null
              ? null
              : { colorName: variant.color.name, sizeLabel: size?.label ?? '—' },
        }
      })
      .filter((line): line is CartLine => line !== null)
      // Newest first. A shopper who just added something expects to see it.
      .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))

    return {
      id: MOCK_CART_ID,
      lines,
      totals: totals(lines),
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    }
  },
}
