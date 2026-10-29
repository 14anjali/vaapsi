import { ProvenanceLegend } from './provenance-dot'
import { PassportQr } from './qr'
import { Chip, ChipPair, ChipRow } from '@/components/primitives/chip'
import { Col, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { formatDate } from '@/lib/format/date'
import type { Passport } from '@/lib/types'

/**
 * The passport, record side. The clerical half.
 *
 * ## What changed
 *
 * This was five stacked full-width sections — signature, declaration snapshot,
 * corrections, identifiers, legend, end of life — each with its own heading and
 * its own paragraph. Roughly two screens of audit material sitting between the
 * shopper and the bottom of the page.
 *
 * Three moves:
 *
 * 1. **Status is a chip row.** Signed date, issuer, version, registry and
 *    authentication were five labelled key-value pairs. They are five chips.
 * 2. **Identifiers are a dense two-column list** rather than a grid of
 *    heading-and-value blocks. They are reference strings; they need to be
 *    findable, not prominent.
 * 3. **The original declaration is behind a disclosure.** It is the one thing
 *    here that genuinely is an audit artefact — a frozen snapshot nobody reads
 *    unless they are checking a correction. The *corrections* stay visible,
 *    because those are the interesting part: a record that shows its own repairs
 *    is more trustworthy than a clean one.
 *
 * The voluntary statement keeps its weight. It is a credibility asset, not a
 * disclaimer, and compressing it to a chip alone would lose the argument it
 * makes.
 */
export async function PassportRecord({
  passport,
  shareUrl,
}: {
  passport: Passport
  /** The canonical Vaapsi URL for this passport. What the QR encodes. */
  shareUrl: string
}) {
  return (
    <Stack gap={8}>
      {/* ---- Status, as a strip */}
      <Stack gap={4}>
        <ChipRow>
          <ChipPair label="Signed" value={formatDate(passport.signedAt)} tone="emphasis" />
          <ChipPair label="By" value={passport.issuer} />
          <ChipPair label="Version" value={passport.dppVersion} />
          <ChipPair label="Registry" value={passport.registry.name} />
          <ChipPair label="Updated" value={formatDate(passport.lastUpdated)} />
          {passport.corrections.length > 0 && (
            <Chip>
              {passport.corrections.length === 1
                ? '1 correction'
                : `${passport.corrections.length} corrections`}
            </Chip>
          )}
        </ChipRow>

        {/*
          The voluntary statement, at full weight. A business that keeps records
          it is not required to keep is making a stronger claim than one that
          complies, and that argument does not survive being compressed to a tag.
        */}
        <Type size="sm" tone="muted" measure="default" className="border-l border-line-strong pl-4">
          {passport.isVoluntary ? passportCopy.voluntary : passportCopy.regulated}
        </Type>
      </Stack>

      <Grid gap="loose" rowGap="loose" className="border-t border-line pt-6">
        {/* ---- Corrections. The interesting half of the record. */}
        <Col mobile={4} tablet={8} desktop={7}>
          <Eyebrow as="h3">{passportCopy.sections.corrections}</Eyebrow>

          {passport.corrections.length === 0 ? (
            <Type size="sm" tone="subtle" className="pt-3">
              Never corrected.
            </Type>
          ) : (
            <ol className="divide-y divide-line pt-3">
              {passport.corrections.map((correction) => (
                <li key={correction.id} className="py-4 first:pt-0">
                  <Stack gap={1}>
                    <Row gap={3} justify="between" align="baseline">
                      <Type as="p" size="sm" weight="emphasis">
                        {humanise(correction.field)}
                      </Type>
                      <Type
                        as="time"
                        size="xs"
                        tone="subtle"
                        numeric
                        dateTime={correction.correctedAt}
                      >
                        {formatDate(correction.correctedAt)}
                      </Type>
                    </Row>
                    {/*
                      Both values, old struck through. The original declaration
                      below still holds the wrong one — a record that shows its
                      own repairs is more trustworthy than a clean one.
                    */}
                    <Row gap={2} align="baseline">
                      <Type as="span" size="xs" tone="subtle">
                        <s>{renderSnapshotValue(correction.previousValue)}</s>
                      </Type>
                      <Type as="span" size="xs" tone="subtle" aria-hidden>
                        →
                      </Type>
                      <Type as="span" size="xs">
                        {renderSnapshotValue(correction.newValue)}
                      </Type>
                    </Row>
                    <Type size="xs" tone="muted" measure="narrow">
                      {correction.reason}
                    </Type>
                    <Type size="xs" tone="subtle">
                      {correction.correctedBy}
                    </Type>
                  </Stack>
                </li>
              ))}
            </ol>
          )}

          {/*
            The frozen snapshot. Genuinely an audit artefact — nobody reads it
            unless they are checking a correction against it — so it is the one
            thing here that belongs behind a click.
          */}
          <details className="group/declaration pt-6">
            <summary className="cursor-pointer text-xs text-ink-subtle transition-colors hover:text-ink-muted">
              {passportCopy.sections.declaration}
            </summary>
            <Stack gap={3} className="pt-3">
              <Type size="xs" tone="subtle">
                Declared {formatDate(passport.originalDeclaration.declaredAt)} by{' '}
                {passport.originalDeclaration.declaredBy}. Never edited.
              </Type>
              <dl className="divide-y divide-line border-y border-line">
                {Object.entries(passport.originalDeclaration.snapshot).map(([key, value]) => (
                  <Row key={key} gap={4} justify="between" align="start" className="py-2">
                    <Type as="dt" size="xs" tone="subtle" className="shrink-0">
                      {humanise(key)}
                    </Type>
                    <Type as="dd" size="xs" numeric className="text-right">
                      {renderSnapshotValue(value)}
                    </Type>
                  </Row>
                ))}
              </dl>
            </Stack>
          </details>
        </Col>

        {/* ---- Scan + identifiers */}
        <Col mobile={4} tablet={8} desktop={4} startDesktop={9}>
          <Stack gap={6}>
            <div>
              <Eyebrow as="h3">{passportCopy.sections.scan}</Eyebrow>
              <div className="pt-3">
                <PassportQr
                  value={shareUrl}
                  size={104}
                  caption={`Opens this ${PASSPORT_NAME.singular}. Printable at 2cm.`}
                />
              </div>
            </div>

            <div>
              <Eyebrow as="h3">{passportCopy.sections.identifiers}</Eyebrow>
              <dl className="divide-y divide-line pt-3">
                <Identifier label="Unique ID" value={passport.uniqueProductId} />
                <Identifier label="Product no." value={passport.productNo} />
              </dl>
            </div>

            {(passport.endOfLife.collectionPointUrl !== null ||
              passport.endOfLife.recyclerLookupUrl !== null) && (
              <div>
                <Eyebrow as="h3">When it is finished</Eyebrow>
                <Row gap={4} className="pt-3">
                  {passport.endOfLife.collectionPointUrl !== null && (
                    <a
                      href={passport.endOfLife.collectionPointUrl}
                      className="border-b border-line-strong pb-0.5 text-xs text-ink transition-colors hover:border-ink"
                    >
                      Collection points
                    </a>
                  )}
                  {passport.endOfLife.recyclerLookupUrl !== null && (
                    <a
                      href={passport.endOfLife.recyclerLookupUrl}
                      className="border-b border-line pb-0.5 text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      How this is recycled
                    </a>
                  )}
                </Row>
              </div>
            )}

            <details className="group/legend print:break-inside-avoid">
              <summary className="cursor-pointer text-xs text-ink-subtle transition-colors hover:text-ink-muted">
                {passportCopy.provenance.legendTitle}
              </summary>
              <div className="pt-4">
                <ProvenanceLegend />
              </div>
            </details>
          </Stack>
        </Col>
      </Grid>
    </Stack>
  )
}

function Identifier({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <Type as="dt" size="xs" tone="subtle">
        {label}
      </Type>
      <Type as="dd" size="xs" numeric className="break-all">
        {value}
      </Type>
    </div>
  )
}

/** `manufacturingCountry` → `Manufacturing country`. */
function humanise(key: string): string {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

/**
 * Render an arbitrary snapshot value.
 *
 * The snapshot is `Record<string, unknown>` by design — a frozen copy of whatever
 * the passport looked like at first publication, whose shape changes as the
 * contract does. So this renders defensively rather than assuming a schema. An
 * old snapshot must never be able to break the page that displays it; that would
 * defeat the entire point of keeping it.
 */
function renderSnapshotValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry !== null && typeof entry === 'object') {
          const record = entry as Record<string, unknown>
          const name = record.name
          const percentage = record.percentage
          if (typeof name === 'string') {
            return typeof percentage === 'number' ? `${name} ${percentage}%` : name
          }
        }
        return renderSnapshotValue(entry)
      })
      .join(', ')
  }
  return JSON.stringify(value)
}
