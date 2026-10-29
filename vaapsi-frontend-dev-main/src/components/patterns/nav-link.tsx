'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dot } from './logo'
import type { NavItem } from '@/content/navigation'
import { cn } from '@/lib/utils'

/**
 * A primary nav item.
 *
 * The active item is marked with the accent dot, not an underline. This is the
 * first place in the interface where the wordmark's own logic shows up: the dot
 * over the "i" means "this one", and here it means "you are here". Same mark,
 * same meaning, so the brand teaches the interface rather than decorating it.
 *
 * The dot is rendered in a fixed-width slot whether or not it is visible, so an
 * item does not shift when it becomes active.
 */

/** Does `pathname` sit inside this nav item's section? */
export function isActive(item: NavItem, pathname: string): boolean {
  const target = item.href.split('?')[0] ?? item.href
  if (item.exact === true || target === '/') return pathname === target
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function NavLink({
  item,
  size = 'default',
  onNavigate,
}: {
  item: NavItem
  size?: 'default' | 'large'
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = isActive(item, pathname)

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'ease group inline-flex items-center gap-2 transition-colors duration-fast',
        size === 'large' ? 'text-2xl' : 'text-sm',
        active ? 'text-ink' : 'text-ink-muted hover:text-ink',
      )}
    >
      {/* Fixed slot: reserved whether or not the dot is showing, so the label
          never moves when the active item changes. */}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          size === 'large' ? 'w-2' : 'w-1.5',
        )}
      >
        {active && <Dot size={size === 'large' ? 'default' : 'small'} />}
      </span>
      {item.label}
    </Link>
  )
}
