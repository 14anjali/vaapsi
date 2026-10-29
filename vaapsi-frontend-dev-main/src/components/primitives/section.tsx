import { Container } from './layout'
import { Eyebrow, Type } from './type'
import { cn } from '@/lib/utils'

/**
 * A page section, with the site's vertical rhythm and its heading pattern.
 *
 * Written to fix two things at once. The rhythm was hardcoded in eight
 * components with three drifting values, which is a consistency problem; and the
 * values themselves were generous enough that a five-section page was mostly
 * padding, which is a scroll problem. Both are now one token.
 *
 * The eyebrow + heading + lede block is here too, because it was being rebuilt
 * by hand in every section and the gaps were never quite the same twice.
 *
 * ## On density
 *
 * The reference register is still Zara / COS. But that reference works at a
 * scale where a section is a full-bleed photograph filling the viewport —
 * copying its padding onto a section holding four cards and a paragraph gives
 * you dead space, not restraint. Restraint is about how much is on the page, not
 * how far apart it sits.
 */

export type SectionProps = {
  /**
   * `default` — between major sections.
   * `tight` — for a section that reads as a continuation of the one above.
   * `flush` — no vertical padding; the caller owns it.
   */
  space?: 'default' | 'tight' | 'flush'
  /** A hairline above the section. The usual way sections are separated here. */
  divider?: boolean
  /** Fill behind the section, to group it visually instead of with space. */
  tone?: 'none' | 'surface'
  /** Skip the Container when the section needs to bleed to the viewport edge. */
  bleed?: boolean

  eyebrow?: string
  heading?: string
  /** Standfirst under the heading. */
  lede?: string
  /** Sits opposite the heading — usually a link. */
  action?: React.ReactNode
  /** Heading level. Sections on a page with an h1 should be h2. */
  headingAs?: 'h2' | 'h3'
  /** Heading size. Smaller for a subsection. */
  headingSize?: 'xl' | '2xl' | '3xl'
  /** `id` for `aria-labelledby`, wired automatically when a heading is given. */
  id?: string

  className?: string
  children?: React.ReactNode
}

const SPACE = {
  default: 'py-section',
  tight: 'py-section-tight',
  flush: '',
} as const

export function Section({
  space = 'default',
  divider = false,
  tone = 'none',
  bleed = false,
  eyebrow,
  heading,
  lede,
  action,
  headingAs = 'h2',
  headingSize = '2xl',
  id,
  className,
  children,
}: SectionProps) {
  const headingId = heading === undefined ? undefined : (id ?? slugify(heading))
  const hasHeader = eyebrow !== undefined || heading !== undefined || lede !== undefined

  const header = hasHeader ? (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-3',
        // Tighter than it was. A heading block that pushes its content most of a
        // screen down is a heading block competing with the content.
        'pb-6 desktop:pb-8',
      )}
    >
      <div className="min-w-0">
        {eyebrow !== undefined && <Eyebrow>{eyebrow}</Eyebrow>}
        {heading !== undefined && (
          <Type
            as={headingAs}
            id={headingId}
            family="display"
            size={headingSize}
            weight="heading"
            className={eyebrow === undefined ? undefined : 'mt-2'}
          >
            {heading}
          </Type>
        )}
        {lede !== undefined && (
          <Type size="base" tone="muted" measure="default" className="mt-2">
            {lede}
          </Type>
        )}
      </div>
      {/*
        `ml-auto` as well as `justify-between`. The header wraps, and once the
        action drops to its own line it is the only item on that line, where
        `justify-between` puts it at the start — so a right-aligned control
        silently becomes a left-aligned one at the widths where the heading and
        the lede are longest.
      */}
      {action !== undefined && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  ) : null

  const body = (
    <>
      {header}
      {children}
    </>
  )

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        SPACE[space],
        divider && 'border-t border-line',
        tone === 'surface' && 'bg-surface',
        className,
      )}
    >
      {bleed ? body : <Container>{body}</Container>}
    </section>
  )
}

function slugify(text: string): string {
  return `s-${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}
