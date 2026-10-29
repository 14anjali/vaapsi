import type {
  Account,
  Gender,
  ListingType,
  Order,
  OrderLine,
  OrderLineId,
  ResaleAssessment,
  ResaleRequest,
  ResaleShot,
  Cart,
  Page,
  Passport,
  PassportId,
  Product,
  ProductCategory,
  ProductId,
  ProductSummary,
  Seller,
  SellerId,
  Condition,
} from '@/lib/types'

/**
 * The integration seam.
 *
 * This is the whole surface the storefront uses to reach data. Swapping the
 * mock implementation for TanStack Query against real endpoints means writing
 * one more object that satisfies this interface and changing which one
 * `lib/data/index.ts` exports. Nothing else in the app moves.
 *
 * Every method is async even where the mock answers instantly, so no call site
 * needs to change when a real network hop appears behind it.
 */

/**
 * `popular` is curated rather than measured while there is no order history —
 * see the mock adapter. Named `popular` and not `best_selling` on purpose: the
 * second is a factual claim about sales volume.
 */
export type ProductSort =
  'relevance' | 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'alphabetical'

/**
 * PLP filters. All optional; omitting one means "do not filter on this".
 *
 * Prices are in **paise**, matching the contract. Passing rupees here is the
 * single most likely integration mistake, which is why the field names carry
 * the `Inr` suffix that the rest of the contract uses for paise.
 */
export type ProductFilters = {
  /** A single category, from the `/shop/[category]` route. Wins over `categories`. */
  category?: ProductCategory
  /** Several types, from the filter panel. Ignored when `category` is set. */
  categories?: readonly ProductCategory[]
  /**
   * `new` for the New listing, `pre_loved` for the marketplace. The two halves
   * of the catalogue are browsed separately: they answer different questions and
   * carry different filters, and a shopper looking at new stock is not choosing
   * between it and something second-hand.
   */
  listingType?: ListingType
  /** Who the garment is cut for. `unisex` pieces answer to every value. */
  genders?: readonly Gender[]
  /**
   * Dominant fibre, lower-cased — `cotton`, `linen`. Matched against the
   * composition label rather than a separate field, so it cannot drift from what
   * the garment says it is made of. See `primaryMaterial`.
   */
  materials?: readonly string[]
  brands?: readonly string[]
  conditions?: readonly Condition[]
  /** `Size.normalized` values, not printed labels. */
  sizes?: readonly string[]
  minPriceInr?: number
  maxPriceInr?: number
  /** True to show only garments that have a passport. */
  hasPassport?: boolean
  /** Free-text query across title, brand and subcategory. */
  query?: string
}

export type ListProductsInput = {
  filters?: ProductFilters
  sort?: ProductSort
  /** Opaque cursor from a previous page. */
  cursor?: string | null
  limit?: number
}

/**
 * Facets for the filter panel, computed against the *unfiltered* set so counts
 * do not collapse to zero as a shopper narrows down.
 */
export type ProductFacets = {
  brands: readonly { value: string; count: number }[]
  categories: readonly { value: ProductCategory; count: number }[]
  conditions: readonly { value: Condition; count: number }[]
  sizes: readonly { value: string; label: string; count: number }[]
  genders: readonly { value: Gender; count: number }[]
  /** Dominant fibre. `value` is the handle, `label` is what a shopper reads. */
  materials: readonly { value: string; label: string; count: number }[]
  priceRangeInr: { min: number; max: number }
}

export interface DataAdapter {
  // ---- catalogue
  listProducts(input?: ListProductsInput): Promise<Page<ProductSummary>>
  getProduct(idOrSlug: ProductId | string): Promise<Product | null>
  /**
   * Facet counts for the filter panel.
   *
   * **Scoped to a listing type**, because the two halves of the catalogue are
   * browsed separately. Facets computed across everything would offer the New
   * listing a condition grade nothing in it has, and would put counts on sizes
   * that only exist second-hand. Omitting the argument counts the whole
   * catalogue, which is what an internal or admin view wants.
   */
  getProductFacets(listingType?: ListingType): Promise<ProductFacets>
  /**
   * Editorial selection for the home page. Curated, not algorithmic — Phase 1
   * excludes recommendations, and a home page that pretends to personalise
   * without the data behind it is worse than one that does not try.
   */
  listFeaturedProducts(limit?: number): Promise<readonly ProductSummary[]>

  /**
   * Pieces that go with this one.
   *
   * **Not personalisation, and not machine learning.** Phase 1 excludes AI
   * recommendations, and a storefront that implies personalisation it does not
   * have is making a promise the backend cannot keep. What this is: a stated
   * heuristic — other available pieces, favouring different categories so the
   * set reads as an outfit rather than as near-duplicates of what the shopper is
   * already looking at.
   *
   * When a real recommender exists it replaces the body of this method and
   * nothing above it changes. Until then the honest framing is in the copy:
   * "goes with", not "recommended for you".
   */
  listRelatedProducts(productId: ProductId, limit?: number): Promise<readonly ProductSummary[]>

  /**
   * The same kind of garment, second-hand and cheaper.
   *
   * A cross-sell that runs the opposite way to a normal one: it moves a shopper
   * *down* in price, from new stock to a one-of-one piece someone already wore.
   * That is the business — a garment kept in use is the point — and it is also
   * the honest thing to surface next to a new jean when a used one at half the
   * price is sitting in the same catalogue.
   *
   * Rules, so this cannot become a generic recommender: same category, pre-loved
   * only, available only, and **strictly cheaper than the garment being viewed**.
   * A pre-loved piece that costs more is not an alternative, it is an upsell
   * wearing the word "alternative".
   */
  listPreLovedAlternatives(productId: ProductId, limit?: number): Promise<readonly ProductSummary[]>

  // ---- passport
  getPassport(id: PassportId): Promise<Passport | null>
  getPassportByProduct(productId: ProductId): Promise<Passport | null>

  // ---- seller
  getSeller(idOrHandle: SellerId | string): Promise<Seller | null>

  // ---- cart
  /**
   * Resolve a set of remembered garments into a priced, availability-checked
   * cart.
   *
   * The client stores **only** product IDs and when they were added. It never
   * caches a price or an availability state, because a cart that remembers a
   * price is a cart that lies after a repricing, and one that remembers
   * availability is a cart that sells a garment twice.
   *
   * So the shape here is deliberately a *resolve*, not a read-write cart: the
   * client owns membership, the adapter owns truth. Every totals figure is
   * computed here rather than in the browser, because GST treatment on a C2C
   * resale is unresolved (PRD Q6) and guessing at it client-side would be wrong
   * in a way nobody notices until an invoice is read.
   */
  resolveCart(items: readonly CartItemRef[]): Promise<Cart>

  // ---- account, purchases and resale
  /**
   * The signed-in shopper.
   *
   * No auth exists in this repo, so the mock returns a fixture account. When
   * real auth lands this takes a session rather than nothing, and no caller
   * changes — see `docs/integration.md`.
   */
  getAccount(): Promise<Account>

  /** Past purchases, newest first. The only legitimate way into a listing. */
  listOrders(): Promise<readonly Order[]>

  /**
   * The frames a seller is asked for, and why each one is wanted.
   *
   * Behind the adapter rather than imported as a constant because it is a brief
   * the studio owns, not a UI detail: which shots make a garment gradeable is an
   * operations decision, and it will change when intake does.
   */
  listResaleShots(): Promise<readonly ResaleShot[]>

  getOrderLine(orderLineId: OrderLineId): Promise<{ order: Order; line: OrderLine } | null>

  /**
   * Read a set of uploaded frames and return provenance, condition and a price.
   *
   * ⚠️ **There is no model behind this.** The mock derives a deterministic
   * result from the order line — age, material, declared flaws, customisations
   * — so the flow, the arithmetic and the copy can all be exercised. It is a
   * demonstration of the mechanism and the UI says so on the page.
   *
   * When a real assessment service exists it replaces this method and nothing
   * above it moves. The important part of the contract is the *shape*: a
   * verification verdict, per-flaw deductions that can each be shown next to
   * the thing they deduct for, and a list of price factors rather than one
   * opaque number.
   */
  assessResale(input: {
    orderLineId: OrderLineId
    /** Which prescribed shots the seller supplied. */
    shotIds: readonly string[]
    /** Flaws the seller declared before we looked. */
    declaredFlaws?: readonly string[]
    /** True when the seller says they had work done to it. */
    hasCustomisations?: boolean
  }): Promise<ResaleAssessment>

  /** Submit a listing request. The studio still has to receive the garment. */
  createResaleRequest(input: {
    orderLineId: OrderLineId
    askingInr: number
    assessment: ResaleAssessment
  }): Promise<ResaleRequest>
}

/**
 * What the persisted client store holds per line.
 *
 * Still deliberately thin: no price, no availability, no title. Those are
 * resolved fresh on every read, which is why a garment that sells while it sits
 * in a bag is handled honestly instead of discovered at checkout.
 *
 * **The variant fields are the exception, and they are a choice, not a
 * snapshot.** `colorSlug` and `sizeNormalized` record what the shopper picked.
 * They have to persist, because there is nothing on the server to re-derive them
 * from — a product with four colourways has no "the" colour. They are null for a
 * pre-loved garment, which is one physical object with one colour and one size.
 */
export type CartItemRef = {
  productId: ProductId
  addedAt: string
  /** The chosen colourway. Null for one-of-one stock, which has no choice. */
  colorSlug?: string | null
  /** The chosen size, as `Size.normalized`. Null for one-of-one stock. */
  sizeNormalized?: string | null
}

/** Thrown when a mutation cannot proceed. Carries a code the UI can branch on. */
export class DataError extends Error {
  constructor(
    readonly code: 'not_found' | 'unavailable' | 'already_in_cart',
    message: string,
  ) {
    super(message)
    this.name = 'DataError'
  }
}
