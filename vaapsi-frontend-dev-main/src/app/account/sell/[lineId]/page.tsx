import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SellClient } from './sell-client'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { getOrderLine, listResaleShots } from '@/lib/data'

export const metadata: Metadata = {
  title: accountCopy.sell.eyebrow,
  robots: { index: false, follow: false },
}

/**
 * Sell one purchased garment back.
 *
 * Keyed on an **order line**, not on a product, and that is the whole
 * entitlement model: the URL cannot be constructed for something the shopper
 * never bought, because the id belongs to their order. A 404 here is the
 * provenance rule enforcing itself — there is no listing form to reach.
 *
 * A line already sent back also 404s rather than offering the flow twice.
 */
export default async function SellPage({ params }: { params: { lineId: string } }) {
  const [found, shots] = await Promise.all([getOrderLine(params.lineId), listResaleShots()])
  if (found === null) notFound()

  // Already with us. Offering the flow again would let someone submit the same
  // garment twice and only discover it at the studio.
  if (found.line.resaleRequestId !== null) notFound()

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.sell.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.sell.title(found.line.product.title)}
          </Type>
          <Type size="lg" tone="muted" measure="default">
            {accountCopy.sell.lede}
          </Type>
          {/*
            What the read actually is. Stated before the flow rather than in
            small print after the number, because a quote that looks like a
            valuation and is a formula is the one thing this must not be
            mistaken for.
          */}
          <Type size="xs" tone="subtle" measure="default">
            {accountCopy.sell.disclosure}
          </Type>
        </Stack>

        <SellClient line={found.line} shots={shots} />
      </Stack>
    </Container>
  )
}
