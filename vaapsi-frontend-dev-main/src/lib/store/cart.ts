import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItemRef } from '@/lib/data'
import type { ProductId } from '@/lib/types'

/**
 * The cart, persisted to localStorage.
 *
 * **It holds product IDs and added-at timestamps. Nothing else.**
 *
 * Not prices: a cart that remembers a price shows the old one after a
 * repricing, and the shopper finds out at checkout. Not availability: a cart
 * that remembers "available" will happily let two people buy the same garment.
 * Not titles or images either, because then a renamed garment has two names.
 *
 * Everything else is resolved through `resolveCart` on every read. That is the
 * whole design, and it is the reason this file is thirty lines instead of three
 * hundred.
 *
 * **There is no quantity.** A pre-loved garment is one-of-one, so membership is
 * a set and `add` is idempotent. New stock has colourways and sizes, so the set
 * is keyed on *product + colour + size* rather than on the product alone — two
 * colourways of one style are two lines, and adding the same colour and size
 * twice is still a no-op. There is still no quantity: if a `quantity` field
 * appears here, decide deliberately, because everything downstream assumes a set.
 */

type CartState = {
  items: readonly CartItemRef[]
  /** True once the persisted value has been read. Guards the first render. */
  hydrated: boolean

  /** `variant` is omitted for one-of-one stock, which has nothing to choose. */
  add: (productId: ProductId, variant?: CartVariantChoice) => void
  remove: (productId: ProductId, variant?: CartVariantChoice) => void
  clear: () => void
  has: (productId: ProductId, variant?: CartVariantChoice) => boolean
}

/** What a shopper picked on a product with colourways. */
export type CartVariantChoice = {
  colorSlug: string
  sizeNormalized: string
}

/**
 * Identity of a bag line. Product plus variant, so the same style in two colours
 * is two lines and the same colour twice is one.
 */
function sameLine(item: CartItemRef, productId: ProductId, variant?: CartVariantChoice): boolean {
  if (item.productId !== productId) return false
  return (
    (item.colorSlug ?? null) === (variant?.colorSlug ?? null) &&
    (item.sizeNormalized ?? null) === (variant?.sizeNormalized ?? null)
  )
}

export const CART_STORAGE_KEY = 'vaapsi.cart.v1'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      add: (productId, variant) =>
        set((state) => {
          // Idempotent per variant. Adding the same colour and size twice is a
          // no-op rather than an error or a second line.
          if (state.items.some((item) => sameLine(item, productId, variant))) return state
          return {
            items: [
              ...state.items,
              {
                productId,
                addedAt: new Date().toISOString(),
                colorSlug: variant?.colorSlug ?? null,
                sizeNormalized: variant?.sizeNormalized ?? null,
              },
            ],
          }
        }),

      remove: (productId, variant) =>
        set((state) => ({
          // With no variant given, remove every line for the product — which is
          // what a one-of-one garment means, and what the cart page wants when
          // it does not track which line it is on.
          items: state.items.filter((item) =>
            variant === undefined
              ? item.productId !== productId
              : !sameLine(item, productId, variant),
          ),
        })),

      clear: () => set({ items: [] }),

      has: (productId) => get().items.some((item) => item.productId === productId),
    }),
    {
      name: CART_STORAGE_KEY,
      // Only the membership list is persisted. `hydrated` is runtime state.
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

/*
 * The hydration flag matters more than it looks. Without it the header badge and
 * the cart page render an empty state from the pre-hydration store and then
 * flash to three items a frame later. Rendering nothing until hydrated is the
 * correct first frame.
 *
 * On the server rehydration never runs, so the flag is set immediately there —
 * otherwise every server-rendered cart surface would be stuck in its loading
 * state forever.
 */
if (typeof window === 'undefined') {
  useCartStore.setState({ hydrated: true })
} else {
  useCartStore.persist.onFinishHydration(() => useCartStore.setState({ hydrated: true }))
  // `onFinishHydration` does not fire if rehydration already completed before
  // this line ran, which happens when the module is imported late.
  if (useCartStore.persist.hasHydrated()) useCartStore.setState({ hydrated: true })
}
