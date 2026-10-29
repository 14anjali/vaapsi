import type { Paise } from '@/lib/types'

/**
 * GST on an order.
 *
 * ## The rate is per garment, not per order
 *
 * Indian apparel is taxed on the item's own value: **5% up to ₹1,000, 12%
 * above it.** So a ₹900 shirt and a ₹3,900 jean in the same bag are taxed at
 * different rates, and an order-level rate applied to the subtotal would be
 * wrong in both directions depending on the mix. Each line is computed on its
 * own and the results are summed.
 *
 * Courier service is taxed separately at 18%, which is why the delivery fee is
 * passed in rather than folded into the subtotal.
 *
 * ## Tax is *inside* the price, not added to it
 *
 * This is the part worth reading before changing anything here. Indian retail
 * prices are quoted inclusive of GST — that is what a displayed price legally
 * means — so ₹3,900 on a product card is the amount the shopper pays, tax
 * included. Adding 12% on top at checkout would both overcharge and contradict
 * every price on the site.
 *
 * So this **extracts** the tax already contained in the price rather than
 * adding it:
 *
 *     tax = price − price / (1 + rate)
 *
 * The consequence is that the order total does not change when this line
 * appears. The GST row tells a shopper how much of what they are paying is
 * tax, which is what an invoice has to show and what a business buyer needs.
 * It is a component, not a charge.
 *
 * ## Rounding
 *
 * Floored, so the tax we state is never larger than the tax actually contained
 * in the price. Same direction as the delivery discount: rounding goes the
 * shopper's way, and a stated figure is never overquoted.
 *
 * ⚠️ **Resale needs a decision that has not been made.** Second-hand goods can
 * fall under a margin scheme, where GST applies to the seller's margin rather
 * than to the full sale value — which would make the figure below wrong for
 * every pre-loved garment. This computes the straightforward apparel treatment,
 * which is right for new stock and is the conservative reading for resale. It
 * needs an accountant's sign-off before launch (PRD open question #6).
 */

/** The ₹1,000 threshold, in paise. Above it, apparel moves from 5% to 12%. */
const APPAREL_THRESHOLD: Paise = 100_000

const APPAREL_LOW = 0.05
const APPAREL_HIGH = 0.12
/** Courier service. Unrelated to the garment rate. */
const SERVICE = 0.18

/** Which rate a single garment attracts, by its own price. */
export function apparelGstRate(priceInr: Paise): number {
  return priceInr > APPAREL_THRESHOLD ? APPAREL_HIGH : APPAREL_LOW
}

/**
 * The tax contained in a gross, tax-inclusive amount.
 *
 * Floored. See the rounding note above.
 */
export function gstComponent(grossInr: Paise, rate: number): Paise {
  if (grossInr <= 0 || rate <= 0) return 0
  return Math.floor(grossInr - grossInr / (1 + rate))
}

/**
 * Total GST contained in an order.
 *
 * `lineInr` are the garment prices, each taxed at its own rate. `deliveryInr`
 * is the courier fee at the service rate. A delivery *discount* reduces the
 * taxable value of the garments, so it is applied before the garment tax is
 * computed — pro-rata across the lines, which is what keeps a two-rate bag
 * correct rather than taxing the discount at whichever rate happens to be
 * first in the array.
 */
export function orderGst({
  lineInr,
  discountInr = 0,
  deliveryInr = 0,
}: {
  lineInr: readonly Paise[]
  discountInr?: Paise
  deliveryInr?: Paise
}): Paise {
  const subtotal = lineInr.reduce((sum, value) => sum + value, 0)
  // No subtotal means no garments to apportion a discount across.
  const kept = subtotal > 0 ? Math.max(0, subtotal - discountInr) / subtotal : 0

  const onGarments = lineInr.reduce(
    (sum, value) => sum + gstComponent(Math.floor(value * kept), apparelGstRate(value)),
    0,
  )

  return onGarments + gstComponent(deliveryInr, SERVICE)
}
