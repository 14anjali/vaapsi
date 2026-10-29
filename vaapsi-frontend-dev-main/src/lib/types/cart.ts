import type { CartId, CartLineId, CurrencyCode, IsoDateTime, Paise } from './common'
import type { ProductSummary } from './product'

/**
 * A cart line. **There is no quantity.** Every garment is one-of-one, so a line
 * is a garment, and adding the same garment twice is not a thing that can
 * happen. If a quantity field ever appears here, something upstream has started
 * treating garments as SKUs.
 */
export type CartLine = {
  id: CartLineId
  /** Snapshot for rendering without a second fetch. Refreshed on cart read. */
  product: ProductSummary
  /** Price at the moment of adding, in paise. May differ from the live price. */
  priceAtAddInr: Paise
  addedAt: IsoDateTime
  /**
   * Single-unit inventory means a line can go stale while it sits in the cart.
   * `sold` is not an error state — it is the expected outcome of a slow
   * checkout on a one-of-one marketplace, and needs its own treatment.
   */
  status: 'active' | 'reserved' | 'sold_out' | 'price_changed'
  /**
   * What the shopper chose, echoed back for display. Null on one-of-one stock.
   *
   * Resolved rather than trusted: the adapter checks the stored slug against the
   * product's live colourways, so a colour that has been discontinued since it
   * went in the bag comes back as unavailable instead of as a name nobody can
   * fulfil.
   */
  selection: { colorName: string; sizeLabel: string } | null
}

/**
 * Totals are computed server-side and sent down. The front end does not do
 * money arithmetic — GST treatment on a C2C resale is unresolved (PRD open
 * question #6) and guessing at it in the client would be wrong in a way that
 * is invisible until someone reads an invoice.
 */
export type CartTotals = {
  /** Sum of active lines, in paise. */
  subtotalInr: Paise
  /** Null until a PIN code is known. */
  shippingInr: Paise | null
  /** Null until the merchant-of-record model is settled. */
  taxInr: Paise | null
  discountInr: Paise
  /** What the shopper pays, in paise. */
  totalInr: Paise
}

export type Cart = {
  id: CartId
  lines: readonly CartLine[]
  totals: CartTotals
  currency: CurrencyCode
  updatedAt: IsoDateTime
}
