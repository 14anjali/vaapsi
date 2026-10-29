'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CartItemRef } from '@/lib/data'
import type { Cart } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'

/**
 * Resolve the persisted cart into priced, availability-checked lines.
 *
 * **Revalidates on every route change and every time the drawer opens.** On
 * one-of-one inventory a garment can sell while it sits in someone's bag, and
 * the only honest way to handle that is to keep asking. A cart resolved once at
 * page load and trusted thereafter will show a shopper a total they cannot pay.
 *
 * `staleTime: 0` is deliberate and is the opposite of the app-wide default. The
 * product grid can be thirty seconds stale without consequence; the bag cannot.
 */

const CART_QUERY_KEY = ['cart'] as const

async function fetchCart(items: readonly CartItemRef[]): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  if (!response.ok) throw new Error('Could not resolve the bag')
  return (await response.json()) as Cart
}

export function useCart() {
  const items = useCartStore((state) => state.items)
  const hydrated = useCartStore((state) => state.hydrated)
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const query = useQuery({
    // The membership list is part of the key, so adding or removing a garment
    // refetches without any manual invalidation.
    queryKey: [
      ...CART_QUERY_KEY,
      // Keyed on the variant too, not just the product: two colourways of one
      // style are two lines, and a key that ignored colour would serve the
      // first line's resolution for both.
      items
        .map((item) => `${item.productId}:${item.colorSlug ?? ''}:${item.sizeNormalized ?? ''}`)
        .sort()
        .join(','),
    ],
    queryFn: () => fetchCart(items),
    enabled: hydrated,
    staleTime: 0,
    placeholderData: (previous) => previous,
  })

  // Revalidate on navigation. A shopper who browses for ten minutes and then
  // opens the bag should see what is true now, not what was true when they
  // added things.
  useEffect(() => {
    if (!hydrated) return
    void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
  }, [pathname, hydrated, queryClient])

  const cart = query.data ?? null
  const unavailable = cart === null ? [] : cart.lines.filter((line) => line.status !== 'active')

  return {
    cart,
    /** True until the persisted list has been read. Render nothing, not empty. */
    isLoading: !hydrated || (query.isLoading && items.length > 0),
    isError: query.isError,
    /** Lines that cannot be bought right now. Blocks checkout. */
    unavailable,
    canCheckout: cart !== null && cart.lines.length > 0 && unavailable.length === 0,
    /** Force a revalidation. Called when the drawer opens. */
    revalidate: () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
  }
}

/** Line count, for the header badge. Reads the store directly — no fetch. */
export function useCartCount(): { count: number; hydrated: boolean } {
  const items = useCartStore((state) => state.items)
  const hydrated = useCartStore((state) => state.hydrated)
  return { count: items.length, hydrated }
}
