import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PassportRecord } from '@/components/patterns/passport/record'
import { PassportStory } from '@/components/patterns/passport/story'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { getPassport, getProduct, listProducts } from '@/lib/data'
import { formatDate } from '@/lib/format/date'

type Params = { id: string }

/**
 * Prerender every passport that exists.
 *
 * This route is what a QR code printed on a garment resolves to, so it should be
 * a static file served fast from the edge rather than a render on every scan —
 * including scans of garments sold years ago. See the note on the product route
 * about `notFound()` and soft 404s.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const page = await listProducts({ limit: 500 })
  const passports = await Promise.all(
    page.items
      .filter((item) => item.passportId !== null)
      .map((item) => getPassport(item.passportId as string)),
  )
  return passports
    .filter((passport): passport is NonNullable<typeof passport> => passport !== null)
    .map((passport) => ({ id: passport.id }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const passport = await getPassport(params.id)
  if (passport === null) return { title: 'Not found' }
  const product = await getProduct(passport.productId)
  return {
    title:
      product === null
        ? PASSPORT_NAME.title
        : `${PASSPORT_NAME.title} — ${product.brand} ${product.title}`,
  }
}

/**
 * The standalone passport. **This is what the QR resolves to.**
 *
 * Recommendation, stated in the repo so the decision is on the record: the code
 * printed on a garment should point here, at a Vaapsi URL we control, with EuFSI
 * as the data source behind it. A QR is physically attached to an object for the
 * life of that object — pointing it at a third party's page means a vendor
 * change, a rebrand or a shutdown bricks every code already sewn into a garment.
 * (PRD open question #2.)
 *
 * Consequences of being a physical destination, all of them handled here:
 *
 * - Print styles. Someone will print this — a reseller establishing provenance,
 *   a shopper filing it. `print:` rules strip the shell and lay both sides out
 *   in sequence.
 * - It stands alone. It carries the garment's identity at the top, because a
 *   passport reached by scanning a label has no surrounding page to give it
 *   context.
 * - It works for a sold garment. Most scans will happen *after* the sale, by
 *   whoever owns the thing.
 */
export default async function PassportPage({ params }: { params: Params }) {
  const passport = await getPassport(params.id)
  if (passport === null) notFound()

  const product = await getProduct(passport.productId)
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaapsi.example'}/passport/${
    passport.id
  }`

  return (
    <Container>
      <article className="py-section-tight print:py-0">
        {/* ---- Identity. A scanned code arrives with no context. */}
        <header className="border-b border-line pb-8">
          <Stack gap={3}>
            <Eyebrow>{PASSPORT_NAME.title}</Eyebrow>

            {product !== null ? (
              <>
                <Type as="h1" family="display" size="3xl" weight="heading">
                  {product.title}
                </Type>
                <Row gap={3} align="baseline">
                  <Type size="base" tone="muted">
                    {product.brand}
                  </Type>
                  <Type size="sm" tone="subtle" numeric>
                    {product.sku}
                  </Type>
                </Row>
                <Link
                  href={`/product/${product.slug}`}
                  className="self-start border-b border-line pb-0.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink print:hidden"
                >
                  {product.availability === 'sold'
                    ? 'See the listing'
                    : 'See this piece in the shop'}
                </Link>
              </>
            ) : (
              // The passport outlives the listing. If the garment record is
              // gone, the record it carries is still valid and still resolves.
              <Type as="h1" family="display" size="3xl" weight="heading">
                {passport.productNo}
              </Type>
            )}

            <Type size="xs" tone="subtle" numeric className="pt-2">
              Signed {formatDate(passport.signedAt)} · {passport.issuer} · updated{' '}
              {formatDate(passport.lastUpdated)}
            </Type>
          </Stack>
        </header>

        {/*
          Both halves inline, no drawer. This route is what a QR printed on a
          garment resolves to, so it has to print complete — a printed record
          with half of it behind a button would be a broken artefact. It also
          means print no longer needs the overrides the old two-sided flip
          required.
        */}
        <div className="pt-8">
          <PassportStory passport={passport} />
        </div>

        <div className="mt-section-tight border-t border-line pt-8">
          <Eyebrow as="h2">{passportCopy.sections.back}</Eyebrow>
          <div className="pt-6">
            <PassportRecord passport={passport} shareUrl={shareUrl} />
          </div>
        </div>

        {/* Only visible in print: the URL, so a printed page is traceable back. */}
        <footer className="hidden pt-10 print:block">
          <Type size="xs" tone="subtle">
            {shareUrl}
          </Type>
          <Type size="xs" tone="subtle">
            {passport.isVoluntary ? passportCopy.voluntary : passportCopy.regulated}
          </Type>
        </footer>
      </article>
    </Container>
  )
}
