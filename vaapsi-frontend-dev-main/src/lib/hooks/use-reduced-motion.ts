'use client'

import { useEffect, useState } from 'react'

/**
 * The single source of truth for whether we animate.
 *
 * **Every animated component in the app uses this hook.** Not
 * `window.matchMedia` inline, not Framer Motion's own `useReducedMotion`, not a
 * CSS-only guard. One hook, so the answer is the same everywhere and there is
 * one place to check when a motion bug turns up.
 *
 * Starts at `true` — motion off — and flips on after mount if the user has not
 * asked for reduced motion. That default matters: it means the server-rendered
 * HTML is the final, settled state. A component that animates in from opacity 0
 * would otherwise render invisible on the server and stay invisible for anyone
 * whose JavaScript is slow or broken.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    // `matchMedia` is absent in jsdom and in a few older webviews. Bail out
    // rather than throwing, which leaves `reduced` at its safe default of true:
    // if we cannot ask, we do not animate.
    if (typeof window.matchMedia !== 'function') return

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Convenience inverse, for the common `animate={shouldAnimate ? ... : false}`
 * shape. Reads better at call sites than `!useReducedMotion()`.
 */
export function useShouldAnimate(): boolean {
  return !useReducedMotion()
}
