import { apparelGstRate, gstComponent, orderGst } from '../gst'

/**
 * GST on an order.
 *
 * This is money, and it is money a shopper can check against their own
 * arithmetic, so the figures are asserted rather than trusted. Two properties
 * matter more than any single number:
 *
 * - **The tax is inside the price.** Every price on this site is GST-inclusive,
 *   which is what a displayed price means in India. So the tax extracted from
 *   a line can never exceed the line, and adding the tax to the total would be
 *   overcharging.
 * - **Rounding goes the shopper's way.** Floored, like the delivery discount.
 */

describe('the rate depends on the garment, not the order', () => {
  it('applies 5% up to ₹1,000 and 12% above it', () => {
    expect(apparelGstRate(90_000)).toBe(0.05)
    // Exactly ₹1,000 is still the lower band — the threshold is inclusive.
    expect(apparelGstRate(100_000)).toBe(0.05)
    expect(apparelGstRate(100_001)).toBe(0.12)
    expect(apparelGstRate(390_000)).toBe(0.12)
  })

  it('taxes a mixed bag line by line, not at one blended rate', () => {
    // A ₹900 shirt at 5% and a ₹3,900 jean at 12%. An order-level rate applied
    // to the ₹4,800 subtotal is wrong in both directions depending on the mix,
    // which is the entire reason this is per-line.
    const perLine = orderGst({ lineInr: [90_000, 390_000] })
    expect(perLine).toBe(gstComponent(90_000, 0.05) + gstComponent(390_000, 0.12))
    // And it is not what a single 12% pass over the subtotal would give.
    expect(perLine).not.toBe(gstComponent(480_000, 0.12))
  })
})

describe('the tax is extracted, not added', () => {
  it('is the component already inside a gross amount', () => {
    // ₹1,120 at 12% inclusive contains ₹120 of tax, not ₹134.40.
    expect(gstComponent(112_000, 0.12)).toBe(12_000)
    // ₹1,050 at 5% inclusive contains ₹50.
    expect(gstComponent(105_000, 0.05)).toBe(5_000)
  })

  it('never exceeds the amount it came out of', () => {
    for (const gross of [1, 99, 100_000, 390_000, 1_000_000]) {
      expect(gstComponent(gross, 0.12)).toBeLessThan(gross)
    }
  })

  it('floors, so the figure is never overquoted', () => {
    // 5% inclusive of 999 paise is 47.57… paise.
    expect(gstComponent(999, 0.05)).toBe(47)
  })

  it('is zero on nothing, rather than NaN', () => {
    expect(gstComponent(0, 0.12)).toBe(0)
    expect(gstComponent(100, 0)).toBe(0)
    expect(orderGst({ lineInr: [] })).toBe(0)
  })
})

describe('the rest of the order', () => {
  it('taxes delivery at the service rate, not the apparel rate', () => {
    // Courier service is 18%. Folding it into the garment subtotal would tax it
    // at 5% or 12% depending on what else is in the bag.
    const withDelivery = orderGst({ lineInr: [390_000], deliveryInr: 9_900 })
    expect(withDelivery).toBe(gstComponent(390_000, 0.12) + gstComponent(9_900, 0.18))
  })

  it('reduces the taxable value by a delivery discount', () => {
    // A discount lowers what is actually paid for the garments, so it lowers
    // the tax contained in them. Charging tax on a price nobody paid is the
    // failure this guards.
    const full = orderGst({ lineInr: [400_000] })
    const discounted = orderGst({ lineInr: [400_000], discountInr: 60_000 })
    expect(discounted).toBeLessThan(full)
    expect(discounted).toBe(gstComponent(340_000, 0.12))
  })

  it('spreads a discount across lines rather than off the first one', () => {
    // Two lines at different rates. Taking the whole discount off whichever
    // line comes first in the array would make the tax depend on cart order.
    const forwards = orderGst({ lineInr: [90_000, 390_000], discountInr: 48_000 })
    const backwards = orderGst({ lineInr: [390_000, 90_000], discountInr: 48_000 })
    expect(forwards).toBe(backwards)
  })

  it('does not go negative on a discount larger than the order', () => {
    expect(orderGst({ lineInr: [90_000], discountInr: 500_000 })).toBe(0)
  })
})
