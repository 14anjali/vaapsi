/**
 * Shared copy. Every user-facing string in the app comes from a module in
 * `content/` — never inlined into JSX — so a locale layer can be added later
 * without touching a single component.
 */
export const common = {
  brand: {
    name: 'vaapsi',
    tagline: 'Circular fashion, India',
    parent: 'A BTR Global brand',
  },
  meta: {
    title: 'vaapsi',
    description: 'Pre-loved clothing with a verified history.',
  },
} as const
