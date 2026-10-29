import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PassportImpact } from '@/components/patterns/passport/impact'
import { PassportRecord } from '@/components/patterns/passport/record'
import { PassportStory } from '@/components/patterns/passport/story'
import { Price } from '@/components/patterns/price'
import { AddToBag } from '@/components/patterns/product/add-to-bag'
import { ColorPicker } from '@/components/patterns/product/color-picker'
import { CustomiseSection } from '@/components/patterns/product/customise-section'
import { Customiser } from '@/components/patterns/product/customiser'
import { SizeAndMeasurements } from '@/components/patterns/product/measurements'
import { SizeGuide } from '@/components/patterns/product/size-guide'
import { CompleteTheLook } from '@/components/patterns/product/complete-the-look'
import { PreLovedAlternatives } from '@/components/patterns/product/preloved-alternatives'
import { ConditionBlock } from '@/components/patterns/product/condition-block'
import { Gallery } from '@/components/patterns/product/gallery'
import { PincodeCheck } from '@/components/patterns/product/pincode-check'
import { ProductDrawers } from '@/components/patterns/product/product-drawer'
import { ProductSpecification } from '@/components/patterns/product/specification'
import { Row, Stack } from '@/components/primitives/layout'
import type { TabItem } from '@/components/primitives/tabs'
import { Eyebrow, Type } from '@/components/primitives/type'
import { drawers } from '@/content/drawers'
import { chartForCategory } from '@/content/size-guide'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { conditionCopy, productPage } from '@/content/product'
import {
  getPassportByProduct,
  getProduct,
  getSeller,
  listProducts,
  listPreLovedAlternatives,
  listRelatedProducts,
} from '@/lib/data'
import { formatMonthYear } from '@/lib/format/date'
import { orderGalleryImages } from '@/lib/format/images'
import { productJsonLd, productMetadata } from '@/lib/seo'

type Params = { slug: string }

/**
 * Prerender every garment currently listed.
 *
 * Known limitation, documented so nobody files it twice: for a slug that does
 * not exist, `notFound()` renders the 404 page but the HTTP status is 200,
 * because Next has already streamed the shell by the time the lookup fails. Next
 * injects `noindex` on that response, so it is not indexed, but it is a soft
 * 404. Fixing it needs `dynamicParams = false` (which would 404 every new
 * listing until the next deploy) or a non-streaming render. Neither trade is
 * worth it.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const page = await listProducts({ limit: 500 })
  return page.items.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (product === null) return { title: 'Not found' }
  return productMetadata(product)
}

/**
 * Product detail.
 *
 * ## The page is the split, and nothing else
 *
 * Photographs own the left half of the viewport edge-to-edge; the buying
 * decision owns the right half and does not move. Below it: nothing. Every
 * section that used to stack under the fold — specification, condition, the
 * passport, the impact figures — is now a tab inside one drawer.
 *
 * That content is not less important for being behind a control. It is *more*
 * reachable: one click from the buy button rather than three screens of scroll,
 * and the shopper picks which question to answer instead of being walked past
 * all four.
 *
 * ## The trade, stated
 *
 * Moving the passport into a drawer takes it out of this page's own markup, and
 * the passport is the genuinely novel content on this site. That is why
 * **`/passport/[id]` still renders it inline, stays in the sitemap, and remains
 * what a printed QR resolves to.** The drawer is the convenient home; that route
 * is the canonical one. Structured data on this page still links to it.
 */
export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct(params.slug)
  if (product === null) notFound()

  const [passport, seller, related, preLovedAlternatives] = await Promise.all([
    getPassportByProduct(product.id),
    getSeller(product.sellerId),
    listRelatedProducts(product.id, 8),
    // The cheaper, second-hand route. Same category, strictly cheaper — the
    // adapter enforces both.
    listPreLovedAlternatives(product.id, 4),
  ])

  const images = orderGalleryImages(product.images)
  const sold = product.availability === 'sold'
  // Pre-loved only. New stock shows a colour picker and a size guide in the
  // space this used to occupy.
  const condition = product.condition === null ? null : conditionCopy[product.condition]
  const passportUrl =
    passport === null
      ? null
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaapsi.example'}/passport/${passport.id}`

  /*
   * The drawer's panels, rendered here on the server. `PassportRecord` awaits a
   * QR encode and the charts are static, so none of this needs to ship to the
   * browser — the drawer itself is the only client component involved.
   */
  const tabs: TabItem[] = [
    {
      id: 'specification',
      label: drawers.tabs.specification,
      panel: <ProductSpecification product={product} passport={passport} seller={seller} />,
    },
    // Pre-loved only. There is no wear to describe on new stock, so the tab is
    // absent rather than present and empty.
    ...(condition === null
      ? []
      : [
          {
            id: 'condition',
            label: drawers.tabs.condition,
            hint: condition.label,
            panel: <ConditionBlock product={product} headless />,
          },
        ]),
  ]

  if (passport !== null && passportUrl !== null) {
    tabs.push({
      id: 'passport',
      label: drawers.tabs.passport,
      hint: passport.ownersCount === 1 ? '1 owner' : `${passport.ownersCount} owners`,
      panel: (
        <Stack gap={10}>
          <PassportStory passport={passport} showImpact={false} />

          <div className="border-t border-line pt-8">
            <Row gap={4} justify="between" align="baseline" className="pb-6">
              <Eyebrow as="h3">{passportCopy.sections.back}</Eyebrow>
              <Link
                href={`/passport/${passport.id}`}
                className="border-b border-line pb-0.5 text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                Open on its own
              </Link>
            </Row>
            <PassportRecord passport={passport} shareUrl={passportUrl} />
          </div>
        </Stack>
      ),
    })

    tabs.push({
      id: 'impact',
      label: drawers.tabs.impact,
      panel: <PassportImpact passport={passport} />,
    })
  }

  return (
    <>
      {/*
        Product structured data. Availability and condition are the fields that
        matter here — a sold one-of-one marked InStock is both a Merchant Center
        violation and a shopper sent to a page that cannot sell them anything.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd({ product, passport, seller })),
        }}
      />

      <div className="desktop:grid desktop:grid-cols-2 desktop:items-start">
        <Gallery images={images} sold={sold} productId={product.id} />

        {/*
          Sticky, and top-aligned rather than centred.

          It used to be vertically centred against a column of full-height
          photographs. The gallery is now hero-plus-thumbnails and roughly one
          screen tall, so centring left a band of dead space above the brand line
          and pushed the price below the fold on shorter laptops. Aligning both
          columns to the top puts the name, price and the buy controls on the
          first screen, which is the whole point of the gallery change.
        */}
        <div className="desktop:sticky desktop:top-0 desktop:flex desktop:max-h-svh desktop:items-start desktop:overflow-y-auto">
          <div className="w-full px-gutter py-10 desktop:max-w-[30rem] desktop:py-12">
            <Stack gap={5}>
              <Stack gap={2}>
                <Eyebrow>{product.brand}</Eyebrow>
                <Type as="h1" family="display" size="2xl" weight="heading">
                  {product.title}
                </Type>
                <Price
                  priceInr={product.priceInr}
                  originalRetailInr={product.originalRetailInr}
                  availability={product.availability}
                  size="large"
                  showSaving
                />
                {product.originalRetailInr === null && !sold && (
                  <Type size="xs" tone="subtle">
                    {productPage.originalRetailUnknown}
                  </Type>
                )}
              </Stack>

              {/*
                Condition, in the buying column. Not the full disclosure — that
                is a tab — but the grade and its one-line summary, because a
                shopper should never have to click to find out what they are
                being promised.
              */}
              {condition !== null && (
                <Stack gap={1} className="border-t border-line pt-4">
                  <Row gap={2} align="baseline">
                    <Type as="span" size="xs" tone="subtle" tracking="caps">
                      {productPage.sections.condition}
                    </Type>
                    <Type as="span" size="sm" weight="emphasis">
                      {condition.label}
                    </Type>
                  </Row>
                  <Type size="xs" tone="muted">
                    {condition.short}
                  </Type>
                </Stack>
              )}

              {/*
                Two different controls for two different inventories.

                New stock gets a colour picker and a size row, because there are
                genuinely several of each to choose between. A pre-loved garment
                gets its own label transcribed and nothing to pick, because there
                is exactly one of it in exactly one size — a disabled size row
                there would imply options that do not exist.

                The size guide sits with whichever of the two is showing, since
                "what size am I" is the same question either way.
              */}
              <Stack gap={3} className="border-t border-line pt-4">
                {product.colorVariants.length > 0 ? (
                  <ColorPicker
                    variants={product.colorVariants}
                    defaultColorSlug={product.color.slug}
                    priceInr={product.priceInr}
                  />
                ) : (
                  <Stack gap={1}>
                    <Row gap={2} align="baseline">
                      <Type as="span" size="xs" tone="subtle" tracking="caps">
                        Size
                      </Type>
                      <Type as="span" size="sm" weight="emphasis">
                        {product.size.label}
                      </Type>
                      <Type as="span" size="xs" tone="subtle">
                        as labelled ({product.size.system})
                      </Type>
                    </Row>
                    <Type size="xs" tone="muted">
                      {productPage.oneOfOne}
                    </Type>
                  </Stack>
                )}

                <SizeGuide
                  chartId={chartForCategory(product.category)}
                  garmentPanel={
                    <SizeAndMeasurements size={product.size} measurements={product.measurements} />
                  }
                  oneOfOne={product.listingType === 'pre_loved'}
                />
              </Stack>

              <AddToBag productId={product.id} availability={product.availability} />

              {/*
                Make it your own.

                Directly under the buy button and above the drawers, which is a
                deliberate choice about prominence: it is the last thing a
                shopper meets before they stop reading, and burying it in a
                drawer would turn an argument the brand cares about into an
                option nobody opens. Still collapsed by default — see
                `CustomiseSection` — because a five-item configurator open on
                arrival competes with the price.
              */}
              <div className="border-t border-line pt-5">
                <CustomiseSection>
                  <Customiser category={product.category} hasPassport={passport !== null} />
                </CustomiseSection>
              </div>

              {/* The drawers. Everything that used to stack below the fold. */}
              <div className="border-t border-line pt-5">
                <ProductDrawers tabs={tabs} />
              </div>

              <div className="border-t border-line pt-5">
                <CompleteTheLook products={related} heading={productPage.goesWith} />
              </div>

              {/*
                The cheaper route, directly under "Goes with this". Both are
                ways out of this page; this one is the one that also introduces
                the resale side to a shopper who arrived through the front door.
              */}
              {preLovedAlternatives.length > 0 && (
                <div className="border-t border-line pt-5">
                  <PreLovedAlternatives
                    products={preLovedAlternatives}
                    comparedToInr={product.priceInr}
                  />
                </div>
              )}

              <div className="border-t border-line pt-5">
                <PincodeCheck />
              </div>

              {seller !== null && (
                <Row gap={2} align="baseline" className="border-t border-line pt-4">
                  <Type as="span" size="xs" tone="subtle">
                    Listed by {seller.displayName},
                  </Type>
                  <Type as="span" size="xs" tone="subtle" numeric>
                    on Vaapsi since {formatMonthYear(seller.memberSince)}
                  </Type>
                </Row>
              )}
            </Stack>
          </div>
        </div>
      </div>

      {/*
        Nothing below the split. The passport keeps a crawlable home at
        /passport/[id], which is also what the QR resolves to and what the
        sitemap points at — see PASSPORT_NAME usage there.
      */}
      {passport !== null && (
        <div className="sr-only">
          <Link href={`/passport/${passport.id}`}>
            {PASSPORT_NAME.title} for {product.brand} {product.title}
          </Link>
        </div>
      )}
    </>
  )
}
