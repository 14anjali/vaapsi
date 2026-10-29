'use client'

import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { useCartStore } from '@/lib/store/cart'
import { useUiStore } from '@/lib/store/ui'
import type { Availability } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Add to bag.
 *
 * **No quantity stepper.** There is nothing to increment. Every garment is
 * one-of-one, so the control is a single button, and a stepper here would be an
 * interface promising something the inventory cannot deliver.
 *
 * The three availability states get three different treatments, and none of them
 * is a disabled button with no explanation:
 *
 * - `available` — the action.
 * - `reserved` — someone is mid-checkout. Stated plainly, with the reason.
 *   It may come back, and saying so is more useful than a greyed-out button.
 * - `sold` — gone, and the page says the record stays. A sold garment still has
 *   a passport worth reading, which is why this page remains worth being on.
 *
 * Adding writes a product ID and a timestamp to the persisted cart store and
 * nothing else — no price, no availability. Both are resolved fresh on every
 * cart read, which is why a garment that sells while it sits in someone's bag is
 * handled honestly rather than discovered at checkout.
 *
 * The only feedback is the header badge moving. No toast, no flying image, no
 * modal. The button changing to "In your bag" and the count ticking up is the
 * whole confirmation, and it is enough.
 */
export function AddToBag({
  productId,
  availability,
}: {
  productId: string
  availability: Availability
}) {
  const add = useCartStore((state) => state.add)
  const inBag = useCartStore((state) => state.items.some((item) => item.productId === productId))
  const openCart = useUiStore((state) => state.openCart)

  if (availability === 'sold') {
    return (
      <Stack gap={2}>
        <div className="w-full border border-line py-3.5 text-center">
          <Type as="span" size="sm" tone="subtle">
            {delivery.bag.sold}
          </Type>
        </div>
        <Type size="xs" tone="subtle">
          {delivery.bag.soldHelp}
        </Type>
      </Stack>
    )
  }

  if (availability === 'reserved') {
    return (
      <Stack gap={2}>
        <div className="w-full border border-line-strong py-3.5 text-center">
          <Type as="span" size="sm" tone="muted">
            {delivery.bag.reserved}
          </Type>
        </div>
        <Type size="xs" tone="subtle">
          {delivery.bag.reservedHelp}
        </Type>
      </Stack>
    )
  }

  return (
    <Stack gap={2}>
      <button
        type="button"
        onClick={() => add(productId)}
        disabled={inBag}
        className={cn(
          'ease w-full py-3.5 text-sm transition-colors duration-fast',
          inBag
            ? 'cursor-default border border-line-strong text-ink-muted'
            : 'bg-ink text-background hover:bg-ink-muted',
        )}
      >
        {inBag ? delivery.bag.added : delivery.bag.add}
      </button>

      {inBag ? (
        <button
          type="button"
          onClick={openCart}
          className="self-start text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
        >
          {delivery.bag.viewBag}
        </button>
      ) : (
        <Type size="xs" tone="subtle">
          {delivery.bag.oneOfOne}
        </Type>
      )}
    </Stack>
  )
}
