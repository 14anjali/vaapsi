import type { Metadata } from 'next'
import { CartView } from '@/components/patterns/cart/cart-view'
import { cart } from '@/content/cart'

export const metadata: Metadata = {
  title: cart.title,
  // A bag is personal and worthless to a search engine.
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return <CartView />
}
