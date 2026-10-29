import { assess, priceWarning } from '../resale'
import { orders } from '../fixtures/account'
import { assessResale, createResaleRequest, getOrderLine, listOrders } from '..'

const ALL_SHOTS = ['tag', 'front', 'back', 'wear', 'extras']

/** The oldest order — fourteen months at the fixed date below. */
const OLD = orders.find((order) => order.reference === 'VP-2607-0041')!
const RECENT = orders.find((order) => order.reference === 'VP-2708-1204')!

/** Pinned, so age-based assertions do not drift with the real date. */
const NOW = new Date('2026-09-03T00:00:00.000Z')

function assessOld(overrides: Partial<Parameters<typeof assess>[0]> = {}) {
  return assess({
    order: OLD,
    line: OLD.lines[0]!,
    shotIds: ALL_SHOTS,
    now: NOW,
    ...overrides,
  })
}

/**
 * The resale assessment.
 *
 * There is no model behind it, so these do not test predictive accuracy. What
 * they pin down is the honesty of the *shape*: provenance stays separate from
 * price, every deduction is attributable, customisations add rather than
 * subtract, and no quote falls through the floor.
 */
describe('verification', () => {
  it('needs the label shot, which is what stands in for a login', () => {
    const withoutTag = assessOld({ shotIds: ['front', 'back'] })
    expect(withoutTag.verification).toBe('no_match')
    expect(withoutTag.verificationNote).toMatch(/label/i)
  })

  it('confirms a match from the label plus a flat front', () => {
    expect(assessOld({ shotIds: ['tag', 'front'] }).verification).toBe('match')
  })

  it('is uncertain — a real third state — with a label but no front', () => {
    // A garment we cannot confirm must not be priced as though we had, and must
    // not be rejected as though we knew it was wrong.
    const out = assessOld({ shotIds: ['tag'] })
    expect(out.verification).toBe('uncertain')
    expect(out.verificationNote).toMatch(/studio/i)
  })

  it('still returns a price when verification is uncertain', () => {
    // The seller can send it in; we confirm on arrival. Withholding the quote
    // would make an unclear photograph into a dead end.
    expect(assessOld({ shotIds: ['tag'] }).suggestedInr.mid).toBeGreaterThan(0)
  })
})

describe('condition and flaws', () => {
  it('grades an older garment below a nearly new one', () => {
    const old = assessOld()
    const recent = assess({
      order: RECENT,
      line: RECENT.lines[0]!,
      shotIds: ALL_SHOTS,
      now: NOW,
    })
    expect(old.flaws.length).toBeGreaterThan(recent.flaws.length)
  })

  it('prices every flaw separately, so each can be shown beside the mark', () => {
    const out = assessOld()
    expect(out.flaws.length).toBeGreaterThan(0)
    for (const flaw of out.flaws) {
      expect(flaw.deductionInr).toBeGreaterThan(0)
      expect(flaw.description).not.toBe('')
      // A flaw with no stated location cannot be shown next to anything.
      expect(flaw.location).not.toBe('')
    }
  })

  it('does not punish a seller for declaring a mark', () => {
    // Declaring and being found out cost the same. Otherwise honesty is taxed.
    const declared = assessOld({ declaredFlaws: ['Small ink mark on the back pocket'] })
    const mine = declared.flaws.find((flaw) => flaw.declaredBySeller)
    expect(mine).toBeDefined()
    expect(mine?.deductionInr).toBeGreaterThan(0)
  })

  it('marks who found each flaw, so the copy can differ', () => {
    const out = assessOld({ declaredFlaws: ['Frayed left cuff'] })
    expect(out.flaws.some((flaw) => flaw.declaredBySeller)).toBe(true)
    expect(out.flaws.some((flaw) => !flaw.declaredBySeller)).toBe(true)
  })

  it('every flaw appears as a negative factor, so the total is attributable', () => {
    const out = assessOld()
    for (const flaw of out.flaws) {
      const factor = out.factors.find((candidate) => candidate.label === flaw.description)
      expect(factor).toBeDefined()
      expect(factor?.effectInr).toBe(-flaw.deductionInr)
    }
  })
})

describe('price', () => {
  it('takes value off for age, and says how much', () => {
    const out = assessOld()
    const age = out.factors.find((factor) => /months old/.test(factor.label))
    expect(age).toBeDefined()
    expect(age!.effectInr).toBeLessThan(0)
    expect(age!.reason).not.toBe('')
  })

  it('quotes a recent purchase closer to what was paid than an old one', () => {
    const recentLine = RECENT.lines[0]!
    const recent = assess({ order: RECENT, line: recentLine, shotIds: ALL_SHOTS, now: NOW })
    const old = assessOld()

    const recentShare = recent.suggestedInr.mid / recentLine.pricePaidInr
    const oldShare = old.suggestedInr.mid / OLD.lines[0]!.pricePaidInr
    expect(recentShare).toBeGreaterThan(oldShare)
  })

  it('never quotes below the floor, however much has come off', () => {
    // Denim keeps a residual value. A quote that trends to nothing is both
    // wrong and insulting.
    const out = assessOld({
      declaredFlaws: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    })
    expect(out.suggestedInr.low).toBeGreaterThan(0)
    expect(out.suggestedInr.mid / OLD.lines[0]!.pricePaidInr).toBeGreaterThanOrEqual(0.27)
  })

  it('returns a range in order, not a single number', () => {
    const out = assessOld()
    expect(out.suggestedInr.low).toBeLessThan(out.suggestedInr.mid)
    expect(out.suggestedInr.mid).toBeLessThan(out.suggestedInr.high)
  })

  it('rounds to fifty rupees, because the precision is not real', () => {
    const out = assessOld()
    for (const value of Object.values(out.suggestedInr)) {
      expect(value % 5_000).toBe(0)
    }
  })

  it('gives every factor a reason a seller could argue with', () => {
    for (const factor of assessOld().factors) {
      expect(factor.reason).not.toBe('')
      expect(factor.label).not.toBe('')
    }
  })
})

describe('customisations', () => {
  it('adds value rather than deducting it', () => {
    // The opposite of how resale normally treats a modification, and the whole
    // reason a creator would use this marketplace.
    const plain = assessOld({ hasCustomisations: false })
    const customised = assessOld({ hasCustomisations: true })

    expect(customised.customisations.length).toBeGreaterThan(0)
    expect(customised.customisations[0]!.effectInr).toBeGreaterThan(0)
    expect(customised.suggestedInr.mid).toBeGreaterThan(plain.suggestedInr.mid)
  })

  it('says nothing about additions when there are none', () => {
    expect(assessOld({ hasCustomisations: false }).customisations).toHaveLength(0)
  })
})

describe('priceWarning', () => {
  const range = { low: 200_000, mid: 250_000, high: 300_000 }

  it('stays quiet inside the range', () => {
    expect(priceWarning(250_000, range)).toBeNull()
    expect(priceWarning(310_000, range)).toBeNull()
  })

  it('flags a price well above the range, without blocking it', () => {
    const out = priceWarning(500_000, range)
    expect(out?.severity).toBe('high')
    expect(out?.message).toMatch(/unsold/i)
  })

  it('flags leaving money on the table', () => {
    expect(priceWarning(100_000, range)?.severity).toBe('low')
  })

  it('catches the extra-digit case as its own thing', () => {
    // Distinguished from "ambitious" on purpose: the advice differs, and the
    // most likely cause is a typo rather than a decision.
    const out = priceWarning(2_500_000, range)
    expect(out?.severity).toBe('typo')
    expect(out?.message).toMatch(/digit/i)
  })
})

describe('the adapter surface', () => {
  it('lists purchases newest first', async () => {
    const list = await listOrders()
    const dates = list.map((order) => Date.parse(order.placedAt))
    expect([...dates].sort((a, b) => b - a)).toEqual(dates)
  })

  it('finds an order line by id, with its order', async () => {
    const found = await getOrderLine('orl_1')
    expect(found?.line.id).toBe('orl_1')
    expect(found?.order.reference).toBe('VP-2607-0041')
  })

  it('returns null for a line that does not exist', async () => {
    expect(await getOrderLine('orl_nope')).toBeNull()
  })

  it('assesses through the adapter', async () => {
    const out = await assessResale({ orderLineId: 'orl_1', shotIds: ALL_SHOTS })
    expect(out.verification).toBe('match')
  })

  it('refuses to create a listing for a garment it could not verify', async () => {
    // The one place the verdict is load-bearing rather than informational: an
    // unidentifiable garment must not become a listing.
    const assessment = await assessResale({ orderLineId: 'orl_1', shotIds: ['front'] })
    expect(assessment.verification).toBe('no_match')

    await expect(
      createResaleRequest({ orderLineId: 'orl_1', askingInr: 200_000, assessment }),
    ).rejects.toThrow()
  })

  it('creates a submitted request from a verified assessment', async () => {
    const assessment = await assessResale({ orderLineId: 'orl_1', shotIds: ALL_SHOTS })
    const request = await createResaleRequest({
      orderLineId: 'orl_1',
      askingInr: assessment.suggestedInr.mid,
      assessment,
    })
    expect(request.status).toBe('submitted')
    expect(request.askingInr).toBe(assessment.suggestedInr.mid)
  })
})
