import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { passportCopy } from '@/content/passport'
import type { Provenance } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Provenance, encoded by **fill** — never by colour.
 *
 *   solid    verified        checked by us or a named party
 *   half     supplier        from the brand or manufacturer
 *   hollow   self_declared   told to us, unchecked
 *   dashed   ai_suggested    inferred by software
 *   dotted   ai_extracted    read off a label by software
 *
 * The constraint is the point. This mark has to work in pure monochrome, at 8px,
 * and photocopied onto a care label sewn inside a garment — which rules out a
 * colour-coded badge set entirely. A red/amber/green system would also be
 * unreadable to a colour-blind shopper and would imply "good / warning / bad",
 * when `supplier` is not worse than `verified`, it is differently sourced.
 *
 * Drawn as SVG rather than CSS borders so the dash pattern survives scaling and
 * printing, where a 1px dashed border tends to render as solid.
 *
 * The legend is available on demand rather than always visible. A permanent key
 * beside every value would be louder than the values.
 */

const R = 5
const CENTRE = 6
const STROKE = 1.5

export function ProvenanceDot({
  provenance,
  className,
  decorative = false,
}: {
  provenance: Provenance
  className?: string
  /**
   * Inside the legend the mark sits next to its own explanation, so labelling it
   * as well gives a screen reader the same sentence twice. Everywhere else it is
   * the only thing carrying the meaning and must be labelled.
   */
  decorative?: boolean
}) {
  const label = passportCopy.provenance[provenance]

  return (
    <svg
      viewBox="0 0 12 12"
      className={cn('size-3 shrink-0 text-ink', className)}
      {...(decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': label })}
    >
      {!decorative && <title>{label}</title>}
      {provenance === 'verified' && <circle cx={CENTRE} cy={CENTRE} r={R} fill="currentColor" />}

      {provenance === 'supplier' && (
        <>
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          {/* Left half filled. A half, not a gradient. */}
          <path d={`M ${CENTRE} 1 A ${R} ${R} 0 0 0 ${CENTRE} 11 Z`} fill="currentColor" />
        </>
      )}

      {provenance === 'self_declared' && (
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
        />
      )}

      {provenance === 'ai_extracted' && (
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeDasharray="1 2"
          strokeLinecap="round"
        />
      )}

      {provenance === 'ai_suggested' && (
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeDasharray="3 3"
        />
      )}
    </svg>
  )
}

/**
 * A sourced value with its mark. The workhorse of the whole passport.
 *
 * The mark sits *after* the value, not before. A shopper reads the fact first
 * and the confidence second, which is the right order — leading with the mark
 * turns every line into an audit.
 */
export function SourcedValue({
  value,
  provenance,
  className,
  size = 'sm',
}: {
  value: React.ReactNode
  provenance: Provenance
  className?: string
  size?: 'xs' | 'sm' | 'base'
}) {
  return (
    <Row gap={2} align="center" wrap={false} className={cn('min-w-0', className)}>
      <Type as="span" size={size} tone="inherit">
        {value}
      </Type>
      <ProvenanceDot provenance={provenance} />
    </Row>
  )
}

/** The legend. Rendered inside a disclosure, not always on. */
export function ProvenanceLegend() {
  const order: readonly Provenance[] = [
    'verified',
    'supplier',
    'self_declared',
    'ai_extracted',
    'ai_suggested',
  ]

  return (
    <Stack gap={3}>
      <Type as="p" size="xs" tone="subtle" tracking="caps">
        {passportCopy.provenance.legendTitle}
      </Type>
      <Stack gap={2} as="dl">
        {order.map((provenance) => (
          <Row key={provenance} gap={3} align="center" wrap={false}>
            <dt className="shrink-0">
              <ProvenanceDot provenance={provenance} decorative />
            </dt>
            <Type as="dd" size="xs" tone="muted">
              {passportCopy.provenance[provenance]}
            </Type>
          </Row>
        ))}
      </Stack>
    </Stack>
  )
}
