import type {
  CurrencyCode,
  ImageId,
  IsoDateTime,
  Paise,
  PassportId,
  ProductId,
  SellerId,
} from './common'

/**
 * The five-level condition scale.
 *
 * Ordered best to worst. Each level has a short public-facing definition in
 * `content/product.ts` — the enum value is never shown to a shopper directly.
 *
 * Five levels rather than a 1–10 score on purpose: a shopper can hold five
 * categories in their head, and a resale grade is a judgement, not a
 * measurement. A 7-versus-8 distinction implies a precision that a human
 * inspecting a garment cannot actually deliver.
 *
 * (The PRD defers AI condition scoring to Phase 2. When it arrives it should
 * map onto these five, not replace them — the shopper-facing vocabulary should
 * not change because the grading method did.)
 */
export const CONDITIONS = ['pristine', 'excellent', 'very_good', 'good', 'well_loved'] as const

export type Condition = (typeof CONDITIONS)[number]

/** Position of a condition on the scale. `pristine` is 1. */
export function conditionRank(condition: Condition): number {
  return CONDITIONS.indexOf(condition) + 1
}

/** A documented imperfection. Absence of flaws is meaningful; an empty array is a claim. */
export type Flaw = {
  /** Plain language, specific. "Two small pulls on the left cuff", not "minor damage". */
  description: string
  /** The image in `Product.images` that shows this flaw. `kind` there is `'flaw'`. */
  imageId: ImageId
  /** Where on the garment, in garment terms. "Left cuff", "inner hem", "back yoke". */
  location: string
}

export type SizeSystem = 'IN' | 'UK' | 'EU' | 'US'

/**
 * What the label says, plus a system-independent handle.
 *
 * `label` is transcribed from the garment and never inferred — a garment
 * labelled `M` is stored as `M`. `normalized` is the comparison key used for
 * filtering and cross-system conversion; see `lib/format/size`.
 */
export type Size = {
  label: string
  system: SizeSystem
  /** Canonical handle, e.g. `xs`, `s`, `m`, `l`, `xl`, `w28`, `eu38`. */
  normalized: string
}

/**
 * Garment measurements in **centimetres**, taken flat.
 *
 * Deliberately a partial record rather than a fixed shape: a shirt has a
 * shoulder, a skirt does not, and forcing every key onto every garment produces
 * either lies or zeroes. Render only the keys present.
 */
export const MEASUREMENT_KEYS = [
  'chest',
  'waist',
  'hip',
  'shoulder',
  'sleeveLength',
  'length',
  'inseam',
  'rise',
  'thigh',
  'hem',
  'neck',
  'cuff',
] as const

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number]

export type Measurements = Partial<Record<MeasurementKey, number>>

/**
 * Single-unit availability. There is no quantity anywhere in this contract —
 * every garment is one-of-one, so a cart line cannot have a count and a
 * "2 left in stock" state does not exist.
 *
 * `reserved` means in someone's cart or mid-checkout. It is a real state a
 * shopper can see, and it is the reason the PDP needs an urgency treatment that
 * is honest rather than manufactured.
 */
export type Availability = 'available' | 'reserved' | 'sold'

export type ProductImageKind = 'primary' | 'detail' | 'flaw' | 'label' | 'worn'

export type ProductImage = {
  id: ImageId
  url: string
  /** Required. Describes the garment, not the photograph. */
  alt: string
  kind: ProductImageKind
  /** width / height. Lets the grid reserve space before load. */
  aspectRatio: number
}

/**
 * Who a garment is cut for.
 *
 * This closes a gap that has been flagged since the first build: `/shop/women`
 * and `/shop/men` are in the primary nav and were 404ing, because gender was a
 * segment the contract had no field for. It is also what the size guide needs to
 * stop falling back to one chart for every garment.
 *
 * `unisex` is a real answer, not a default for missing data — a trucker jacket
 * cut straight is genuinely unisex, and forcing it into one of the other two
 * would put it in the wrong listing half the time. Anything genuinely unknown
 * should be fixed at intake rather than parked here.
 */
export const GENDERS = ['women', 'men', 'unisex'] as const

export type Gender = (typeof GENDERS)[number]

/**
 * Garment type — the shopper-facing "is it a jacket, a shirt, legs".
 *
 * A runtime list as well as a type, because the URL parser has to validate
 * `?type=` against it: an unrecognised value has to be dropped rather than
 * passed to the adapter.
 */
export const PRODUCT_CATEGORIES = [
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'knitwear',
  'ethnicwear',
  'suiting',
  'accessories',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/**
 * What kind of stock a listing is.
 *
 * `pre_loved` is the original business: one physical second-hand garment, graded
 * and passported, with no quantity and no variants. `new` is first-party retail
 * stock, which behaves like a conventional product — several colourways, several
 * sizes, replaceable inventory — and which has no condition grade because
 * "condition" is a judgement about wear and there is none to judge.
 *
 * **This is the discriminator for everything the UI is allowed to claim.** A
 * condition grade on new stock is a meaningless badge; a colour picker on a
 * pre-loved garment is a promise the inventory cannot keep. Both are guarded on
 * this field, so read it before rendering either.
 */
export const LISTING_TYPES = ['new', 'pre_loved'] as const

export type ListingType = (typeof LISTING_TYPES)[number]

/**
 * A colour, as a shopper picks it.
 *
 * `hex` is a single flat swatch fill and is an approximation by definition — a
 * mid-wash denim is a hundred colours and a 4mm circle is one. It is a
 * navigation aid, never the basis of a purchase decision, which is why the name
 * is always rendered beside the swatch rather than the swatch standing alone.
 */
export type ProductColor = {
  /** Canonical handle, for URLs and filters. e.g. `mid-indigo`. */
  slug: string
  /** Shopper-facing name. e.g. "Mid indigo". */
  name: string
  /** Swatch fill, `#rrggbb`. An approximation — see above. */
  hex: string
}

/**
 * One colourway of a `new` product.
 *
 * Only new stock has these. A pre-loved garment is one physical object in one
 * colour, so its `colorVariants` is empty and its colour is `Product.color`.
 *
 * Sizes are per colourway rather than per product because they genuinely differ
 * — a colour sells out of M before it sells out of XL, and a size list that
 * ignores the selected colour offers sizes that cannot be bought.
 */
export type ColorVariant = {
  color: ProductColor
  /** Sizes with stock in this colour. Empty means this colourway is sold out. */
  sizes: readonly Size[]
  availability: Availability
  /** Set only when this colourway is priced differently. Null means use the product price. */
  priceInr: Paise | null
  /** Colour-specific imagery. Empty falls back to `Product.images`. */
  images: readonly ProductImage[]
}

export type Product = {
  // identity
  id: ProductId
  slug: string
  /** Vaapsi's own stock number. One per physical garment, never per style. */
  sku: string
  title: string
  brand: string
  category: ProductCategory
  subcategory: string
  /** New retail stock or a second-hand garment. Gates condition and colourways. */
  listingType: ListingType
  /** Who it is cut for. Drives `/shop/women` and `/shop/men`. */
  gender: Gender

  /** The garment's own colour. Always present — every card shows it. */
  color: ProductColor
  /**
   * Fibre composition, as it appears on the care label. "100% cotton",
   * "98% cotton, 2% elastane".
   *
   * A plain string rather than a parsed structure, and separate from
   * `Passport.materials`, which is deliberate. The passport version is
   * `Sourced<T>` — every fibre carries where the claim came from — because that
   * is a provenance record making a verifiable claim. This is the label
   * transcription, present on every garment including new stock that has no
   * passport, and it is what a grid card shows. Do not derive one from the
   * other: the passport may know more than the label says, and the label is
   * what the garment actually claims.
   */
  composition: string
  /**
   * Selectable colourways. **Non-empty only when `listingType` is `new`.**
   * Pre-loved garments are one-of-one and carry an empty array.
   */
  colorVariants: readonly ColorVariant[]

  // resale specifics
  /**
   * **Null for `new` stock, and never null for `pre_loved`.** Nullable rather
   * than defaulted: a placeholder grade on unworn stock is a claim about wear
   * that nobody made, and the compiler forcing a null check at every read is
   * the point.
   */
  condition: Condition | null
  /** Free text from the inspector. Sits next to the grade and qualifies it. Null with `condition`. */
  conditionNotes: string | null
  flaws: readonly Flaw[]
  measurements: Measurements
  size: Size

  // commerce
  /** Integer paise. See `Paise`. */
  priceInr: Paise
  /** What it cost new, in paise. Null when unknown — do not guess to show a discount. */
  originalRetailInr: Paise | null
  currency: CurrencyCode
  availability: Availability

  // media — ordered, first `primary` is the card image
  images: readonly ProductImage[]

  // relations
  /** Null for garments not yet passported. The UI must handle this, not assume it. */
  passportId: PassportId | null
  sellerId: SellerId

  listedAt: IsoDateTime
}

/** The subset a grid card needs. Lets the list endpoint stay cheap. */
export type ProductSummary = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'title'
  | 'brand'
  | 'category'
  | 'subcategory'
  | 'listingType'
  | 'gender'
  | 'condition'
  | 'color'
  | 'composition'
  /**
   * Carried on the summary because grid cards take the colour and size choice
   * inline now — a card that had to fetch the product to know its colourways
   * would either block the grid or make the choice a trip to another page.
   */
  | 'colorVariants'
  | 'size'
  | 'priceInr'
  | 'originalRetailInr'
  | 'currency'
  | 'availability'
  | 'passportId'
> & { primaryImage: ProductImage }
