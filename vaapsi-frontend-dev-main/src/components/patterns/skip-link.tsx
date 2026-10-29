import { navLabels } from '@/content/navigation'

/**
 * Skip-to-content link.
 *
 * Visually hidden until focused, then it appears in place rather than sliding
 * in — a keyboard user who has just pressed Tab wants to read it, not watch it
 * arrive. Points at `#main`, which the root layout puts on the <main> element.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-ink text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-4 focus:py-2 focus:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      {navLabels.skipToContent}
    </a>
  )
}
