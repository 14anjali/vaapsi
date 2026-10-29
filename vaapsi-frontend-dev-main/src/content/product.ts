import type { Condition } from '@/lib/types'

/**
 * Product and condition copy.
 *
 * The condition definitions are the most load-bearing copy in the product.
 * A resale grade is a promise, and a shopper who feels the promise was
 * generous does not come back. They are written to describe wear plainly rather
 * than to flatter it — `well_loved` says "visible", not "characterful", because
 * the photograph is going to say "visible" either way.
 *
 * ⚠️ NEEDS CLIENT SIGN-OFF. The five levels and their wording are a proposal,
 * not a decision. Kanu owns the grading promise; the operations team has to be
 * able to apply it consistently at intake.
 */

export const conditionCopy: Record<
  Condition,
  { label: string; short: string; definition: string }
> = {
  pristine: {
    label: 'Pristine',
    short: 'Never worn',
    definition: 'Never worn. Original tags may still be attached. Indistinguishable from new.',
  },
  excellent: {
    label: 'Excellent',
    short: 'Worn a handful of times',
    definition: 'Worn a handful of times and looked after. No wear you would notice on or off.',
  },
  very_good: {
    label: 'Very good',
    short: 'Gently worn',
    definition:
      'Gently worn. Minor signs of use on close inspection, nothing visible when worn. Any marks are photographed.',
  },
  good: {
    label: 'Good',
    short: 'Visibly worn',
    definition:
      'Properly worn in. Visible signs of use — fading, softening, small marks — all documented and photographed below.',
  },
  well_loved: {
    label: 'Well loved',
    short: 'Worn, mended, priced for it',
    definition:
      'Significant wear, and often a repair. Structurally sound and priced accordingly. Every flaw is photographed. Buy this one because you like it, not because it is cheap.',
  },
}

/**
 * The colour picker's copy. Lives here rather than in the component so the
 * "sold out" phrasing can be changed without touching the picker's logic.
 */
export const colorPickerCopy = {
  label: 'Colour',
  sizeLabel: 'Size',
  sizeUnchosen: 'Choose a size',
  /** Spoken name for a swatch that cannot be picked. */
  soldOutOption: (name: string) => `${name} — sold out`,
  colorSoldOut: 'This colour is sold out. Pick another to see its sizes.',
  pricedDifferently: (price: string) => `This colour is ${price}.`,
} as const

/**
 * Card copy.
 *
 * The card shows the garment's name, what it is, size, colour and price, and —
 * on pre-loved only — a condition grade. The brand is not on the card: every
 * listing is Vaapsi, so it distinguished nothing and read as a repeated label.
 */
export const productCard = {
  /**
   * The card's link is a stretched overlay with no visible text of its own, so
   * it needs a spoken name. Built from the facts a shopper is choosing between.
   */
  linkLabel: (parts: { name: string; garment: string; size: string; color: string }): string =>
    `${parts.name}, ${parts.garment}, size ${parts.size}, ${parts.color}`,
  /** Screen-reader prefixes, so three bare values are not read as one string. */
  sizeLabel: 'Size',
  colorLabel: 'Colour',
  /**
   * The card's own add button, and the two states before it can be used.
   *
   * The two "pick…" strings sit on the button itself rather than beside it. A
   * greyed-out "Add to cart" says only that something is wrong; this says what.
   */
  addToCart: 'Add to cart',
  pickColorFirst: 'Pick a colour',
  pickSizeFirst: 'Pick a size',
  /** Names the inline controls for a screen reader, so they are not orphaned. */
  choiceGroup: (name: string) => `Choose a colour and size for ${name}`,
} as const

export const productPage = {
  colorPicker: colorPickerCopy,

  /**
   * Gallery copy.
   *
   * Every control here is named for what it does rather than which way it
   * points, so a screen-reader user hears "Previous photograph", not "left".
   */
  gallery: {
    label: 'Product photographs',
    thumbnails: 'Choose a photograph',
    previous: 'Previous photograph',
    next: 'Next photograph',
    frame: (n: number, total: number) => `Photograph ${n} of ${total}`,
    position: (n: number, total: number) => `${n} / ${total}`,
    save: 'Save to wishlist',
    saved: 'Saved to wishlist',
  },

  sections: {
    condition: 'Condition',
    conditionNote: 'Graded at intake. Every flaw below is photographed.',
    flaws: 'What to expect',
    measurements: 'Measurements',
    measurementsNote: 'Taken flat, in centimetres. Sizes vary by brand — go by these.',
    passport: 'History',
    seller: 'Listed by',
    care: 'Care',
    materials: 'Made of',
  },
  availability: {
    available: 'Available',
    reserved: 'Reserved — someone is checking out',
    sold: 'Sold',
  },
  oneOfOne: 'One of one. There is no second size, and no restock.',

  /**
   * Deliberately not "Recommended for you". There is no personalisation behind
   * it — it is a stated heuristic, and labelling a heuristic as a recommendation
   * is the kind of small overclaim this brand cannot afford when the rest of the
   * page is built on saying exactly how much we know.
   */
  goesWith: 'Goes with this',

  /**
   * The downward cross-sell. Phrased as an offer of a cheaper route, not as a
   * warning that the new one is expensive — and never "Save money", which makes
   * the brand sound like it is apologising for its own prices.
   */
  preLoved: {
    eyebrow: 'Also available pre-loved',
    lede: 'The same kind of piece, worn before, graded by hand and priced for it.',
    saving: (amount: string) => `${amount} less`,
    browseAll: 'Browse everything pre-loved',
  },

  noPassport:
    'This garment has no passport yet. What we know about it is what the seller told us and what we could see.',
  originalRetail: 'Originally',
  originalRetailUnknown: 'Original price not known',
} as const
