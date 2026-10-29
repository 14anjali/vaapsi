'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Logo } from './logo'
import { NavLink } from './nav-link'
import { Overlay } from '@/components/primitives/overlay'
import { Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { footerNav, navLabels, primaryNav } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'

/**
 * Full-height mobile navigation drawer.
 *
 * The focus trap, the scroll lock, the Escape handler and the
 * unfocusable-while-closed behaviour all come from `Overlay`, which the filter
 * sheet and the cart drawer also use. Three panels, one trap — so a fix to the
 * trap fixes all of them, which is the whole reason it was extracted.
 *
 * The one thing specific to this panel: it closes on route change. Without that,
 * tapping a link leaves the drawer sitting over the page it just navigated to.
 */
export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen)
  const close = useUiStore((state) => state.closeMobileNav)
  const pathname = usePathname()

  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <Overlay open={open} onClose={close} label={navLabels.mainNav} side="right" hideAbove="desktop">
      <div className="flex items-center justify-between border-b border-line px-gutter py-4">
        <Link href="/" aria-label={navLabels.home} className="text-ink">
          <Logo decorative />
        </Link>
        <button
          type="button"
          onClick={close}
          className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <span className="sr-only">{navLabels.closeMenu}</span>
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <nav aria-label={navLabels.mainNav} className="flex-1 overflow-y-auto px-gutter py-8">
        <Stack gap={5} as="ul">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} size="large" onNavigate={close} />
            </li>
          ))}
        </Stack>

        <div className="mt-12 border-t border-line pt-8">
          <Stack gap={8}>
            {footerNav
              .filter((group) => group.heading !== 'Legal')
              .map((group) => (
                <div key={group.heading}>
                  <Eyebrow>{group.heading}</Eyebrow>
                  <Stack gap={2} as="ul" className="mt-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className="text-sm text-ink-muted transition-colors hover:text-ink"
                        >
                          <Type as="span" size="sm" tone="inherit">
                            {item.label}
                          </Type>
                        </Link>
                      </li>
                    ))}
                  </Stack>
                </div>
              ))}
          </Stack>
        </div>
      </nav>
    </Overlay>
  )
}
