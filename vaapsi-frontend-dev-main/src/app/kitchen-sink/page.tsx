import type { Metadata } from 'next'
import { PassportRecord } from '@/components/patterns/passport/record'
import { PassportStory } from '@/components/patterns/passport/story'
import { ProvenanceDot, ProvenanceLegend } from '@/components/patterns/passport/provenance-dot'
import { Seal } from '@/components/patterns/passport/seal'
import { Price } from '@/components/patterns/price'
import { ProductCard } from '@/components/patterns/product-card'
import { ConditionBlock } from '@/components/patterns/product/condition-block'
import { SizeAndMeasurements } from '@/components/patterns/product/measurements'
import { PincodeCheck } from '@/components/patterns/product/pincode-check'
import { ProductDrawers } from '@/components/patterns/product/product-drawer'
import { ProductSpecification } from '@/components/patterns/product/specification'
import { PassportImpact } from '@/components/patterns/passport/impact'
import { CompleteTheLook } from '@/components/patterns/product/complete-the-look'
import { CareSymbols } from '@/components/patterns/data/care-symbol'
import { ConditionMeter } from '@/components/patterns/data/condition-meter'
import { MaterialRing } from '@/components/patterns/data/material-ring'
import { Chip, ChipPair, ChipRow } from '@/components/primitives/chip'
import { AddToBag } from '@/components/patterns/product/add-to-bag'
import { ProductGridSkeleton } from '@/components/patterns/shop/product-grid'
import { Col, Container, Grid, Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { cart } from '@/content/cart'
import { states } from '@/content/states'
import { getPassport, getProduct, listProducts } from '@/lib/data'
import { CONDITIONS, PROVENANCES } from '@/lib/types'
import type { Availability, Product, ProductSummary } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Kitchen sink',
  robots: { index: false, follow: false },
}

/**
 * Every component, in every state, on one page.
 *
 * This is how the dev team will review the work, and it is deliberately not
 * Storybook: no extra dependency, no second build, no story files to keep in
 * step with the components. One route, rendered by the same Next build as the
 * real pages, reading the same fixtures.
 *
 * What it is for, specifically: the states nobody remembers to check. A card
 * with no passport. A card that is sold. A passport with no impact block. A
 * passport that has been corrected. An empty grid. A loading skeleton. Those are
 * where the bugs are, and they are invisible on the happy-path pages.
 *
 * Rule for keeping this useful: **when you add a state, add it here.** A kitchen
 * sink that is missing half the states is worse than none, because it gets
 * trusted.
 */
export default async function KitchenSinkPage() {
  const page = await listProducts({ limit: 20 })
  const summaries = page.items

  const withPassport = await getProduct('prd_levis_501_indigo')
  const withoutPassport = await getProduct('prd_zara_denim_waistcoat')
  const noFlaws = await getProduct('prd_bhaane_trucker_indigo')

  const fullPassport = await getPassport('psp_diesel_denim_shoulder_bag')
  const correctedPassport = await getPassport('psp_levis_501_indigo')
  const partialPassport = await getPassport('psp_nicobar_chambray_shirtdress')
  const acnePassport = await getPassport('psp_acne_denim_maxi_skirt')

  const card = (availability: Availability, hasPassport: boolean): ProductSummary | null => {
    const base = summaries.find((item) => (item.passportId !== null) === hasPassport)
    return base === undefined ? null : { ...base, availability }
  }

  return (
    <Container>
      <div className="py-12">
        <Eyebrow>Internal</Eyebrow>
        <Type as="h1" family="display" size="4xl" weight="heading" className="mt-3">
          Kitchen sink
        </Type>
        <Type size="base" tone="muted" measure="default" className="mt-3">
          Every component in every state. Not linked from anywhere and not indexed. Add a state to a
          component, add it here.
        </Type>
      </div>

      {/* ---------------------------------------------------------------- */}
      <Section title="Type scale">
        <Stack gap={4}>
          {(['6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const).map(
            (size) => (
              <Row key={size} gap={6} align="baseline">
                <Type as="span" size="xs" tone="subtle" numeric className="w-12 shrink-0">
                  {size}
                </Type>
                <Type family="display" size={size} truncate>
                  Circular fashion, worn again
                </Type>
              </Row>
            ),
          )}
        </Stack>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Product card — every state">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 tablet:grid-cols-4">
          <CardCase label="Available, with passport" summary={card('available', true)} />
          <CardCase label="Available, no passport" summary={card('available', false)} />
          <CardCase label="Reserved (unmarked by design)" summary={card('reserved', true)} />
          <CardCase label="Sold" summary={card('sold', true)} />
        </ul>
      </Section>

      <Section title="Product card — loading">
        <ProductGridSkeleton count={4} />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Price">
        <Stack gap={4}>
          <Case label="With original retail">
            <Price priceInr={265_000} originalRetailInr={649_900} availability="available" />
          </Case>
          <Case label="Original retail unknown — no invented discount">
            <Price priceInr={1_450_000} originalRetailInr={null} availability="available" />
          </Case>
          <Case label="Saving shown (PDP only)">
            <Price
              priceInr={265_000}
              originalRetailInr={649_900}
              availability="available"
              showSaving
            />
          </Case>
          <Case label="Sold — price replaced, not struck">
            <Price priceInr={265_000} originalRetailInr={649_900} availability="sold" />
          </Case>
          <Case label="Lakh grouping">
            <Price priceInr={12_000_000} originalRetailInr={null} availability="available" />
          </Case>
        </Stack>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Provenance marks — encoded by fill, never colour">
        <Row gap={8} align="start">
          <Stack gap={3}>
            {PROVENANCES.map((provenance) => (
              <Row key={provenance} gap={3} align="center">
                <ProvenanceDot provenance={provenance} />
                <Type size="sm" tone="muted">
                  {provenance}
                </Type>
              </Row>
            ))}
          </Stack>
          {/* Rendered at print scale, which is the constraint that produced the
              fill encoding in the first place. */}
          <Stack gap={3}>
            <Type size="xs" tone="subtle">
              At 8px, as printed on a care label
            </Type>
            <Row gap={2}>
              {PROVENANCES.map((provenance) => (
                <ProvenanceDot key={provenance} provenance={provenance} className="size-2" />
              ))}
            </Row>
            <Type size="xs" tone="subtle" className="pt-4">
              In greyscale
            </Type>
            <Row gap={2} className="grayscale">
              {PROVENANCES.map((provenance) => (
                <ProvenanceDot key={provenance} provenance={provenance} />
              ))}
            </Row>
          </Stack>
          <ProvenanceLegend />
        </Row>
      </Section>

      <Section title="The seal">
        <Stack gap={4}>
          <Case label="Verified by a named party">
            <Seal label="Verified by Vaapsi Studio, New Delhi" />
          </Case>
        </Stack>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Composition ring — every shape the data actually takes">
        <Grid gap="loose" rowGap="loose">
          <Col mobile={4} tablet={4} desktop={6}>
            <Type size="xs" tone="subtle" className="pb-3">
              One fibre — a full ring says nothing, so the figure goes in the centre
            </Type>
            {partialPassport !== null && <MaterialRing materials={partialPassport.materials} />}
          </Col>
          <Col mobile={4} tablet={4} desktop={6}>
            <Type size="xs" tone="subtle" className="pb-3">
              99 / 1 — a 3.6° slice is invisible, so it is widened and the chart says so
            </Type>
            {correctedPassport !== null && <MaterialRing materials={correctedPassport.materials} />}
          </Col>
          <Col mobile={4} tablet={4} desktop={6}>
            <Type size="xs" tone="subtle" className="pb-3">
              70 / 30 with recycled content — hatched, not coloured
            </Type>
            {acnePassport !== null && <MaterialRing materials={acnePassport.materials} />}
          </Col>
          <Col mobile={4} tablet={4} desktop={6}>
            <Type size="xs" tone="subtle" className="pb-3">
              A short total — the ring always closes, so it would hide this perfectly
            </Type>
            {partialPassport !== null && (
              <MaterialRing
                materials={[
                  {
                    ...partialPassport.materials[0]!,
                    percentage: { value: 97, provenance: 'self_declared' },
                  },
                ]}
              />
            )}
          </Col>
        </Grid>
      </Section>

      <Section title="Care symbols — replacing five labelled empty boxes">
        <Stack gap={6}>
          {[fullPassport, correctedPassport, acnePassport].map((passport, index) =>
            passport === null ? null : (
              <CareSymbols key={index} instructions={passport.careInstructions} />
            ),
          )}
        </Stack>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Condition meter — position on the scale, not a score">
        <Stack gap={8}>
          {CONDITIONS.map((condition) => (
            <ConditionMeter key={condition} condition={condition} />
          ))}
        </Stack>
      </Section>

      <Section title="Chips — one fact each, replacing sentences">
        <ChipRow>
          <ChipPair label="Owners" value="2" tone="emphasis" />
          <ChipPair label="Repairs" value="1" />
          <ChipPair label="Returns" value="2" />
          <Chip>Inspected in house</Chip>
          <Chip tone="quiet">Published by choice</Chip>
          <Chip tone="quiet">Not authenticated</Chip>
        </ChipRow>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Condition scale — all five grades">
        <Stack gap={4}>
          {CONDITIONS.map((condition) => (
            <Case key={condition} label={condition}>
              <Type size="sm">{condition}</Type>
            </Case>
          ))}
        </Stack>
      </Section>

      {withPassport !== null && (
        <Section title="Condition block — with documented flaws">
          <Grid>
            <Col mobile={4} tablet={8} desktop={7}>
              <ConditionBlock product={withPassport} />
            </Col>
          </Grid>
        </Section>
      )}

      {noFlaws !== null && (
        <Section title="Condition block — no flaws, stated explicitly">
          <Grid>
            <Col mobile={4} tablet={8} desktop={7}>
              <ConditionBlock product={noFlaws} />
            </Col>
          </Grid>
        </Section>
      )}

      {/* ---------------------------------------------------------------- */}
      {withPassport !== null && (
        <Section title="Size, measurements and actions">
          <Grid>
            <Col mobile={4} tablet={4} desktop={4}>
              <SizeAndMeasurements
                size={withPassport.size}
                measurements={withPassport.measurements}
              />
            </Col>
            <Col mobile={4} tablet={4} desktop={3}>
              <Stack gap={8}>
                <AddToBagCase label="Available" product={withPassport} availability="available" />
                <AddToBagCase label="Reserved" product={withPassport} availability="reserved" />
                <AddToBagCase label="Sold" product={withPassport} availability="sold" />
              </Stack>
            </Col>
            <Col mobile={4} tablet={4} desktop={4}>
              <PincodeCheck />
              <Type size="xs" tone="subtle" className="pt-3">
                Try 110001 (fast), 560001 (slower), 900001 (unserviceable)
              </Type>
            </Col>
          </Grid>
        </Section>
      )}

      {/* ---------------------------------------------------------------- */}
      {withPassport !== null && (
        <Section title="Product drawers — the reference-material pattern">
          <Grid>
            <Col mobile={4} tablet={4} desktop={4}>
              <Type size="xs" tone="subtle" className="pb-3">
                With a passport — materials and care are populated
              </Type>
              <ProductDrawers
                tabs={[
                  {
                    id: 'specification',
                    label: 'Details',
                    panel: (
                      <ProductSpecification
                        product={withPassport}
                        passport={fullPassport}
                        seller={null}
                      />
                    ),
                  },
                  {
                    id: 'condition',
                    label: 'Condition',
                    panel: <ConditionBlock product={withPassport} headless />,
                  },
                  ...(fullPassport === null
                    ? []
                    : [
                        {
                          id: 'passport',
                          label: 'History',
                          panel: <PassportStory passport={fullPassport} showImpact={false} />,
                        },
                        {
                          id: 'impact',
                          label: 'What this saves',
                          panel: <PassportImpact passport={fullPassport} />,
                        },
                      ]),
                ]}
              />
            </Col>
            <Col mobile={4} tablet={4} desktop={4}>
              <Type size="xs" tone="subtle" className="pb-3">
                Without a passport — both say so rather than showing blanks
              </Type>
              {withoutPassport !== null && (
                <ProductDrawers
                  tabs={[
                    {
                      id: 'specification',
                      label: 'Details',
                      panel: (
                        <ProductSpecification
                          product={withoutPassport}
                          passport={null}
                          seller={null}
                        />
                      ),
                    },
                    {
                      id: 'condition',
                      label: 'Condition',
                      panel: <ConditionBlock product={withoutPassport} headless />,
                    },
                  ]}
                />
              )}
            </Col>
          </Grid>
        </Section>
      )}

      {/* ---------------------------------------------------------------- */}
      {fullPassport !== null && (
        <Section title="Passport — full data, longest chain, a repair, two owners">
          <PassportStory passport={fullPassport} />
        </Section>
      )}

      {partialPassport !== null && (
        <Section title="Passport — partial: no impact block, nothing authenticated">
          <PassportStory passport={partialPassport} />
        </Section>
      )}

      {correctedPassport !== null && (
        <Section title="Passport record — corrections beside the original declaration">
          <PassportRecord
            passport={correctedPassport}
            shareUrl="https://vaapsi.example/passport/psp_levis_501_indigo"
          />
        </Section>
      )}

      {withoutPassport !== null && (
        <Section title="Passport — absent">
          <Type size="sm" tone="muted" measure="default">
            {withoutPassport.brand} {withoutPassport.title} has no passport. On the product page the
            section is not rendered at all — no placeholder, no &ldquo;passport pending&rdquo;.
            There is deliberately nothing below this line.
          </Type>
          <Rule className="mt-4" />
        </Section>
      )}

      {/* ---------------------------------------------------------------- */}
      <Section title="Goes with this — a heuristic, labelled as one">
        <div className="max-w-[30rem]">
          <CompleteTheLook products={summaries.slice(0, 6)} heading="Goes with this" />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Empty and error states">
        <Grid gap="loose">
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase title={states.notFound.title} body={states.notFound.body} />
          </Col>
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase title={states.error.title} body={states.error.body} />
          </Col>
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase title={cart.empty.title} body={cart.empty.body} />
          </Col>
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase title={cart.checkout.notBuiltTitle} body={cart.checkout.notBuiltBody} />
          </Col>
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase title="Sold" body={states.productGone.body} />
          </Col>
          <Col mobile={4} tablet={4} desktop={4}>
            <StateCase
              title="Loading"
              body="The accent dot, pulsing. There is no spinner on this site."
            >
              <span className="mt-3 block size-1.5 animate-pulse rounded-full bg-accent" />
            </StateCase>
          </Col>
        </Grid>
      </Section>

      <div className="pb-32" />
    </Container>
  )
}

// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <Eyebrow as="h2" tone="muted">
        {title}
      </Eyebrow>
      <div className="pt-8">{children}</div>
    </section>
  )
}

function Case({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-4">
      <Type size="xs" tone="subtle" className="pb-2">
        {label}
      </Type>
      {children}
    </div>
  )
}

function CardCase({ label, summary }: { label: string; summary: ProductSummary | null }) {
  if (summary === null) return null
  return (
    <li>
      <Type size="xs" tone="subtle" className="pb-3">
        {label}
      </Type>
      <ProductCard product={summary} sizes="25vw" />
    </li>
  )
}

function AddToBagCase({
  label,
  product,
  availability,
}: {
  label: string
  product: Product
  availability: Availability
}) {
  return (
    <div>
      <Type size="xs" tone="subtle" className="pb-2">
        {label}
      </Type>
      {/* A distinct id per case, so adding one does not disable the others. */}
      <AddToBag productId={`${product.id}__${availability}`} availability={availability} />
    </div>
  )
}

function StateCase({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="border border-line p-5">
      <Type as="p" family="display" size="lg" weight="heading">
        {title}
      </Type>
      <Type size="sm" tone="muted" className="pt-2">
        {body}
      </Type>
      {children}
    </div>
  )
}
