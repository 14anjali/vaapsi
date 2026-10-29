import Image from 'next/image'
import { ConditionMeter } from '../data/condition-meter'
import { Chip, ChipRow } from '@/components/primitives/chip'
import { Col, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { conditionCopy, productPage } from '@/content/product'
import { PHOTO_QUALITY } from '@/lib/image'
import type { Product } from '@/lib/types'

/**
 * Condition and flaws.
 *
 * **This is a feature, not a formality, and it keeps its design weight.** It is
 * the one thing on this page that is neither specification nor narrative: it is
 * the purchase decision, and it is why the rest of the listing is believable.
 *
 * ## What the density pass changed
 *
 * The information is the same. What went:
 *
 * - **The heading and the grade were saying the same thing twice** — an eyebrow
 *   reading CONDITION over a heading reading "Good", then a paragraph defining
 *   "Good". That is now the meter: the grade, its position on the five-step
 *   scale, and the one-line definition, in the height the heading alone used.
 * - **The inspector's prose was duplicated** into the Product details drawer as
 *   "About this piece". It lives here only. This is where a shopper is looking
 *   when they want it.
 * - **Flaws are a two-column grid** rather than a full-width stacked list, and
 *   each one leads with a location chip. Two flaws used to be two screen-widths
 *   of mostly empty row; they are now one row of two cards.
 *
 * When there are no flaws that is stated explicitly rather than by omission. An
 * empty section reads as "not filled in", and on resale that is the worst
 * possible impression.
 */
export function ConditionBlock({
  product,
  headless = false,
}: {
  product: Product
  /**
   * Skip the eyebrow, for a caller that already renders a section heading — the
   * PDP wraps this in a `Section`. Two headings for one block would break the
   * level sequence.
   */
  headless?: boolean
}) {
  // New stock has no grade, so this block has nothing to say about it. The
  // PDP already guards on `listingType`; returning null here means a future
  // caller that forgets cannot render an empty condition panel.
  if (product.condition === null) return null
  const condition = conditionCopy[product.condition]

  const body = (
    <Stack gap={6}>
      <Grid gap="loose" rowGap="default">
        <Col mobile={4} tablet={4} desktop={5}>
          <Stack gap={4}>
            {!headless && <Eyebrow>{productPage.sections.condition}</Eyebrow>}
            <ConditionMeter condition={product.condition} />
            <Type size="sm" tone="muted" measure="default">
              {condition.definition}
            </Type>
          </Stack>
        </Col>

        {product.conditionNotes !== '' && (
          <Col mobile={4} tablet={4} desktop={6} startDesktop={7}>
            {/*
              The inspector's own words, at reading size. The one piece of prose
              in this section that earns being prose — it is a person describing
              a specific garment, not a definition.
            */}
            <Type size="base" measure="default" className="border-l border-line-strong pl-4">
              {product.conditionNotes}
            </Type>
          </Col>
        )}
      </Grid>

      <div className="border-t border-line pt-5">
        <Row gap={3} justify="between" align="baseline">
          <Eyebrow as="h3">{productPage.sections.flaws}</Eyebrow>
          <Type as="span" size="xs" tone="subtle" numeric>
            {product.flaws.length === 0 ? 'None found' : `${product.flaws.length} documented`}
          </Type>
        </Row>

        {product.flaws.length === 0 ? (
          <Type size="sm" tone="muted" className="pt-3">
            No flaws found at inspection. Nothing to disclose.
          </Type>
        ) : (
          <Grid gap="default" rowGap="default" as="ul" className="pt-4">
            {product.flaws.map((flaw, index) => {
              const image = product.images.find((candidate) => candidate.id === flaw.imageId)
              return (
                <Col key={`${flaw.location}-${index}`} mobile={4} tablet={4} desktop={4} as="li">
                  <Row gap={4} align="start" wrap={false}>
                    {image !== undefined && (
                      <div className="relative size-20 shrink-0 overflow-hidden bg-surface">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          sizes="80px"
                          quality={PHOTO_QUALITY}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <Stack gap={2} className="min-w-0">
                      <ChipRow>
                        <Chip tone="quiet">{flaw.location}</Chip>
                      </ChipRow>
                      <Type size="xs" tone="muted">
                        {flaw.description}
                      </Type>
                    </Stack>
                  </Row>
                </Col>
              )
            })}
          </Grid>
        )}
      </div>
    </Stack>
  )

  return headless ? body : <section aria-labelledby="condition-heading">{body}</section>
}
