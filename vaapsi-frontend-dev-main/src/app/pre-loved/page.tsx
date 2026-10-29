import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/patterns/reveal'
import { Col, Container, Grid, Rule, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Eyebrow, Type } from '@/components/primitives/type'
import { ShopView } from '@/components/patterns/shop/shop-view'
import { preLoved } from '@/content/pre-loved'
import type { RawSearchParams } from '@/lib/plp/search-params'

export const metadata: Metadata = {
  title: preLoved.eyebrow,
  description: preLoved.standfirst,
}

/**
 * The seller-side entry point, and the only page on the site addressed to
 * someone who wants to hand a garment back rather than take one away.
 *
 * It exists as its own route rather than a footer link because resale is the
 * business, not a service page — the same reason it sits in the primary nav.
 *
 * ## Why there is no sign-in form here
 *
 * Auth does not exist in this repo and seller accounts are a later batch
 * (README, "Scope of v1"). The CTA therefore states that plainly instead of
 * rendering a disabled form, for the same reason `/checkout` is not a fake
 * payment screen: a stub that looks finished gets believed, and then the phase
 * that actually builds it never gets estimated honestly.
 *
 * When auth lands, `preLoved.cta` is the only thing that changes — swap the
 * not-built block for the real entry point and delete the phase note.
 */
export default function PreLovedPage({ searchParams }: { searchParams: RawSearchParams }) {
  return (
    <>
      <Container>
        <Stack gap={4} className="py-section">
          <Eyebrow>{preLoved.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="4xl" weight="heading" measure="default">
            {preLoved.title}
          </Type>
          <Type size="lg" tone="muted" measure="default">
            {preLoved.standfirst}
          </Type>
          <SellCta />
        </Stack>
      </Container>

      <Reveal>
        <Section
          divider
          eyebrow={preLoved.why.eyebrow}
          heading={preLoved.why.title}
          headingSize="3xl"
        >
          <Stack gap={3}>
            {preLoved.why.body.map((paragraph) => (
              <Type key={paragraph} size="lg" tone="muted" measure="default">
                {paragraph}
              </Type>
            ))}
          </Stack>
        </Section>
      </Reveal>

      {/*
        Numbered, and one of only two numbered things on the site. The licence is
        the same one the home page's passport steps have: this is a real sequence
        where the order carries meaning, not a set of feature tiles wearing
        numbers for decoration.
      */}
      <Reveal>
        <Section
          tone="surface"
          eyebrow={preLoved.how.eyebrow}
          heading={preLoved.how.title}
          headingSize="3xl"
        >
          <Grid gap="loose" rowGap="default" as="ol">
            {preLoved.how.steps.map((step, index) => (
              <Col key={step.verb} mobile={2} tablet={4} desktop={3} as="li">
                <Stack gap={2}>
                  <div className="border-t border-line-strong pt-3">
                    <Type size="xs" tone="subtle" numeric tracking="caps">
                      {String(index + 1).padStart(2, '0')}
                    </Type>
                  </div>
                  <Type as="h3" family="display" size="lg" weight="heading">
                    {step.verb}
                  </Type>
                  <Type size="sm" tone="muted">
                    {step.body}
                  </Type>
                </Stack>
              </Col>
            ))}
          </Grid>
        </Section>
      </Reveal>

      {/*
        The stock, with its own filters.

        **This is where condition lives.** It is the first question about a
        second-hand garment and has no meaning on unworn stock, so the grade
        filter belongs here and nowhere else — the New listing's panel does not
        offer it, and the facets behind both are scoped by listing type so
        neither can.

        Rendered through the same `ShopView` as /shop rather than a bespoke grid:
        the two listings differ in which half of the catalogue they show and
        which filters that half deserves, and nothing else. A second grid
        implementation would drift.
      */}
      <Reveal>
        <div className="border-t border-line">
          <ShopView
            searchParams={searchParams}
            listingType="pre_loved"
            eyebrow={preLoved.grid.eyebrow}
            title={preLoved.grid.title}
          />
        </div>
      </Reveal>

      {/*
        Two columns, not a tick/cross table. What we decline needs the reason
        beside it — "other brands, not yet, because authentication is per-brand
        work" is a different message from a red cross, and it is the one that
        stops a seller feeling rejected.
      */}
      <Reveal>
        <Section
          divider
          eyebrow={preLoved.accepts.eyebrow}
          heading={preLoved.accepts.title}
          headingSize="3xl"
        >
          <Grid gap="loose" rowGap="default">
            <Col mobile={4} tablet={4} desktop={6}>
              <ClauseList heading="Yes" items={preLoved.accepts.yes} />
            </Col>
            <Col mobile={4} tablet={4} desktop={6}>
              <ClauseList heading="Not yet" items={preLoved.accepts.no} tone="subtle" />
            </Col>
          </Grid>
        </Section>
      </Reveal>
    </>
  )
}

/**
 * The seller CTA. See the note on the page component for why this states its own
 * absence rather than rendering a form.
 */
function SellCta() {
  return (
    <Stack gap={2} className="mt-6">
      <Type as="h2" family="display" size="xl" weight="heading">
        {preLoved.cta.notBuiltTitle}
      </Type>
      <Type size="sm" tone="muted" measure="default">
        {preLoved.cta.notBuiltBody}
      </Type>
      <Link
        href={preLoved.cta.notBuiltHref}
        className="ease mt-2 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
      >
        {preLoved.cta.notBuiltAction}
      </Link>
      <Type size="xs" tone="subtle" className="mt-2">
        {preLoved.cta.phase}
      </Type>
    </Stack>
  )
}

function ClauseList({
  heading,
  items,
  tone = 'muted',
}: {
  heading: string
  items: readonly string[]
  tone?: 'muted' | 'subtle'
}) {
  return (
    <Stack gap={3}>
      <Eyebrow as="h3">{heading}</Eyebrow>
      <Rule />
      <Stack gap={3} as="ul">
        {items.map((item) => (
          <Type key={item} as="li" size="sm" tone={tone}>
            {item}
          </Type>
        ))}
      </Stack>
    </Stack>
  )
}
