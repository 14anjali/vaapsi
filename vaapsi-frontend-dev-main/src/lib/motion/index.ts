/**
 * ============================================================================
 * The site's motion system. Every animation in the app resolves to this file.
 * ============================================================================
 *
 * **No component defines its own duration or easing inline.** If one needs an
 * exception, the exception is declared here with the reason written next to it.
 * That rule is the whole point: motion built phase by phase does not agree with
 * itself, and a site whose transitions each move slightly differently reads as
 * restless without anyone being able to say why.
 *
 * ## The one sentence
 *
 * *Vaapsi settles into place — quickly, once, and without ceremony, except for
 * the single moment where a garment's history is stamped as verified.*
 *
 * ## The hierarchy
 *
 * Everything below sits under the thing above it. Amplitude and weight decrease
 * as you go down, and nothing lower may draw more attention than something
 * higher.
 *
 *   1. **The passport seal.** The one moment with real mass. A stamp pressing
 *      in. Once per passport view, nowhere else on the site.
 *   2. **Home hero load.** A short staggered arrival, so the page assembles
 *      rather than appearing.
 *   3. **Scroll reveals.** Low amplitude, fired once, never re-triggering on
 *      scroll back up. A page that re-animates is a page that cannot settle.
 *   4. **Hover and focus.** Under 200ms, cross-fades rather than transforms.
 *
 * ## The technical floor
 *
 * - `transform` and `opacity` only. Never width, height, top, left or margin —
 *   those animate on the layout thread and cause shift.
 * - No animation may cause cumulative layout shift. Anything that reveals must
 *   already occupy its final space.
 * - `will-change` only while an animation is actually running. Framer Motion
 *   handles that for us; do not add it by hand in CSS.
 * - Every animated component reads `useReducedMotion` and renders the settled
 *   state when motion is off — not a shortened animation, not a fade. The final
 *   state, immediately, with no gap where something was going to arrive.
 *
 * ## Kept in step with CSS
 *
 * The durations below mirror `--duration-*` in `styles/tokens.css`, in seconds
 * because that is what Framer Motion takes. A test asserts the two stay equal,
 * so a token change cannot silently desync the JS animations from the CSS ones.
 */

/** Seconds. Mirrors `--duration-*` in tokens.css. */
export const DURATION = {
  instant: 0.08,
  fast: 0.16,
  base: 0.26,
  slow: 0.42,
  slower: 0.64,
} as const

/**
 * Easings, as Framer's cubic-bezier array form.
 *
 * `house` is `--ease` from tokens.css and is used by everything. `exit` is its
 * accelerating counterpart, for things leaving. `stamp` is the single sanctioned
 * exception: fast in, hard stop, small settle. It exists because a stamp has
 * mass, and the one place a shopper should feel weight is the moment a garment's
 * history is asserted as verified.
 */
export const EASE = {
  house: [0.22, 0.61, 0.36, 1],
  exit: [0.55, 0, 0.55, 0.2],
  stamp: [0.16, 0.9, 0.2, 1],
} as const

/** Travel distances in px. Small on purpose — things settle, they do not fly. */
export const TRAVEL = {
  /** Scroll reveals and hero items. */
  subtle: 12,
  /** Nothing in the app currently needs more than this. */
  standard: 20,
} as const

export const MOTION = { duration: DURATION, ease: EASE, travel: TRAVEL } as const

// ---------------------------------------------------------------------------
// Shared variants
// ---------------------------------------------------------------------------

import type { Transition, Variants } from 'framer-motion'

const houseTransition: Transition = { duration: DURATION.slow, ease: EASE.house }

/** Scroll reveal. Fade up, low amplitude, fired once. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: TRAVEL.subtle },
  shown: { opacity: 1, y: 0, transition: houseTransition },
}

/** The viewport config for a reveal. `once` is not negotiable — see the hierarchy. */
export const revealViewport = { once: true, margin: '-64px' } as const

/**
 * Page-load orchestration. The parent holds no visual state of its own; it only
 * schedules its children.
 */
export function staggerVariants(delayChildren: number, staggerChildren: number): Variants {
  return {
    hidden: {},
    shown: { transition: { delayChildren, staggerChildren } },
  }
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: TRAVEL.subtle },
  shown: { opacity: 1, y: 0, transition: houseTransition },
}

/** Default orchestration timings for the hero. */
export const STAGGER = { delay: 0.05, step: 0.07 } as const

/**
 * The seal. Scales down from oversize onto its mark with a small overshoot.
 *
 * The keyframe array rather than a spring: a spring is tuneable in ways that
 * invite fiddling, and this gesture needs to be identical every time a shopper
 * sees it. It is a stamp, not a bounce.
 */
export const sealVariants: Variants = {
  hidden: { scale: 6, opacity: 0 },
  shown: {
    scale: [6, 0.9, 1],
    opacity: [0, 1, 1],
    transition: { duration: DURATION.slow, times: [0, 0.72, 1], ease: EASE.stamp },
  },
}

/** The cart badge. The seal's gesture at lower amplitude and half the duration. */
export const badgeVariants: Variants = {
  hidden: { scale: 0.4 },
  shown: {
    scale: [0.4, 1.18, 1],
    transition: { duration: DURATION.fast, times: [0, 0.6, 1], ease: EASE.stamp },
  },
}
