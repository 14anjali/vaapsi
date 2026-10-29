import { Container } from '@/components/primitives/layout'
import { states } from '@/content/states'

/**
 * Route-level loading state.
 *
 * The indicator is the accent dot, pulsing. Same mark as the wordmark, the
 * active nav item and the verification seal — the third job the dot does, and
 * the reason there is no spinner anywhere on this site.
 *
 * Deliberately quiet: a full-page skeleton at route level guesses at a layout it
 * does not know. Route segments that *do* know their layout — the product grid
 * in Phase 4 — ship their own skeletons matching their real dimensions.
 *
 * The pulse is CSS, so `prefers-reduced-motion` in globals.css already stills it
 * without this file needing to know.
 */
export default function Loading() {
  return (
    <Container>
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[50vh] items-center justify-center"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
        <span className="sr-only">{states.loading.announce}</span>
      </div>
    </Container>
  )
}
