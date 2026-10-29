'use client'

import { motion } from 'framer-motion'
import { useCartCount } from './use-cart'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { badgeVariants } from '@/lib/motion'

/**
 * The count on the header bag.
 *
 * The add-to-bag feedback is **this and nothing else**: one short, weighted
 * transition on the badge, the same easing family as the passport stamp at lower
 * amplitude. No flying image arc from the product to the header — that is a
 * 2014 gesture, it needs the two elements to be on screen simultaneously, and it
 * takes 600ms to say something a 160ms scale says better.
 *
 * The badge is the accent dot grown up to hold a number. Same mark, same
 * meaning: something here wants your attention.
 *
 * Renders nothing until the persisted cart has been read, rather than rendering
 * a zero that jumps to three.
 */
export function CartBadge() {
  const { count, hydrated } = useCartCount()
  const reduced = useReducedMotion()

  if (!hydrated || count === 0) return null

  const label = count > 9 ? '9+' : String(count)

  if (reduced) {
    return (
      <span
        aria-hidden
        className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] tabular-nums leading-none text-accent-ink"
      >
        {label}
      </span>
    )
  }

  return (
    <motion.span
      aria-hidden
      // Keyed on the count, so the animation replays each time it changes rather
      // than only on first mount.
      key={count}
      className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] tabular-nums leading-none text-accent-ink"
      variants={badgeVariants}
      initial="hidden"
      animate="shown"
    >
      {label}
    </motion.span>
  )
}
