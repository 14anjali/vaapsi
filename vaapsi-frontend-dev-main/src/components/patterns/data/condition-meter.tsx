import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { conditionCopy } from '@/content/product'
import { CONDITIONS, conditionRank } from '@/lib/types'
import type { Condition } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Where this garment sits on the five-level scale.
 *
 * The condition block used to open with a heading, a full definition paragraph
 * and the inspector's prose — three blocks of text before a shopper learned
 * anything they could act on. A scale is inherently comparative, and comparison
 * is what a shopper is actually doing: *is this the good one or the rough one?*
 * Five segments answers that instantly; the definition then confirms it.
 *
 * Deliberately **not** a progress bar and not a score. Five discrete segments
 * with the current one filled, because a continuous bar implies a measurement
 * and this is a judgement made by a person holding the garment. The rank is
 * shown as `3/5` rather than a percentage for the same reason.
 *
 * Ends are labelled so the direction cannot be misread. Without them a filled
 * left-hand segment could mean "worst" or "first".
 */
export function ConditionMeter({
  condition,
  className,
}: {
  condition: Condition
  className?: string
}) {
  const rank = conditionRank(condition)
  const copy = conditionCopy[condition]

  return (
    <Stack gap={2} className={cn('min-w-0', className)}>
      <Row gap={3} justify="between" align="baseline">
        <Row gap={2} align="baseline">
          <Type as="p" family="display" size="xl" weight="heading">
            {copy.label}
          </Type>
          <Type as="span" size="xs" tone="subtle" numeric>
            {rank}/{CONDITIONS.length}
          </Type>
        </Row>
        <Type as="span" size="xs" tone="subtle">
          {copy.short}
        </Type>
      </Row>

      <div
        className="flex gap-1"
        role="img"
        aria-label={`${copy.label}, ${rank} of ${CONDITIONS.length} on the condition scale`}
      >
        {CONDITIONS.map((step, index) => (
          <span
            key={step}
            aria-hidden
            className={cn(
              'h-1 flex-1 rounded-sm',
              // Filled up to and including the current grade, so the eye reads a
              // position on a scale rather than a lit-up single cell.
              index < rank ? 'bg-ink' : 'bg-line',
            )}
          />
        ))}
      </div>

      <Row gap={3} justify="between">
        <Type as="span" size="xs" tone="subtle">
          {conditionCopy[CONDITIONS[0] as Condition].label}
        </Type>
        <Type as="span" size="xs" tone="subtle">
          {conditionCopy[CONDITIONS[CONDITIONS.length - 1] as Condition].label}
        </Type>
      </Row>
    </Stack>
  )
}
