import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Grid, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { conditionCopy } from '@/content/product'
import { CONDITIONS, conditionRank } from '@/lib/types'

/**
 * The five-level condition scale, with its full public definitions.
 *
 * This section removes the single biggest objection in resale — "what does
 * 'good' actually mean?" — so it keeps real space on the home page rather than
 * being demoted to an FAQ nobody opens.
 *
 * **Laid out as a grid rather than a five-row list.** Stacked, it was over a
 * screen tall on its own, so a shopper scrolled past most of the promise to
 * reach the end of it. In a grid all five grades are visible at once — and being
 * able to compare them is the entire point of a scale.
 *
 * Rendered from the same `conditionCopy` the product page uses, so there is
 * exactly one copy of these words in the repo and the promise on the home page
 * cannot drift from the promise on the garment.
 */
export function ConditionScale() {
  return (
    <Reveal>
      <Section
        eyebrow={home.condition.eyebrow}
        heading={home.condition.title}
        headingSize="3xl"
        lede={home.condition.lede}
        action={
          <Link
            href="/condition"
            className="ease inline-flex border-b border-line-strong pb-1 text-sm text-ink transition-colors duration-base hover:border-ink"
          >
            {home.condition.cta}
          </Link>
        }
      >
        <Grid gap="loose" rowGap="default" as="ul">
          {CONDITIONS.map((condition) => {
            const copy = conditionCopy[condition]
            return (
              <Col key={condition} mobile={4} tablet={4} desktop={4} as="li">
                <Stack gap={1} className="h-full border-t border-line-strong pt-3">
                  <Type as="p" size="xs" tone="subtle" numeric tracking="caps">
                    {String(conditionRank(condition)).padStart(2, '0')}
                  </Type>
                  <Type as="p" family="display" size="lg" weight="heading">
                    {copy.label}
                  </Type>
                  <Type size="sm" tone="muted">
                    {copy.definition}
                  </Type>
                </Stack>
              </Col>
            )
          })}
        </Grid>

        <Type size="sm" tone="subtle" className="mt-8 border-t border-line pt-4">
          {home.condition.note}
        </Type>
      </Section>
    </Reveal>
  )
}
