import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { Container, Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { listOrders } from '@/lib/data'
import { formatInr } from '@/lib/format/currency'
import { formatMonthYear } from '@/lib/format/date'
import { PHOTO_QUALITY } from '@/lib/image'
import type { Order, OrderLine } from '@/lib/types'

export const metadata: Metadata = {
  title: accountCopy.purchases.title,
  robots: { index: false, follow: false },
}

/**
 * Your purchases — and the only way into a resale listing.
 *
 * ## Why this page is the spine of resale
 *
 * Selling here is gated on provenance: you can only list something you bought
 * from us. So there is no "create a listing" form anywhere on the site — one
 * would have to open by asking a stranger to prove where a garment came from,
 * and no form design solves that. Starting from an order line means the garment,
 * its passport, the price paid, the date and the colourway are all already
 * known, and the seller confirms rather than types.
 *
 * That is why "Sell this back" sits on the line itself rather than behind a
 * separate section: the line *is* the entitlement.
 *
 * ## A line already on its way back shows that instead
 *
 * Offering to sell the same garment twice is the obvious failure here, and it is
 * silent — a seller would fill in the whole flow before anything objected. A
 * line with a `resaleRequestId` renders its state and no action.
 */
export default async function PurchasesPage() {
  const orders = await listOrders()

  return (
    <Container>
      <Stack gap={6} className="py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.purchases.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.purchases.title}
          </Type>
          <Type size="lg" tone="muted" measure="default">
            {accountCopy.purchases.lede}
          </Type>
        </Stack>

        {orders.length === 0 ? (
          <Stack gap={3}>
            <Type size="sm" tone="muted">
              {accountCopy.purchases.empty}
            </Type>
            <Link
              href="/shop"
              className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
            >
              {accountCopy.purchases.emptyAction}
            </Link>
          </Stack>
        ) : (
          <Stack gap={8}>
            {orders.map((order) => (
              <OrderBlock key={order.id} order={order} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

function OrderBlock({ order }: { order: Order }) {
  return (
    <Stack gap={3} as="section">
      <Row gap={3} justify="between" align="baseline" wrap>
        <Stack gap={0}>
          <Type as="h2" size="sm" weight="emphasis">
            {accountCopy.purchases.orderRef(order.reference)}
          </Type>
          <Type as="span" size="xs" tone="subtle">
            {accountCopy.purchases.placedOn(formatMonthYear(order.placedAt))} ·{' '}
            {accountCopy.purchases.statuses[order.status]}
          </Type>
        </Stack>
        <Stack gap={0} className="text-right">
          <Type as="span" size="xs" tone="subtle">
            {accountCopy.purchases.paid}
          </Type>
          <Type as="span" size="sm" numeric weight="emphasis">
            {formatInr(order.totalPaidInr)}
          </Type>
        </Stack>
      </Row>

      <Rule />

      <Stack gap={5} as="ul">
        {order.lines.map((line) => (
          <li key={line.id}>
            <PurchaseLine line={line} />
          </li>
        ))}
      </Stack>
    </Stack>
  )
}

function PurchaseLine({ line }: { line: OrderLine }) {
  const beingSold = line.resaleRequestId !== null

  return (
    <Row gap={4} align="start" wrap={false}>
      <Link
        href={`/product/${line.product.slug}`}
        className="w-22 relative h-28 shrink-0 overflow-hidden bg-surface"
      >
        <Image
          src={line.product.primaryImage.url}
          alt={line.product.primaryImage.alt}
          fill
          sizes="88px"
          quality={PHOTO_QUALITY}
          className="object-cover"
        />
      </Link>

      <Stack gap={1} className="min-w-0 flex-1">
        <Type as="h3" size="sm" weight="emphasis" truncate>
          {line.product.title}
        </Type>
        <Type as="span" size="xs" tone="muted" truncate>
          {line.selection !== null
            ? `${line.selection.colorName} · ${line.selection.sizeLabel}`
            : `${line.product.color.name} · ${line.size.label}`}
        </Type>
        <Type as="span" size="xs" tone="subtle" numeric>
          {accountCopy.purchases.paid} {formatInr(line.pricePaidInr)}
        </Type>

        {beingSold ? (
          // Already on its way back. Showing state rather than an action is what
          // stops a seller filling in the whole flow for a garment we already
          // have.
          <Row gap={2} align="center" className="pt-2">
            <Clock className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden />
            <Stack gap={0}>
              <Type as="span" size="xs" weight="emphasis">
                {accountCopy.purchases.resaleInProgress}
              </Type>
              <Type as="span" size="xs" tone="subtle">
                {accountCopy.purchases.resaleInProgressNote}
              </Type>
            </Stack>
          </Row>
        ) : (
          <Link
            href={`/account/sell/${line.id}`}
            className="ease mt-2 inline-flex items-center gap-1.5 self-start border border-line-strong px-3 py-1.5 text-xs text-ink transition-colors duration-fast hover:bg-surface"
          >
            {accountCopy.purchases.sellAction}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </Stack>
    </Row>
  )
}
