import type { ProductCategory } from '@/lib/types'

/**
 * ============================================================================
 * MAKE IT YOUR OWN
 * ============================================================================
 *
 * Small additions a shopper can have made to a garment before it ships: a patch,
 * hand embroidery, a charm, a set of initials.
 *
 * ## Why this belongs on a resale site specifically
 *
 * Customisation is usually a margin play. Here it does something structural: the
 * single biggest reason a garment leaves circulation is that its owner stopped
 * feeling attached to it. A piece someone has had their initials stitched into
 * is a piece they keep — and on the resale side, a modification is *provenance*,
 * not damage. It goes on the passport as a `customised` event beside the repairs,
 * so the next owner reads it as part of the garment's history rather than
 * discovering an unexplained patch.
 *
 * That is also why the copy never says "personalise" — it says "make it your
 * own", because the claim is about attachment, not monogramming.
 *
 * ## Four consequences, all stated before anyone commits
 *
 * A customiser that hides its trade-offs is how a shopper ends up with a parcel
 * that arrived late and cannot be sent back. So every one of these is on the
 * page, next to the choice, not in a policy link:
 *
 * 1. **It costs more.** Per addition, shown as it accumulates.
 * 2. **It ships later.** Each addition has a lead time and the longest one wins
 *    (the work is done in one pass, not queued serially).
 * 3. **It cannot be returned.** Hand work on a specific garment cannot be
 *    undone. This is the one that must never be soft-pedalled.
 * 4. **It is permanent on the record.** The passport gains an event, and that
 *    event stays with the garment through every later owner.
 *
 * ## One addition per placement
 *
 * A real physical constraint, so the UI enforces it rather than letting someone
 * order two patches sewn on top of each other. It also keeps the whole thing
 * legible: the state of a customisation is a short list of place → thing.
 *
 * ⚠️ **NEEDS SIGN-OFF.** Prices, lead times and the artisan attributions are
 * placeholders. The returns position in particular has to be agreed with
 * whoever owns policy (PRD open question #7) — "non-returnable" is a
 * commitment, and this component states it as one.
 */

export type Trinket = {
  id: string
  label: string
  /** What it is, in a sentence. Plain, and specific about the technique. */
  description: string
  /** Integer paise, like every other price in this codebase. */
  priceInr: number
  /** Working days added to dispatch. The longest addition sets the delay. */
  leadDays: number
  /** Who does the work. Attribution is part of the point. */
  by: string
}

export const trinkets: readonly Trinket[] = [
  {
    id: 'sashiko',
    label: 'Sashiko stitching',
    description:
      'Running-stitch panel worked by hand in cotton thread. The same technique used to mend denim, applied because you want it rather than because something tore.',
    priceInr: 90_000,
    leadDays: 6,
    by: 'Our studio, Delhi',
  },
  {
    id: 'initials',
    label: 'Your initials',
    description:
      'Up to three letters, chain-stitched. Small, and inside the placket unless you ask for it somewhere you can see.',
    priceInr: 45_000,
    leadDays: 3,
    by: 'Our studio, Delhi',
  },
  {
    id: 'patch',
    label: 'Woven patch',
    description:
      'A patch cut from offcuts of other Vaapsi denim and sewn down. No two are the same colour, because no two offcuts are.',
    priceInr: 35_000,
    leadDays: 2,
    by: 'Our studio, Delhi',
  },
  {
    id: 'charm',
    label: 'Brass charm',
    description:
      'A small cast-brass charm on a split ring, fixed to a belt loop or a zip pull. The one addition here that can be taken off again.',
    priceInr: 28_000,
    leadDays: 1,
    by: 'Metalwork by a workshop in Moradabad',
  },
  {
    id: 'embroidery',
    label: 'Hand embroidery',
    description:
      'A motif worked in silk thread, drawn from a set of six. The slowest thing we do, and the one people send photographs of afterwards.',
    priceInr: 165_000,
    leadDays: 11,
    by: 'Embroiderers in Lucknow',
  },
]

export type Placement = {
  id: string
  label: string
  /** Which garments actually have this part. See `placementsFor`. */
  categories: readonly ProductCategory[]
}

/**
 * Where an addition can go.
 *
 * Scoped by category, because offering "back yoke" on a shoulder bag is the kind
 * of detail that makes a configurator feel generated rather than made.
 */
export const placements: readonly Placement[] = [
  { id: 'chest', label: 'Left chest', categories: ['tops', 'outerwear', 'dresses', 'suiting'] },
  { id: 'back-yoke', label: 'Back yoke', categories: ['outerwear', 'tops', 'suiting'] },
  { id: 'sleeve', label: 'Right sleeve', categories: ['outerwear', 'tops', 'dresses', 'suiting'] },
  { id: 'cuff', label: 'Inside cuff', categories: ['outerwear', 'tops', 'suiting'] },
  { id: 'hip', label: 'Left hip', categories: ['bottoms', 'dresses'] },
  { id: 'back-pocket', label: 'Back pocket', categories: ['bottoms'] },
  { id: 'hem', label: 'Hem', categories: ['bottoms', 'dresses', 'knitwear', 'ethnicwear'] },
  { id: 'waistband', label: 'Inside waistband', categories: ['bottoms'] },
  { id: 'strap', label: 'Strap', categories: ['accessories'] },
  {
    id: 'front-panel',
    label: 'Front panel',
    categories: ['accessories', 'knitwear', 'ethnicwear'],
  },
]

export function placementsFor(category: ProductCategory): readonly Placement[] {
  return placements.filter((placement) => placement.categories.includes(category))
}

export const customise = {
  eyebrow: 'Make it your own',
  title: 'Add something to it',
  standfirst:
    'A patch, a set of initials, a panel of hand stitching. Done in our studio before it ships, and written into the garment’s record so the next owner knows it was meant.',

  /** The trigger on the product page. */
  trigger: 'Make it your own',
  triggerNote: 'Add a patch, initials or hand stitching',

  chooseTrinket: 'What to add',
  choosePlacement: 'Where it goes',
  placementTaken: 'Already used',
  /** Spoken label for a placement that is occupied. */
  placementTakenOption: (place: string, thing: string) => `${place} — already has ${thing}`,

  added: 'On this garment',
  addAction: 'Add to the garment',
  removeAction: (thing: string, place: string) => `Remove ${thing} from ${place}`,
  empty: 'Nothing added yet.',
  emptyHelp: 'Pick something above, then choose where it goes.',

  /** The running consequences. All four, always visible once anything is added. */
  consequences: {
    heading: 'What this changes',
    cost: (amount: string) => `Adds ${amount} to the price.`,
    lead: (days: number) =>
      `Ships about ${days} working ${days === 1 ? 'day' : 'days'} later — the work is done in one pass, so the slowest addition sets the date.`,
    /**
     * Stated flatly and never softened. A shopper who finds this out after
     * delivery has a legitimate complaint, and no amount of good copy fixes it
     * retroactively.
     */
    returns: 'Cannot be returned or exchanged. Hand work on one specific garment cannot be undone.',
    passport: 'Recorded on the garment’s passport, permanently, as part of its history.',
  },

  /** Shown where the garment has no passport yet. */
  noPassportNote:
    'This garment has no passport yet. The addition is still recorded, and appears once one is issued.',

  totalLabel: 'Additions',
  isProvisional: true,
  provisionalNote: 'Prices and lead times are provisional.',
} as const
