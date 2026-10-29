import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { cn } from '@/lib/utils'

/**
 * A figure, its unit, and where it came from.
 *
 * The impact block was two big numbers followed by a four-line methodology
 * paragraph, which is the right *information* in the wrong proportion — the
 * paragraph was longer than everything around it and nobody reads it.
 *
 * So the source is split: a short **attribution** stays visible under the
 * figure, and the full methodology sits in a disclosure. The rule that produced
 * the paragraph in the first place is preserved — a number without a stated
 * source is marketing — because the source is still named on the face of it.
 * What changes is that the reader gets "Levi Strauss LCA, 2015" at a glance and
 * the full sentence on demand.
 */
export function Stat({
  value,
  unit,
  className,
}: {
  value: string
  unit: string
  className?: string
}) {
  return (
    <Stack gap={0} className={cn('min-w-0', className)}>
      <Type as="p" family="display" size="3xl" weight="heading" numeric>
        {value}
      </Type>
      <Type size="xs" tone="muted">
        {unit}
      </Type>
    </Stack>
  )
}

/**
 * A row of figures sharing one source.
 *
 * `attribution` is the short form — the study and the year. `basis` is the full
 * methodology, behind a disclosure. Passing `basis` without `attribution` shows
 * the full text, so the honest path is the default rather than something a caller
 * has to remember.
 */
export function StatGroup({
  children,
  attribution,
  basis,
  className,
}: {
  children: React.ReactNode
  attribution?: string
  basis: string
  className?: string
}) {
  return (
    <Stack gap={4} className={className}>
      <Row gap={10} align="start">
        {children}
      </Row>

      {attribution === undefined ? (
        <Type size="xs" tone="subtle" measure="default">
          {basis}
        </Type>
      ) : (
        <details className="group/basis">
          <summary className="cursor-pointer text-xs text-ink-subtle transition-colors hover:text-ink-muted">
            {attribution}
            <span aria-hidden className="pl-1.5 group-open/basis:hidden">
              — how this is calculated
            </span>
          </summary>
          <Type size="xs" tone="subtle" measure="default" className="pt-2">
            {basis}
          </Type>
        </details>
      )}
    </Stack>
  )
}

/**
 * Pull a short attribution out of a full methodology sentence.
 *
 * The `basis` field is written as prose by whoever recorded it, so this takes the
 * leading clause up to the first em dash or the first sentence — which is where
 * the study name and year sit in every fixture and in the format the intake
 * process asks for. If it cannot find a sensible break it returns `undefined`,
 * and `StatGroup` then shows the full text rather than a bad truncation.
 */
export function attributionFrom(basis: string): string | undefined {
  const dash = basis.indexOf('—')
  const candidate = dash > 20 ? basis.slice(0, dash) : basis.split('. ')[0]
  if (candidate === undefined) return undefined
  const trimmed = candidate.trim().replace(/[,.]$/, '')
  // Too long to be a label, or so short it says nothing.
  if (trimmed.length < 12 || trimmed.length > 80) return undefined
  return trimmed
}
