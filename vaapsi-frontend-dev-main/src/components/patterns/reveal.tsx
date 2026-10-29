'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import {
  STAGGER,
  revealVariants,
  revealViewport,
  staggerItemVariants,
  staggerVariants,
} from '@/lib/motion'

/**
 * The site's two motion wrappers.
 *
 * `Reveal` fades a block up on scroll. `Stagger` orchestrates a group into a
 * short arrival sequence on load.
 *
 * Neither defines a duration, an easing or a distance — those all come from
 * `lib/motion`, which is the single place motion is described. See the hierarchy
 * documented there.
 *
 * When motion is off, both render their children in the settled state with no
 * wrapper animation at all. Not a shortened animation: the final state,
 * immediately. A reduced-motion user must never see a gap where something was
 * going to arrive.
 */

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="shown"
      viewport={revealViewport}
      transition={{ delay }}
    >
      {children}
    </Component>
  )
}

/**
 * Page-load sequence container. Used **once**, in the home hero — a site where
 * everything staggers is a site where nothing is emphasised.
 */
export function Stagger({
  children,
  className,
  delay = STAGGER.delay,
  step = STAGGER.step,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  step?: number
  as?: 'div' | 'section'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component
      className={className}
      variants={staggerVariants(delay, step)}
      initial="hidden"
      animate="shown"
    >
      {children}
    </Component>
  )
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'li' | 'span'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component className={className} variants={staggerItemVariants}>
      {children}
    </Component>
  )
}
