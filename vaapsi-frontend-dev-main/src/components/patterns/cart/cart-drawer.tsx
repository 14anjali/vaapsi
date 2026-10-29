'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { CartLine } from './cart-line'
import { CartSummary } from './cart-summary'
import { useCart } from './use-cart'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { cart as copy } from '@/content/cart'
import { useUiStore } from '@/lib/store/ui'

/**
 * The bag, as a drawer from the header.
 *
 * Revalidates on open — not just on mount. A shopper who added something twenty
 * minutes ago and is only now opening the bag needs to see what is true now, and
 * "was it still available when you clicked add" is not the same question as
 * "is it available now".
 *
 * The full `/cart` route renders the same `CartLine` and `CartSummary`, so the
 * two surfaces cannot say different things about the same bag.
 */
export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen)
  const close = useUiStore((state) => state.closeCart)
  const pathname = usePathname()
  const { cart, isLoading, unavailable, canCheckout, revalidate } = useCart()

  // Close on navigation. Every link in here leaves the page — Checkout, "view
  // the full bag", a line's own product link — and a panel that stays open over
  // the destination hides the thing the shopper just asked for. Keyed on the
  // pathname rather than wired to each link's `onClick`, so a link added later
  // cannot forget to do it.
  //
  // Fires on a *change* rather than on every run, which matters: the bare
  // version also closes on mount, so anything that mounts this while the bag is
  // already open would shut it. That does not happen today — the drawer sits in
  // the persistent layout and mounts once, before anyone can open it — but it is
  // a trap for whoever moves it.
  const lastPathname = useRef(pathname)
  useEffect(() => {
    if (lastPathname.current === pathname) return
    lastPathname.current = pathname
    close()
  }, [pathname, close])

  useEffect(() => {
    if (open) void revalidate()
    // `revalidate` is a stable callback from the query client; re-running this
    // on its identity would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const lines = cart?.lines ?? []

  return (
    <Overlay open={open} onClose={close} label={copy.drawerTitle} side="right">
      <Row gap={2} justify="between" className="shrink-0 border-b border-line px-gutter py-4">
        <Row gap={3} align="baseline">
          <Type as="h2" size="sm" weight="emphasis">
            {copy.drawerTitle}
          </Type>
          {lines.length > 0 && (
            <Type as="span" size="xs" tone="subtle" numeric>
              {copy.count(lines.length)}
            </Type>
          )}
        </Row>
        <button
          type="button"
          onClick={close}
          className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <span className="sr-only">{copy.close}</span>
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </Row>

      <div className="flex-1 overflow-y-auto px-gutter py-5">
        {isLoading ? (
          // Nothing, not an empty state. Claiming the bag is empty before the
          // persisted list has been read is a lie that lasts one frame and
          // reads as a bug.
          <div className="flex h-24 items-center justify-center" role="status" aria-live="polite">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            <span className="sr-only">Loading your bag</span>
          </div>
        ) : lines.length === 0 ? (
          <EmptyBag onNavigate={close} />
        ) : (
          <ul>
            {lines.map((line) => (
              <CartLine key={line.id} line={line} compact />
            ))}
          </ul>
        )}
      </div>

      {cart !== null && lines.length > 0 && (
        <div className="shrink-0 border-t border-line px-gutter py-5">
          <CartSummary cart={cart} unavailable={unavailable} canCheckout={canCheckout} />
          <Link
            href="/cart"
            onClick={close}
            className="mt-4 block text-center text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
          >
            View the full bag
          </Link>
        </div>
      )}
    </Overlay>
  )
}

export function EmptyBag({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Stack gap={4} className="py-8">
      <Type as="p" family="display" size="xl" weight="heading">
        {copy.empty.title}
      </Type>
      <Type size="sm" tone="muted" measure="narrow">
        {copy.empty.body}
      </Type>
      <Row gap={4} className="pt-2">
        <Link
          href="/shop?sort=newest"
          onClick={onNavigate}
          className="ease bg-ink px-5 py-2.5 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {copy.empty.action}
        </Link>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="ease border border-line-strong px-5 py-2.5 text-sm transition-colors duration-fast hover:border-ink"
        >
          {copy.empty.browseAll}
        </Link>
      </Row>
    </Stack>
  )
}
