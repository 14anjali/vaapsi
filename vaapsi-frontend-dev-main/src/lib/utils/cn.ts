import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * `cn` — merge conditional class names, with later Tailwind utilities winning
 * over earlier conflicting ones. Used by every component in the app.
 *
 * ---
 *
 * The extension below is not optional. Our theme puts two different things
 * behind the `font-*` prefix:
 *
 *   font-display / font-body        → font-family  (--font-display, --font-body)
 *   font-regular / font-emphasis /
 *   font-heading                    → font-weight  (--weight-*)
 *
 * Out of the box, tailwind-merge treats any unrecognised `font-x` as a
 * font-family, so `cn('font-display', 'font-heading')` silently dropped
 * `font-display` — every heading in the app lost its display face the moment it
 * also asked for a weight. The CSS was correct; the merge was eating it.
 *
 * Teaching the merger which group each utility belongs to fixes it. If you add a
 * weight token, add its utility here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-weight': ['font-regular', 'font-emphasis', 'font-heading'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
