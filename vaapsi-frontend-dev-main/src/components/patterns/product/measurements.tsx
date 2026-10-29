import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { productPage } from '@/content/product'
import { sizeEquivalents } from '@/lib/format/size'
import { MEASUREMENT_KEYS } from '@/lib/types'
import type { MeasurementKey, Measurements, Size } from '@/lib/types'

/**
 * Size, with measurements behind a disclosure.
 *
 * The printed label leads and the conversions support it, never the other way
 * round. A shopper checking the tag in the garment will find what we printed
 * first — and brand sizing varies enough that a converted number presented as
 * fact is a returns problem.
 *
 * Measurements are the actual answer to "will this fit", so the disclosure is
 * open by default on desktop where there is room. Rendered in centimetres,
 * taken flat, and only for the keys this garment actually has: a skirt has no
 * shoulder, and printing "Shoulder —" invites the question of whether someone
 * forgot to measure it.
 */

const LABEL: Record<MeasurementKey, string> = {
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder',
  sleeveLength: 'Sleeve',
  length: 'Length',
  inseam: 'Inseam',
  rise: 'Rise',
  thigh: 'Thigh',
  hem: 'Hem',
  neck: 'Neck',
  cuff: 'Cuff',
}

export function SizeAndMeasurements({
  size,
  measurements,
}: {
  size: Size
  measurements: Measurements
}) {
  const equivalents = sizeEquivalents(size)
  const present = MEASUREMENT_KEYS.filter((key) => measurements[key] !== undefined)

  return (
    <Stack gap={3}>
      <Row gap={3} align="baseline" justify="between">
        <Row gap={2} align="baseline">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            Size
          </Type>
          <Type as="span" size="base" weight="emphasis">
            {size.label}
          </Type>
          <Type as="span" size="xs" tone="subtle">
            as labelled ({size.system})
          </Type>
        </Row>
      </Row>

      {/* Conversions, quietly. Only when the table knows this size. */}
      {Object.keys(equivalents).length > 0 && (
        <Row gap={4} className="border-y border-line py-2">
          {(['IN', 'UK', 'EU', 'US'] as const).map((system) =>
            equivalents[system] === undefined ? null : (
              <Row key={system} gap={1} align="baseline" wrap={false}>
                <Type as="span" size="xs" tone="subtle">
                  {system}
                </Type>
                <Type as="span" size="sm" numeric>
                  {equivalents[system]}
                </Type>
              </Row>
            ),
          )}
        </Row>
      )}

      {present.length > 0 && (
        <details className="group/measure" open>
          <summary className="cursor-pointer text-sm text-ink-muted transition-colors hover:text-ink">
            {productPage.sections.measurements}
          </summary>
          <Stack gap={3} className="pt-4">
            <Type size="xs" tone="subtle">
              {productPage.sections.measurementsNote}
            </Type>
            <dl className="divide-y divide-line">
              {present.map((key) => (
                <Row key={key} gap={4} justify="between" className="py-2">
                  <Type as="dt" size="sm" tone="muted">
                    {LABEL[key]}
                  </Type>
                  <Type as="dd" size="sm" numeric>
                    {measurements[key]} cm
                  </Type>
                </Row>
              ))}
            </dl>
          </Stack>
        </details>
      )}
    </Stack>
  )
}
