'use client'

import Link from 'next/link'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { cart as copy } from '@/content/cart'
import { formatInr } from '@/lib/format/currency'
import type { Cart, CartLine } from '@/lib/types'

/**
 * Totals and the checkout call to action.
 *
 * Two rules:
 *
 * 1. **The blocking reason lives on the button.** If a line is unavailable, the
 *    button says so instead of saying "Checkout" and failing. A toast that
 *    explains and then disappears leaves a shopper clicking a dead control with
 *    no idea why.
 * 2. **Nothing invented.** Delivery reads "calculated at checkout" because it
 *    genuinely is not known without a PIN code and a courier (PRD Q8), and the
 *    total is the subtotal until it is. A plausible-looking delivery figure that
 *    turns out wrong costs more than an honest blank.
 */
export function CartSummary({
  cart,
  unavailable,
  canCheckout,
}: {
  cart: Cart
  unavailable: readonly CartLine[]
  canCheckout: boolean
}) {
  const isEmpty = cart.lines.length === 0

  return (
    <Stack gap={5}>
      <Eyebrow as="h2">{copy.summary.heading}</Eyebrow>

      <dl>
        <Row gap={4} justify="between" className="py-2">
          <Type as="dt" size="sm" tone="muted">
            {copy.summary.subtotal}
          </Type>
          <Type as="dd" size="sm" numeric>
            {formatInr(cart.totals.subtotalInr, { paise: 'never' })}
          </Type>
        </Row>

        <Row gap={4} justify="between" className="py-2">
          <Type as="dt" size="sm" tone="muted">
            {copy.summary.delivery}
          </Type>
          <Type as="dd" size="sm" tone="subtle">
            {cart.totals.shippingInr === null
              ? copy.summary.deliveryUnknown
              : formatInr(cart.totals.shippingInr, { paise: 'never' })}
          </Type>
        </Row>

        <Row gap={4} justify="between" className="mt-2 border-t border-line py-3">
          <Type as="dt" size="base" weight="emphasis">
            {copy.summary.total}
          </Type>
          <Type as="dd" size="base" weight="emphasis" numeric>
            {formatInr(cart.totals.totalInr, { paise: 'never' })}
          </Type>
        </Row>
      </dl>

      <Stack gap={2}>
        <Type size="xs" tone="subtle">
          {copy.summary.gstNote}
        </Type>
        {unavailable.length > 0 && (
          <Type size="xs" tone="subtle">
            {copy.summary.excludedNote(unavailable.length)}
          </Type>
        )}
      </Stack>

      {canCheckout ? (
        <Link
          href="/checkout"
          className="ease block w-full bg-ink py-3.5 text-center text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {copy.checkout.action}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="w-full border border-line py-3.5 text-center text-sm text-ink-muted"
        >
          {isEmpty ? copy.checkout.blockedEmpty : copy.checkout.blockedUnavailable}
        </button>
      )}

      <Type size="xs" tone="subtle">
        {copy.oneOfOne}
      </Type>
    </Stack>
  )
}
