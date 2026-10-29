'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * One overlay panel, used by the nav drawer, the filter sheet, the cart drawer
 * and the checkout confirmation modal.
 *
 * Written in Phase 6 because that was the third time the same forty lines of
 * focus trapping got copied, and three is where a pattern stops being a
 * coincidence. The behaviour was already identical in all three; now it is
 * identical *by construction*, which means a fix to the trap fixes every panel.
 *
 * What it guarantees:
 *
 * - Escape closes.
 * - Tab cycles inside the panel and cannot leave it.
 * - Focus moves in on open and returns to the trigger on close.
 * - The page behind it does not scroll.
 * - While closed it is `invisible`, which removes it from the tab order **in
 *   CSS** — so it holds before hydration too. `inert` would be the modern
 *   answer, but React 18 silently drops boolean values for attributes it does
 *   not know, so it can only be set after mount.
 * - It stays mounted, so it can transition out instead of vanishing.
 */

export type OverlayProps = {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog. */
  label: string
  /**
   * `right` — side drawer. `bottom` — mobile sheet. `center` — a modal.
   *
   * The three are not interchangeable, and the choice is about where the
   * content belongs rather than about how it looks. A drawer is a *place* — the
   * bag, the filters, the nav are all persistent things you slide open and
   * shut, and they arrive from the edge because that is where they live. A
   * modal is a *moment*: it has no home to slide back to, it is the only thing
   * on screen while it is up, and it is answered rather than browsed.
   *
   * Sending a confirmation gate in from the right edge was the wrong one of
   * those. It read as "here is another panel to look through" at the exact
   * moment the interface needs to stop the shopper and ask one question.
   */
  side?: 'right' | 'bottom' | 'center'
  /** Breakpoint above which the panel is hidden entirely. */
  hideAbove?: 'desktop' | 'never'
  children: React.ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Overlay({
  open,
  onClose,
  label,
  side = 'right',
  hideAbove = 'never',
  children,
  className,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Lock the page behind the panel.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Move focus in on open; put it back where it was on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    } else {
      previouslyFocused.current?.focus()
    }
  }, [open])

  // Escape closes; Tab cycles.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (panel === null) return

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (first === undefined || last === undefined) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Rendered into `document.body`, not in place.
  //
  // A drawer is `fixed inset-0 z-50`, which is only above the sticky header
  // (`z-40`) if the two are compared in the same stacking context. Rendered
  // inline, a drawer opened from deep in the page — the size guide and the
  // details drawer both live inside the product page's sticky buy column —
  // resolves its z-index against that ancestor instead, and the header paints
  // over the top of it. Which is exactly what happened: the search, wishlist
  // and bag icons sat on top of an open size guide.
  //
  // A portal takes the panel out of every ancestor's stacking and clipping
  // context, so `z-50` means what it says wherever the drawer is triggered
  // from. It also means an ancestor with `overflow: hidden`, a `transform` or a
  // `filter` can never clip a drawer — the same class of bug, waiting.
  //
  // SSR: `document` does not exist on the server, so the first client render
  // mounts nothing and the effect below flips `mounted`. A drawer is closed on
  // load anyway, so there is nothing to see in that frame.
  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        'ease fixed inset-0 z-overlay transition-[visibility] duration-base',
        hideAbove === 'desktop' && 'desktop:hidden',
        // A modal is centred here rather than positioned absolutely, so its
        // height follows its content. The scrim below is absolute, so it stays
        // out of this flex flow and still covers the viewport.
        side === 'center' && 'flex items-center justify-center p-4',
        open ? 'visible' : 'pointer-events-none invisible',
      )}
      aria-hidden={!open}
    >
      {/*
        Scrim. A div, not a button: tapping it is a mouse and touch convenience,
        and the keyboard route out is Escape. A labelled button here would give a
        screen reader a second identical "close" control.
      */}
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          'ease absolute inset-0 bg-ink/20 transition-opacity duration-base',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label={label}
        className={cn(
          'ease flex flex-col bg-background',
          side !== 'center' && 'absolute transition-transform duration-base',
          side === 'right' && 'inset-y-0 right-0 w-full max-w-sm',
          side === 'bottom' && 'inset-x-0 bottom-0 max-h-[85vh] shadow-sheet',
          side === 'right' && (open ? 'translate-x-0' : 'translate-x-full'),
          side === 'bottom' && (open ? 'translate-y-0' : 'translate-y-full'),
          /*
            A modal fades and scales rather than sliding, and the scale is 0.98,
            not 0.9. A modal that springs open draws attention to the animation;
            this one should draw attention to the question, so the movement is
            just enough to register that a panel arrived rather than cut in.
            Reduced motion keeps the fade and drops the scale.
          */
          side === 'center' &&
            'ease max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto shadow-overlay transition-[opacity,transform] duration-base motion-reduce:scale-100 motion-reduce:transition-opacity',
          side === 'center' && (open ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'),
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
