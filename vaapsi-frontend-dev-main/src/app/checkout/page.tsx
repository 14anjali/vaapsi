import type { Metadata } from 'next'
import { CheckoutView } from '@/components/patterns/checkout/checkout-view'
import { checkout } from '@/content/checkout'

export const metadata: Metadata = {
  title: checkout.title,
  robots: { index: false, follow: false },
}

/**
 * Checkout.
 *
 * A client boundary and nothing else: the bag lives in the persisted client
 * store, so the whole flow — lines, totals, delivery, the mock payment — runs in
 * `CheckoutView`, which resolves the cart through `/api/cart` the same way the
 * bag page does. There is no server data to fetch here, and the nominal subtotal
 * this page used to compute is gone: it was a stand-in from before the summary
 * showed real lines, and two different subtotals on one page is worse than none.
 *
 * Payment is a demo mock, labelled on screen. See `MockPayment`.
 */
export default function CheckoutPage() {
  return <CheckoutView />
}
