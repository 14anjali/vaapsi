import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductId } from '@/lib/types'

/**
 * Wishlist. Same design as the cart and for the same reasons: IDs only,
 * resolved through the adapter on read.
 *
 * It exists in Phase 6 because "move to wishlist" is the right alternative to
 * "remove" on a cart line — a shopper hesitating over a garment should not have
 * to choose between buying it now and losing track of it. On one-of-one
 * inventory that is a real tension, and a wishlist is the honest answer to it:
 * we cannot hold the garment, but we can remember that you wanted it.
 *
 * Not backed by an account yet. Local to the device until auth exists.
 */
type WishlistState = {
  items: readonly ProductId[]
  toggle: (productId: ProductId) => void
  add: (productId: ProductId) => void
  remove: (productId: ProductId) => void
  has: (productId: ProductId) => boolean
}

export const WISHLIST_STORAGE_KEY = 'vaapsi.wishlist.v1'

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) =>
        set((state) =>
          state.items.includes(productId) ? state : { items: [...state.items, productId] },
        ),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((id) => id !== productId) })),
      toggle: (productId) =>
        set((state) =>
          state.items.includes(productId)
            ? { items: state.items.filter((id) => id !== productId) }
            : { items: [...state.items, productId] },
        ),
      has: (productId) => get().items.includes(productId),
    }),
    { name: WISHLIST_STORAGE_KEY },
  ),
)
