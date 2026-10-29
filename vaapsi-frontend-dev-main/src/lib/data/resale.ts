import { primaryMaterial } from '@/lib/format/composition'
import type {
  DetectedFlaw,
  Order,
  OrderLine,
  PriceFactor,
  ResaleAssessment,
  ShotAssessment,
  VerificationResult,
} from '@/lib/types'

/**
 * ============================================================================
 * THE RESALE ASSESSMENT — DEMONSTRATED, NOT IMPLEMENTED
 * ============================================================================
 *
 * ⚠️ **There is no model here.** Every number below is derived deterministically
 * from the order line — how old it is, what it is made of, what the seller
 * declared. That is deliberate: it makes the flow, the arithmetic and the copy
 * fully exercisable, and it keeps the *shape* of the contract honest so a real
 * assessment service can drop in behind it.
 *
 * The UI says so on the page. A quote that looks like a valuation and is
 * actually a formula is the one thing this must never be mistaken for, and
 * "AI-powered" on a screen is not a disclosure.
 *
 * ## What the shape has to get right
 *
 * Three things, and they are the reason this is a structured result rather than
 * a single price:
 *
 * 1. **A verification verdict, separate from the price.** Provenance is
 *    pass/fail-ish and the price is a judgement. Fusing them would mean a
 *    garment we could not identify still got a number, which is how a
 *    marketplace launders fakes.
 * 2. **Per-flaw deductions.** Each mark carries its own figure so it can be
 *    shown *next to the flaw*. A total that quietly absorbed six deductions
 *    reads as a trick, and a seller who finds out at the end argues instead of
 *    accepting.
 * 3. **Factors, not a black box.** Age, material and demand each state their
 *    own effect. A seller who disagrees can see which input to disagree with.
 *
 * ## Customisations add, they do not deduct
 *
 * Conventional resale treats any modification as damage. On a marketplace that
 * *sells* customisation, that would be incoherent — and the people who embroider
 * their jackets are exactly the sellers worth keeping. So recognised additions
 * are positive factors, and the copy calls them out as upside.
 */

/** Reference points, all in paise. Provisional — see the warning above. */
const MONTHS_TO_FULL_DEPRECIATION = 48
/** The most age alone can take off. Denim floors rather than going to nothing. */
const MAX_AGE_DISCOUNT = 0.55
/** Below this share of the price paid, we stop quoting lower. */
const FLOOR_SHARE = 0.28

const MATERIAL_DEMAND: Readonly<Record<string, { multiplier: number; reason: string }>> = {
  cotton: { multiplier: 1, reason: 'Cotton denim is the bulk of what sells here.' },
  linen: {
    multiplier: 1.08,
    reason: 'Linen blends are asked for more often than they come in.',
  },
  hemp: { multiplier: 1.06, reason: 'Hemp pieces are scarce and move quickly.' },
  lyocell: { multiplier: 1.04, reason: 'Lyocell has a following and little supply.' },
  'recycled cotton': {
    multiplier: 1.05,
    reason: 'Recycled-fibre pieces attract a premium on resale.',
  },
}

function monthsBetween(from: string, to: Date): number {
  const start = new Date(from)
  if (Number.isNaN(start.getTime())) return 0
  const months =
    (to.getUTCFullYear() - start.getUTCFullYear()) * 12 + (to.getUTCMonth() - start.getUTCMonth())
  return Math.max(0, months)
}

function roundToFifty(paise: number): number {
  // Quotes land on ₹50, because a resale quote of ₹2,847 implies an arithmetic
  // precision that no condition assessment has.
  return Math.round(paise / 5_000) * 5_000
}

/**
 * Flaws we "found", derived from age and what the seller said.
 *
 * A seller who declares a mark keeps the same deduction as one who does not —
 * declaring is not punished, and hiding is not rewarded. What differs is the
 * copy: an undeclared find is surfaced as something we spotted, which is the
 * honest framing and the one that stops a seller feeling caught out.
 */
function flawsFor(line: OrderLine, months: number, declared: readonly string[]): DetectedFlaw[] {
  const paid = line.pricePaidInr
  const out: DetectedFlaw[] = declared.map((description) => ({
    description,
    location: 'As you described it',
    deductionInr: Math.round(paid * 0.04),
    declaredBySeller: true,
  }))

  // Older pieces acquire the wear you would expect them to. Deterministic, so
  // the same line always assesses the same way.
  if (months >= 12) {
    out.push({
      description:
        line.product.category === 'bottoms'
          ? 'Even fading through the seat and knees'
          : 'Softening and light fading at the cuffs',
      location: line.product.category === 'bottoms' ? 'Seat and knees' : 'Cuffs',
      deductionInr: Math.round(paid * 0.06),
      declaredBySeller: false,
    })
  }
  if (months >= 24) {
    out.push({
      description: 'Slight looseness where the hem has been turned',
      location: 'Hem',
      deductionInr: Math.round(paid * 0.03),
      declaredBySeller: false,
    })
  }

  return out
}

function conditionFor(months: number, flawCount: number): ResaleAssessment['suggestedCondition'] {
  if (months < 3 && flawCount === 0) return 'pristine'
  if (months < 9 && flawCount <= 1) return 'excellent'
  if (months < 20 && flawCount <= 2) return 'very_good'
  if (months < 36) return 'good'
  return 'well_loved'
}

/**
 * Verification.
 *
 * The label shot is the provenance claim, so its absence is the difference
 * between "we know what this is" and "we do not". `uncertain` is a real
 * third state rather than a rounding of the other two: a garment we cannot
 * confirm should not be priced as if we had, and should not be rejected as if
 * we knew it was wrong either.
 */
function verify(shotIds: readonly string[]): {
  verification: VerificationResult
  verificationNote: string
} {
  const hasTag = shotIds.includes('tag')
  const hasFront = shotIds.includes('front')

  if (hasTag && hasFront) {
    return {
      verification: 'match',
      verificationNote:
        'The label reads Vaapsi and the piece matches the one on this order — same cut, same wash, same size.',
    }
  }
  if (hasTag) {
    return {
      verification: 'uncertain',
      verificationNote:
        'The label checks out, but without a flat shot of the front we cannot confirm it is this exact piece. You can still send it; we will confirm at the studio.',
    }
  }
  return {
    verification: 'no_match',
    verificationNote:
      'We could not read a Vaapsi label. A clear photograph of the inside label is what lets us list this without an account.',
  }
}

export function assess(input: {
  order: Order
  line: OrderLine
  shotIds: readonly string[]
  declaredFlaws?: readonly string[]
  hasCustomisations?: boolean
  /** Injected so a test can pin the date rather than depend on today. */
  now?: Date
}): ResaleAssessment {
  const { order, line, shotIds } = input
  const now = input.now ?? new Date()
  const declared = input.declaredFlaws ?? []

  const months = monthsBetween(order.placedAt, now)
  const paid = line.pricePaidInr

  const { verification, verificationNote } = verify(shotIds)

  const flaws = flawsFor(line, months, declared)
  const suggestedCondition = conditionFor(months, flaws.length)

  // ---- factors, each stating its own effect
  const factors: PriceFactor[] = []

  const ageShare = Math.min(months / MONTHS_TO_FULL_DEPRECIATION, 1) * MAX_AGE_DISCOUNT
  const ageEffect = -Math.round(paid * ageShare)
  factors.push({
    label: months === 0 ? 'Bought this month' : `${months} months old`,
    effectInr: ageEffect,
    reason:
      months === 0
        ? 'Barely any time has passed, so almost nothing comes off for age.'
        : 'Denim holds value better than most categories, so age comes off slowly and stops rather than going to zero.',
  })

  const material = primaryMaterial(line.product.composition) ?? 'cotton'
  const demand = MATERIAL_DEMAND[material] ?? MATERIAL_DEMAND.cotton!
  const demandEffect = Math.round(paid * (demand.multiplier - 1))
  if (demandEffect !== 0) {
    factors.push({
      label: `${material.charAt(0).toUpperCase()}${material.slice(1)}`,
      effectInr: demandEffect,
      reason: demand.reason,
    })
  }

  for (const flaw of flaws) {
    factors.push({
      label: flaw.description,
      effectInr: -flaw.deductionInr,
      reason: flaw.declaredBySeller
        ? 'You told us about this one.'
        : 'We spotted this in your photographs.',
    })
  }

  // ---- customisations, as upside
  const customisations: PriceFactor[] =
    input.hasCustomisations === true
      ? [
          {
            label: 'Work you had done',
            effectInr: Math.round(paid * 0.12),
            reason:
              'Hand additions make a piece one of a kind, and one-of-a-kind sells for more here rather than less. Photograph them clearly and we will price them in.',
          },
        ]
      : []

  const total = factors.concat(customisations).reduce((sum, factor) => sum + factor.effectInr, 0)
  const floor = Math.round(paid * FLOOR_SHARE)
  const mid = roundToFifty(Math.max(paid + total, floor))

  return {
    verification,
    verificationNote,
    shots: shotIds.map((shotId): ShotAssessment => ({
      shotId,
      // Deterministic and deliberately not shown as a percentage — see the
      // note on `ShotAssessment`.
      confidence: shotId === 'tag' ? 0.94 : 0.86,
      note: shotId === 'tag' ? 'Label read, brand and size legible.' : 'Frame usable.',
    })),
    suggestedCondition,
    conditionNote:
      flaws.length === 0
        ? 'Nothing came up in your photographs beyond normal handling.'
        : 'Graded on what your photographs show. Every mark below is priced separately, so you can see what each one costs.',
    flaws,
    customisations,
    // A range, not a number. A single figure invites a negotiation with us; a
    // range says where the market is and leaves the choice with the seller.
    suggestedInr: {
      low: roundToFifty(Math.max(Math.round(mid * 0.88), floor)),
      mid,
      high: roundToFifty(Math.round(mid * 1.12)),
    },
    factors,
  }
}

/**
 * How far outside the quote a seller has gone.
 *
 * Returns `null` when the asking price is inside the range or close to it. A
 * flag, never a block: it is their garment and their call, and a marketplace
 * that refuses an unusual price is one sellers leave. What it *does* do is name
 * the likely consequence, and catch the fat-finger case where someone has typed
 * an extra zero.
 */
export function priceWarning(
  askingInr: number,
  suggested: ResaleAssessment['suggestedInr'],
): { severity: 'high' | 'low' | 'typo'; message: string } | null {
  if (askingInr >= suggested.high * 4) {
    return {
      severity: 'typo',
      message: 'That is several times the range. Check for an extra digit.',
    }
  }
  if (askingInr > suggested.high * 1.25) {
    return {
      severity: 'high',
      message:
        'Well above what pieces like this have been selling for. It can sit unsold for a long time at this price.',
    }
  }
  if (askingInr < suggested.low * 0.75) {
    return {
      severity: 'low',
      message:
        'Below the range — this will very likely sell, but you are leaving money on the table.',
    }
  }
  return null
}
