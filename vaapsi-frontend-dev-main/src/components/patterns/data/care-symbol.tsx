import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import type { CareInstruction } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Care instructions as symbols.
 *
 * These were four empty bordered squares next to four lines of text — the
 * component was drawing a placeholder box where an icon should be, which read as
 * a broken image rather than as a deliberate gap. Four labelled empty squares is
 * the single worst thing on the current page.
 *
 * These are drawn from the GINETEX vocabulary — tub, triangle, iron, square,
 * circle, with a slash for a prohibition. Simple enough to be recognisable at
 * 20px and to survive print, and drawn in `currentColor` so they invert with the
 * theme.
 *
 * **The label stays.** An unlabelled care symbol is unreadable to most people —
 * which is a large part of why garments get ruined — so the icon buys the scan
 * and the text keeps the meaning. What it saves is the vertical stack: five
 * glyph-and-label pairs sit on one or two lines instead of five.
 *
 * Unknown codes fall back to a neutral mark rather than an empty box, so a code
 * the design has not seen yet degrades to "there is a rule here" instead of to
 * "something failed to load".
 */

type Glyph = 'tub' | 'triangle' | 'iron' | 'square' | 'circle' | 'hand' | 'dot'

/**
 * Code prefix → glyph and whether it is a prohibition.
 *
 * Matched by prefix so `wash_30`, `wash_30_inside` and `wash_rarely` all resolve
 * without the map having to know every variant the backend might send.
 */
const GLYPHS: readonly { prefix: string; glyph: Glyph; crossed: boolean }[] = [
  { prefix: 'no_bleach', glyph: 'triangle', crossed: true },
  { prefix: 'no_tumble', glyph: 'square', crossed: true },
  { prefix: 'no_machine', glyph: 'tub', crossed: true },
  { prefix: 'no_wring', glyph: 'hand', crossed: true },
  { prefix: 'no_iron', glyph: 'iron', crossed: true },
  { prefix: 'dryclean', glyph: 'circle', crossed: false },
  { prefix: 'spot_clean', glyph: 'circle', crossed: false },
  { prefix: 'handwash', glyph: 'hand', crossed: false },
  { prefix: 'wash', glyph: 'tub', crossed: false },
  { prefix: 'iron', glyph: 'iron', crossed: false },
  { prefix: 'dry_flat', glyph: 'square', crossed: false },
  { prefix: 'keep_dry', glyph: 'square', crossed: false },
  { prefix: 'expect_fade', glyph: 'dot', crossed: false },
]

function resolve(code: string): { glyph: Glyph; crossed: boolean } {
  const match = GLYPHS.find((entry) => code.startsWith(entry.prefix))
  return match ?? { glyph: 'dot', crossed: false }
}

export function CareSymbol({ code, className }: { code: string; className?: string }) {
  const { glyph, crossed } = resolve(code)

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-5 shrink-0 text-ink', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {glyph === 'tub' && <path d="M3 10h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2Z M6 10 9 5" />}
      {glyph === 'triangle' && <path d="M12 4 21 20H3Z" />}
      {glyph === 'iron' && <path d="M3 16h18l-2-7a3 3 0 0 0-3-2H8L3 16Z" />}
      {glyph === 'square' && <rect x="3.5" y="3.5" width="17" height="17" />}
      {glyph === 'circle' && <circle cx="12" cy="12" r="8.5" />}
      {glyph === 'hand' && (
        <path d="M3 11h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2Z M9 8V4M13 8V3M17 8V5" />
      )}
      {glyph === 'dot' && <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />}

      {/* The prohibition slash. Drawn last so it sits over the glyph. */}
      {crossed && <path d="M4 20 20 4" />}
    </svg>
  )
}

/**
 * The full set for a garment. Wraps, so five instructions take one or two lines
 * rather than five.
 */
export function CareSymbols({
  instructions,
  className,
}: {
  instructions: readonly CareInstruction[]
  className?: string
}) {
  if (instructions.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-3', className)}>
      {instructions.map((instruction) => (
        <li key={instruction.code}>
          <Row gap={2} align="center" wrap={false}>
            <CareSymbol code={instruction.code} />
            <Type as="span" size="xs" tone="muted">
              {instruction.label}
            </Type>
          </Row>
        </li>
      ))}
    </ul>
  )
}
