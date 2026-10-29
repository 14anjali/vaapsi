import type { IsoDateTime, Paise, ProductId } from './common'
import type { Condition, ProductSummary, Size } from './product'

/**
 * ============================================================================
 * ACCOUNT, PURCHASES AND RESALE
 * ============================================================================
 *
 * ## Why purchases are the spine
 *
 * Resale here is **gated on provenance**: you can only list something you
 * bought from Vaapsi. That single rule decides the whole shape of this file.
 *
 * An order line is therefore not a receipt — it is the *only* legitimate entry
 * point into a listing. There is no "create a listing" form anywhere, because
 * one would immediately need to ask a stranger to prove where a garment came
 * from, and no amount of form design solves that. Starting from the order means
 * we already know the garment, its passport, what was paid, when, and in which
 * colour and size, so the seller confirms facts rather than typing them.
 *
 * ## Why there is no auth
 *
 * The verification step *is* the authorisation. A seller photographs the tag and
 * the garment; if the tag reads Vaapsi and the piece matches the order they
 * picked, that is a stronger claim than a password — a password proves who is
 * typing, not what they are holding.
 *
 * The demo therefore runs on a fixture account. See `docs/integration.md`:
 * real auth is the stack's, not this repo's, and when it lands the only change
 * here is where `getAccount()` gets its id.
 */

export type OrderId = string
export type OrderLineId = string
export type ResaleRequestId = string

/**
 * One garment in one order.
 *
 * Carries what was actually bought — the variant, the price paid, the size — so
 * a resale listing can be built from it without asking the seller to remember.
 * `pricePaidInr` is history and must never be recomputed from the live price:
 * the depreciation the resale quote is based on is measured against what this
 * person paid, not against what the piece costs today.
 */
export type OrderLine = {
  id: OrderLineId
  product: ProductSummary
  /** What was chosen at checkout. Null for one-of-one pre-loved stock. */
  selection: { colorName: string; sizeLabel: string } | null
  size: Size
  /** Integer paise, as paid. Historical — never refreshed. */
  pricePaidInr: Paise
  /**
   * Set once this line has been sent back for resale, so the UI can show its
   * state instead of offering to sell it twice.
   */
  resaleRequestId: ResaleRequestId | null
}

export const ORDER_STATUSES = ['placed', 'dispatched', 'delivered', 'cancelled'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type Order = {
  id: OrderId
  /** Shopper-facing reference. Shown, searched, quoted in support. */
  reference: string
  placedAt: IsoDateTime
  status: OrderStatus
  lines: readonly OrderLine[]
  totalPaidInr: Paise
  /** Where it went. Coarse only — the full address is the backend's. */
  deliveredTo: string
}

// ---------------------------------------------------------------------------
// Resale
// ---------------------------------------------------------------------------

/**
 * A photograph the seller is asked for, and why.
 *
 * Prescribed rather than "upload some pictures": each shot answers one question
 * the assessment has to answer, and asking for them by name is what makes an
 * automated read possible at all. The tag shot is the one that cannot be
 * skipped — it is the provenance claim.
 */
export type ResaleShot = {
  id: string
  label: string
  /** What the seller should frame. Plain instruction, not jargon. */
  instruction: string
  /** What this frame is *for*, shown so the ask does not feel arbitrary. */
  purpose: string
  required: boolean
}

/**
 * What the automated read concluded about one uploaded frame.
 *
 * `confidence` is 0–1 and is shown as a word, never as a percentage: a number
 * implies a precision this does not have, and "84% sure" invites an argument
 * about the 16%.
 */
export type ShotAssessment = {
  shotId: string
  confidence: number
  /** What it saw, in one line. */
  note: string
}

/** A mark the assessment found, whether or not the seller declared it. */
export type DetectedFlaw = {
  /** Plain language: "Fading at the left knee", not "wear detected". */
  description: string
  location: string
  /**
   * How much this knocks off, in paise. **Always shown next to the flaw.** A
   * deduction a seller discovers only in the final number reads as a trick.
   */
  deductionInr: Paise
  /** True when the seller declared it themselves before we found it. */
  declaredBySeller: boolean
}

/** One reason the quote is what it is. Shown as a list, not a black box. */
export type PriceFactor = {
  label: string
  /** Signed paise. Negative reduces, positive adds. */
  effectInr: Paise
  /** Why, in one sentence. */
  reason: string
}

export const VERIFICATION_RESULTS = ['match', 'uncertain', 'no_match'] as const

export type VerificationResult = (typeof VERIFICATION_RESULTS)[number]

/**
 * The whole automated read: is it ours, what state is it in, what is it worth.
 *
 * ⚠️ **Modelled, not implemented.** The shape is real and the UI is built
 * against it, but `assessResale` in the mock adapter returns a deterministic
 * result derived from the order — there is no model behind it. Every number
 * below is therefore a demonstration of the *mechanism*, and the UI says so
 * where a shopper could otherwise mistake it for a valuation.
 */
export type ResaleAssessment = {
  verification: VerificationResult
  /** Why we think it is or is not the garment they picked. */
  verificationNote: string
  shots: readonly ShotAssessment[]
  /** Our read of condition, which the seller can disagree with. */
  suggestedCondition: Condition
  conditionNote: string
  flaws: readonly DetectedFlaw[]
  /**
   * Customisations we recognised — embroidery, patches, a repair.
   *
   * These **add** value rather than deducting it, which is the opposite of how
   * resale usually treats a modification. On a marketplace that sells
   * customisation as a feature, penalising someone for having used it would be
   * incoherent, and the people who customise are the ones worth keeping.
   */
  customisations: readonly PriceFactor[]
  /** The quote. A range, because a single number invites haggling with us. */
  suggestedInr: { low: number; mid: number; high: number }
  factors: readonly PriceFactor[]
}

/**
 * What a seller submits. The listing request, not the listing — the studio still
 * has to receive the garment and grade it in person.
 */
export type ResaleRequest = {
  id: ResaleRequestId
  orderLineId: OrderLineId
  productId: ProductId
  createdAt: IsoDateTime
  /** What the seller asked for, which may differ from the quote. */
  askingInr: Paise
  assessment: ResaleAssessment
  status: 'submitted' | 'in_transit' | 'inspecting' | 'listed' | 'declined'
}

/** The demo account. See the note at the top of this file. */
export type Account = {
  name: string
  email: string
  phone: string
  addresses: readonly {
    id: string
    label: string
    line1: string
    line2: string | null
    city: string
    state: string
    pin: string
    isDefault: boolean
  }[]
  /** Never a real PAN. Last four and a brand, which is all a UI needs. */
  cards: readonly {
    id: string
    brand: string
    last4: string
    expiry: string
    isDefault: boolean
  }[]
}
