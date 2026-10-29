'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { Logo } from './logo'
import { ProfileMenu } from './account/profile-menu'
import { MobileNav } from './mobile-nav'
import { NavLink } from './nav-link'
import { CartBadge } from './cart/cart-badge'
import { CartDrawer } from './cart/cart-drawer'
import { useCartCount } from './cart/use-cart'
import { navLabels, primaryNav } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { cn } from '@/lib/utils'

/**
 * Slim, sticky header.
 *
 * Near-transparent at the top of the page, solid with a hairline once scrolled.
 * That is **one property transition, not a rebuild** — the markup is identical
 * in both states and only `background-color` and `border-color` move. Swapping
 * between two headers on scroll is what produces the flicker you see on a lot of
 * marketplace sites, and it also breaks focus.
 *
 * The threshold is deliberately small. A header that stays transparent for
 * 400px of scroll leaves text sitting on top of product photography.
 */

const SCROLL_THRESHOLD = 8

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const openCart = useUiStore((state) => state.openCart)
  const { count: cartCount } = useCartCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        data-scrolled={scrolled}
        className={cn(
          'ease sticky top-0 z-header border-b transition-colors duration-base',
          scrolled ? 'border-line bg-background' : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-container items-center gap-6 px-gutter desktop:h-16">
          <Link
            href="/"
            aria-label={navLabels.home}
            className="shrink-0 text-ink focus-visible:outline-offset-4"
          >
            <Logo decorative />
          </Link>

          <nav
            aria-label={navLabels.mainNav}
            className="hidden flex-1 items-center gap-6 desktop:flex"
          >
            {primaryNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <HeaderAction href="/search" label={navLabels.search}>
              <Search className="size-5" strokeWidth={1.5} aria-hidden />
            </HeaderAction>

            {/*
              The profile, where the wishlist heart used to be. The saved list
              is not gone — it is the second item in the menu, which is a
              demotion it earns: a saved list is one of the things an account is
              for, not the only one. Everything else an account holds
              (purchases, addresses, cards, and the resale flow that runs off a
              purchase) previously had nowhere in the header at all.
            */}
            <ProfileMenu />

            {/*
              A button, not a link. It opens the drawer rather than navigating —
              a shopper checking their bag mid-browse should not lose the listing
              they were on. `/cart` remains a real route for the full view and
              for anyone who lands on it directly.
            */}
            <button
              type="button"
              onClick={openCart}
              aria-label={cartCount === 0 ? navLabels.cartEmpty : navLabels.cartCount(cartCount)}
              className="relative p-2 text-ink-muted transition-colors hover:text-ink"
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />
              <CartBadge />
            </button>

            <button
              type="button"
              onClick={openMobileNav}
              className="p-2 text-ink-muted transition-colors hover:text-ink desktop:hidden"
            >
              <span className="sr-only">{navLabels.openMenu}</span>
              <Menu className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileNav />
      <CartDrawer />
    </>
  )
}

function HeaderAction({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="relative p-2 text-ink-muted transition-colors hover:text-ink"
      aria-label={label}
    >
      {children}
    </Link>
  )
}
