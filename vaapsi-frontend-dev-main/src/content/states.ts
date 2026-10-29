/**
 * Loading, error and empty copy.
 *
 * House rule: an error says what happened and what to do next. It does not
 * apologise, it does not say "oops", and it does not blame the shopper. Nobody
 * has ever felt better about a failed page because it was sorry.
 *
 * Second rule: never claim to know more than we do. "Something went wrong" is
 * honest when we genuinely do not know which thing; inventing a specific cause
 * is worse than admitting the vagueness.
 */
export const states = {
  loading: {
    /** Screen-reader announcement while a route is resolving. */
    announce: 'Loading',
  },

  error: {
    eyebrow: 'Error',
    title: 'This page did not load',
    body: 'The problem is on our side, not yours. Trying again usually works — the page may have been mid-deploy.',
    retry: 'Try again',
    home: 'Go to the home page',
    /** Shown above the technical detail, which only appears in development. */
    detail: 'Technical detail',
  },

  notFound: {
    eyebrow: '404',
    title: 'There is nothing at this address',
    body: 'The link may be old, or the garment may have sold. Every piece here is one of one, so listings do disappear for good.',
    shop: 'Browse what is available',
    home: 'Go to the home page',
  },

  productGone: {
    title: 'This garment has sold',
    body: 'There was only one. We do not restock — but there may be something close.',
    action: 'See similar pieces',
  },

  emptyCart: {
    title: 'Your bag is empty',
    body: 'Nothing here yet.',
    action: 'Start browsing',
  },

  /** Placeholder copy for routes scaffolded but not yet designed. */
  comingInPhase: (what: string) => `${what} — not built yet.`,
} as const
