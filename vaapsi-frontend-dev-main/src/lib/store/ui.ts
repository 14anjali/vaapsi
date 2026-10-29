import { create } from 'zustand'

/**
 * Ephemeral interface state. Not data, not persisted, not shared with the server.
 *
 * The rule for this store: if it would still matter after a refresh, it does not
 * belong here. Filter state goes in the URL. Cart membership is persisted
 * separately in `store/cart.ts` and resolved through the adapter. What lives
 * here is only which panel is open.
 */

type UiState = {
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void

  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  cartOpen: false,
  openCart: () => set({ cartOpen: true, mobileNavOpen: false }),
  closeCart: () => set({ cartOpen: false }),
}))
