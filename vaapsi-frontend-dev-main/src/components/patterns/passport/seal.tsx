'use client'

import { motion } from 'framer-motion'
import { Type } from '@/components/primitives/type'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { sealVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * The seal.
 *
 * On first view the accent dot presses in like a stamp — scaling down from
 * oversize onto its mark, with a slight overshoot settling out. One short,
 * weighted motion, once, and **it is the only moment like this on the site.**
 * That exclusivity is what makes it mean something: if three other things on the
 * page also had a signature gesture, none of them would.
 *
 * The gesture is `sealVariants` in `lib/motion`, and the `stamp` easing there is
 * the single sanctioned exception to the house curve — a stamp has mass, and the
 * one place a shopper should feel weight is the moment a garment's history is
 * asserted as verified.
 *
 * Under reduced motion it is simply present, at full size, in place. No shortened
 * animation, no fade — the settled state. There is no gap where a stamp was
 * going to land.
 */
export function Seal({
  label,
  className,
}: {
  /** What was verified, and by whom. Sits beside the mark. */
  label: string
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span className="relative flex size-6 items-center justify-center">
        {reduced ? (
          <span className="size-2.5 rounded-full bg-accent" aria-hidden />
        ) : (
          <motion.span
            aria-hidden
            className="size-2.5 rounded-full bg-accent"
            variants={sealVariants}
            initial="hidden"
            animate="shown"
          />
        )}
        {/* The ring the stamp lands inside. Present in both states, so nothing
            about the layout depends on the animation running. */}
        <span aria-hidden className="absolute inset-0 rounded-full border border-line-strong" />
      </span>

      <Type as="span" size="xs" tone="muted">
        {label}
      </Type>
    </span>
  )
}
