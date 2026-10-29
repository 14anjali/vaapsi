'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { useSession, useSignOut } from '@/components/patterns/auth/use-session'
import { accountCopy } from '@/content/account'
import { authCopy } from '@/content/auth'
import { cn } from '@/lib/utils'

/**
 * The profile control in the header.
 *
 * ## Why it took the wishlist's place
 *
 * The heart was one saved list behind a permanent slot in the header. Everything
 * an account holds — purchases, addresses, cards, and the resale flow that runs
 * off a purchase — had nowhere to live at all. The wishlist is not gone; it is
 * the first item in this menu, which is a demotion it earns: a saved list is one
 * of the things an account is for, not the only one.
 *
 * ## A menu, not a route
 *
 * It opens in place. Every destination in here is a page, but the *chooser*
 * should not cost a navigation — a shopper opening the profile mid-browse to
 * check an order should not lose the listing they were on. The same reasoning as
 * the bag drawer beside it.
 *
 * Closes on Escape, on an outside click, and on navigation — that last one for
 * the same reason the bag drawer does it: every item in here leaves the page,
 * and a menu left hanging over the destination hides what was asked for.
 *
 * ## Purchases sit at the top, and say why
 *
 * They are the entry point to resale — the only legitimate one, since a listing
 * has to start from something you actually bought. The item carries that as its
 * own line of copy rather than leaving "Sell something" as an orphan action
 * elsewhere in the menu with no route into it.
 *
 * ## Two states, and nothing in between
 *
 * Signed out, the menu offers sign-in and sign-up and nothing else — listing
 * account destinations to a visitor who cannot open them is a menu of dead
 * ends. Signed in, it names who they are and ends with sign out.
 *
 * While the session is still resolving it renders neither: the fetch is fast
 * and local, and guessing wrong means a signed-in shopper sees "Sign in" for a
 * frame, which reads as having been logged out.
 */
export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, isResolved } = useSession()
  const signOut = useSignOut()

  // Close on navigation. Same rule as `CartDrawer`, and fires only on a change
  // so mounting while open cannot shut it.
  const lastPathname = useRef(pathname)
  useEffect(() => {
    if (lastPathname.current === pathname) return
    lastPathname.current = pathname
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node) === false) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={accountCopy.menu.trigger}
        className="p-2 text-ink-muted transition-colors hover:text-ink"
      >
        <User className="size-5" strokeWidth={1.5} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={accountCopy.menu.trigger}
          // Above the header it sits in, and anchored to the right edge so it
          // never runs off-screen on a narrow viewport.
          className="absolute right-0 top-full z-overlay mt-2 w-64 border border-line bg-background p-2 shadow-overlay"
        >
          <Stack gap={0}>
            <div className="border-b border-line px-3 pb-3 pt-2">
              {user !== null ? (
                <>
                  <Type as="p" size="sm" weight="emphasis" truncate>
                    {user.fullName ?? accountCopy.menu.greeting}
                  </Type>
                  <Type as="p" size="xs" tone="subtle" truncate>
                    {user.email ?? user.phone ?? ''}
                  </Type>
                </>
              ) : (
                <>
                  <Type as="p" size="sm" weight="emphasis">
                    {accountCopy.menu.greeting}
                  </Type>
                  <Type as="p" size="xs" tone="subtle" truncate>
                    {authCopy.session.guestNote}
                  </Type>
                </>
              )}
            </div>

            {/*
              Nothing until the session is known. See the note at the top — a
              brief flash of "Sign in" at a signed-in shopper is worse than a
              brief gap.
            */}
            {isResolved &&
              (user !== null ? (
                <>
                  {accountCopy.menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={cn(
                        'ease block px-3 py-2.5 transition-colors duration-fast hover:bg-surface',
                      )}
                    >
                      <Type as="span" size="sm">
                        {item.label}
                      </Type>
                      {item.note !== undefined && (
                        <Type as="span" size="xs" tone="subtle" className="mt-0.5 block">
                          {item.note}
                        </Type>
                      )}
                    </Link>
                  ))}

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut.mutate()}
                    disabled={signOut.isPending}
                    className="ease mt-1 block w-full border-t border-line px-3 py-2.5 text-left transition-colors duration-fast hover:bg-surface disabled:opacity-50"
                  >
                    <Type as="span" size="sm">
                      {signOut.isPending ? authCopy.session.signingOut : authCopy.session.signOut}
                    </Type>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    role="menuitem"
                    className="ease block px-3 py-2.5 transition-colors duration-fast hover:bg-surface"
                  >
                    <Type as="span" size="sm" weight="emphasis">
                      {authCopy.session.signIn}
                    </Type>
                  </Link>
                  <Link
                    href="/signup"
                    role="menuitem"
                    className="ease block px-3 py-2.5 transition-colors duration-fast hover:bg-surface"
                  >
                    <Type as="span" size="sm">
                      {authCopy.session.signUp}
                    </Type>
                  </Link>
                </>
              ))}
          </Stack>
        </div>
      )}
    </div>
  )
}
