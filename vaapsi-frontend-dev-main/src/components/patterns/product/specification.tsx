import { CareSymbols } from '../data/care-symbol'
import { Flag } from '../data/flag'
import { MaterialRing } from '../data/material-ring'
import { SourcedValue } from '../passport/provenance-dot'
import { ChipPair, ChipRow } from '@/components/primitives/chip'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { drawers } from '@/content/drawers'
import { formatDate } from '@/lib/format/date'
import { MEASUREMENT_KEYS } from '@/lib/types'
import type { MeasurementKey, Passport, Product, Seller } from '@/lib/types'

/**
 * The specification: what the garment is, measures, is made of, and how to keep
 * it.
 *
 * Extracted from the drawer so the drawer can be a shell and this can stay a
 * server component — `MaterialRing` and `CareSymbols` have no interactivity, and
 * rendering them on the server keeps the client bundle to the drawer mechanics.
 *
 * This is the only home for composition, care and origin. They used to render
 * here *and* on the passport story.
 */

const MEASUREMENT_LABEL: Record<MeasurementKey, string> = {
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

export function ProductSpecification({
  product,
  passport,
  seller,
}: {
  product: Product
  passport: Passport | null
  seller: Seller | null
}) {
  const present = MEASUREMENT_KEYS.filter((key) => product.measurements[key] !== undefined)

  return (
    <Stack gap={8}>
      {/* Facts that were a six-row key-value table. Each is one attribute. */}
      <ChipRow>
        <ChipPair label="Brand" value={product.brand} tone="emphasis" />
        <ChipPair label="Type" value={product.subcategory} />
        <ChipPair label="Size" value={`${product.size.label} · ${product.size.system}`} />
        <ChipPair label="Code" value={product.sku} />
        <ChipPair label={drawers.details.listed} value={formatDate(product.listedAt)} />
        {seller !== null && <ChipPair label="Seller" value={seller.displayName} />}
      </ChipRow>

      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.details.sections.materials}</Eyebrow>
        {passport === null ? (
          <Type size="sm" tone="muted" measure="default" className="pt-3">
            {drawers.details.materialsUnknown}
          </Type>
        ) : (
          <MaterialRing materials={passport.materials} className="pt-4" />
        )}
      </section>

      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.details.sections.care}</Eyebrow>
        {passport === null ? (
          <Type size="sm" tone="muted" className="pt-3">
            {drawers.details.careUnknown}
          </Type>
        ) : (
          <CareSymbols instructions={passport.careInstructions} className="pt-4" />
        )}
      </section>

      {present.length > 0 && (
        <section className="border-t border-line pt-6">
          <Row gap={4} justify="between" align="baseline">
            <Eyebrow as="h3">{drawers.details.sections.measurements}</Eyebrow>
            <Type as="span" size="xs" tone="subtle">
              centimetres, taken flat
            </Type>
          </Row>
          {/* Two columns, so nine measurements are five rows rather than nine. */}
          <dl className="grid grid-cols-2 gap-x-8 pt-3">
            {present.map((key) => (
              <div key={key} className="flex justify-between gap-4 border-b border-line py-2">
                <Type as="dt" size="sm" tone="muted">
                  {MEASUREMENT_LABEL[key]}
                </Type>
                <Type as="dd" size="sm" numeric>
                  {product.measurements[key]}
                </Type>
              </div>
            ))}
          </dl>
        </section>
      )}

      {passport !== null && (
        <section className="border-t border-line pt-6">
          <Eyebrow as="h3">{drawers.details.sections.origin}</Eyebrow>
          <dl className="grid grid-cols-1 gap-3 pt-3 tablet:grid-cols-3">
            <OriginField label="Place of origin" sourced={passport.placeOfOrigin} flag />
            <OriginField label="Made in" sourced={passport.manufacturingCountry} flag />
            {/* No flag. A factory is not a country, and "Manifattura Rossi,
                Vicenza" would otherwise be read for one. */}
            <OriginField label="Manufacturer" sourced={passport.manufacturer} />
          </dl>
        </section>
      )}
    </Stack>
  )
}

function OriginField({
  label,
  sourced,
  flag = false,
}: {
  label: string
  sourced: Passport['placeOfOrigin']
  /** Only for fields that name a place. `Flag` ignores anything it cannot match. */
  flag?: boolean
}) {
  return (
    <div>
      <Type as="dt" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      {/* `items-start`, not centre: "Okayama, Japan" wraps to two lines in this
          column, and a centred flag then floats in the gap between them
          instead of sitting against the word it belongs to. */}
      <dd className="flex items-start gap-2 pt-1">
        {flag && <Flag place={sourced.value} />}
        <SourcedValue value={sourced.value} provenance={sourced.provenance} />
      </dd>
    </div>
  )
}
