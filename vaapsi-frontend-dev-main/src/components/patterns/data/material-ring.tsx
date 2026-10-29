import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { ProvenanceDot } from '../passport/provenance-dot'
import type { Material } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Fibre composition as a ring, with the legend beside it.
 *
 * ## Why a ring, and where a ring lies
 *
 * A donut is the right shape for a composition — it reads as *parts of one
 * whole*, which is exactly what a fibre breakdown is, and it replaces four lines
 * of "Cotton 99% / Elastane 1%" with one glance.
 *
 * But it lies badly on this data, and the fix has to be deliberate. Real
 * compositions are frequently **100% one fibre** (a full ring saying nothing) or
 * **99/1** (a 3.6° slice that is invisible at any size this component will ever
 * be drawn at). So:
 *
 * - **One fibre** → a complete ring with the fibre named in the centre. No
 *   legend, because there is nothing to compare.
 * - **Several fibres** → segments, with any share below `MIN_VISIBLE_SHARE`
 *   drawn at that minimum width so it can be seen at all. The ring is then
 *   deliberately *not* to scale, so **the legend carries the real number** and
 *   a caption says the smallest slices are widened. A chart that silently
 *   misrepresents 1% as 4% is worse than a table.
 *
 * ## Near-monochrome, and recycled without colour
 *
 * Segments are ink at descending opacity. Recycled fibres get a **hatch
 * pattern** rather than a colour, for the same reason the provenance marks are
 * encoded by fill: it survives greyscale, print and a colour-blind reader, and
 * the accent is reserved for the verification mark alone.
 */

/** Below this, a segment is widened to stay visible. 4% of the ring. */
const MIN_VISIBLE_SHARE = 4

const RADIUS = 42
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Descending ink opacity, so segments separate without colour. */
const SEGMENT_OPACITY = [1, 0.55, 0.32, 0.18, 0.1]

export function MaterialRing({
  materials,
  className,
}: {
  materials: readonly Material[]
  className?: string
}) {
  if (materials.length === 0) return null

  const single = materials.length === 1
  const patternId = 'material-ring-hatch'

  // Widen anything too small to see, then renormalise so the ring still closes.
  const widened = materials.map((material) => ({
    material,
    drawn: Math.max(material.percentage.value, MIN_VISIBLE_SHARE),
  }))
  const drawnTotal = widened.reduce((sum, entry) => sum + entry.drawn, 0)
  const distorted = widened.some((entry) => entry.drawn !== entry.material.percentage.value)

  // What the garment's label actually claims. If it does not reach 100 we say
  // so — swallowing a 97% total is the kind of small dishonesty that makes the
  // rest of the document unbelievable, and the ring would hide it perfectly
  // because it always closes.
  const declaredTotal = materials.reduce((sum, material) => sum + material.percentage.value, 0)

  let offset = 0

  return (
    <Row gap={6} align="center" className={cn('min-w-0', className)}>
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="size-28 -rotate-90" aria-hidden>
          <defs>
            {/*
              The recycled marker. Diagonal hatch at 45°, in the same ink as the
              segment it sits on — so it reads as texture rather than as a second
              colour, and it survives being printed.
            */}
            <pattern
              id={patternId}
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="4" fill="hsl(var(--background))" />
              <line x1="0" y1="0" x2="0" y2="4" stroke="hsl(var(--ink))" strokeWidth="2" />
            </pattern>
          </defs>

          {/* The track. Present so a partial ring still reads as a whole. */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--line))"
            strokeWidth={STROKE}
          />

          {widened.map((entry, index) => {
            const share = (entry.drawn / drawnTotal) * CIRCUMFERENCE
            const dashOffset = -offset
            offset += share
            const recycled = entry.material.isRecycled.value

            return (
              <circle
                key={entry.material.name.value}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={recycled ? `url(#${patternId})` : 'hsl(var(--ink))'}
                strokeOpacity={recycled ? 1 : (SEGMENT_OPACITY[index] ?? 0.1)}
                strokeWidth={STROKE}
                // A hairline gap between segments, so two adjacent tints do not
                // merge into one arc.
                strokeDasharray={`${Math.max(share - 1.5, 0.5)} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
              />
            )
          })}
        </svg>

        {single && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Type as="span" size="sm" weight="emphasis" numeric>
              {materials[0]?.percentage.value}%
            </Type>
          </div>
        )}
      </div>

      <Stack gap={2} className="min-w-0 flex-1">
        {materials.map((material, index) => (
          <Row key={material.name.value} gap={3} align="baseline" wrap={false}>
            <span
              aria-hidden
              className={cn(
                'mt-0.5 size-2.5 shrink-0 rounded-sm',
                material.isRecycled.value ? 'border border-ink bg-transparent' : 'bg-ink',
              )}
              style={
                material.isRecycled.value ? undefined : { opacity: SEGMENT_OPACITY[index] ?? 0.1 }
              }
            />
            <Type as="span" size="sm" className="min-w-0 flex-1 truncate">
              {material.name.value}
              {material.isRecycled.value && (
                <Type as="span" size="xs" tone="subtle" className="pl-1.5">
                  recycled
                </Type>
              )}
            </Type>
            <Row gap={2} align="center" wrap={false} className="shrink-0">
              <Type as="span" size="sm" numeric tone="muted">
                {material.percentage.value}%
              </Type>
              <ProvenanceDot provenance={material.percentage.provenance} />
            </Row>
          </Row>
        ))}

        {declaredTotal !== 100 && (
          <Type size="xs" tone="subtle">
            Declared composition totals {declaredTotal}%. The remainder is not recorded.
          </Type>
        )}

        {distorted && (
          <Type size="xs" tone="subtle">
            Smallest shares widened to stay visible. The percentages are exact.
          </Type>
        )}
      </Stack>
    </Row>
  )
}
