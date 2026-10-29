'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ConfirmOrder } from './confirm-order'
import { DeliveryOptions } from './delivery-options'
import { MockPayment } from './mock-payment'
import type { PaymentMethodId } from './mock-payment'
import { useCart } from '../cart/use-cart'
import { Col, Container, Grid, Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import type { DeliveryOption } from '@/content/checkout'
import { PHOTO_QUALITY } from '@/lib/image'
import { formatArrival } from '@/lib/format/arrival'
import { formatInr } from '@/lib/format/currency'
import { orderGst } from '@/lib/format/gst'
import { useCartStore } from '@/lib/store/cart'

/**
 * The checkout page.
 *
 * ## What is real and what is a mock
 *
 * The form, the delivery choice and the totals are real. **Payment is a demo
 * mock, labelled as one on screen** — see `MockPayment`, which documents the
 * four safeguards that keep it impossible to mistake for a live checkout.
 * Nothing on this page is sent anywhere; there is no network call in the flow
 * except the one that resolves the bag.
 *
 * ## The summary shows the garments
 *
 * It used to show a subtotal and a count, which meant a shopper reached the last
 * step of a purchase without ever seeing what they were buying. It now lists
 * every line with its photograph, the chosen colour and size, and its price —
 * resolved live through `useCart`, so a garment that sells while someone fills
 * in their address is caught here rather than after payment.
 *
 * ## The arithmetic
 *
 * Subtotal comes from the resolved lines. A delivery fee adds; a delivery
 * discount subtracts and is floored, so a saving is never quoted larger than it
 * is.
 *
 * **GST is now a line on the summary**, replacing the note that used to say tax
 * would be shown at payment. It is a *component* of the total rather than an
 * addition to it, because every price on this site is GST-inclusive — which is
 * what a displayed price means in India — so the total does not move when the
 * row appears. `lib/format/gst` carries the rate split, the reason it is
 * extracted rather than added, and the resale question still open with the
 * accountants.
 *
 * ## One clock
 *
 * `now` is captured once, here, and handed to everything that states a delivery
 * date — the option rows, the summary, the confirmation dialog. Three
 * components each calling `new Date()` would eventually disagree with each
 * other by a day at midnight, and the estimate has to be the same number
 * everywhere it appears on one page.
 */
export function CheckoutView() {
  const { cart, isLoading } = useCart()
  const clear = useCartStore((state) => state.clear)

  const [delivery, setDelivery] = useState<DeliveryOption>(checkout.delivery.options[0]!)
  const [paymentReady, setPaymentReady] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card')
  const [placed, setPlaced] = useState<string | null>(null)

  /*
    One clock for the page, captured once on first render. A state initialiser
    rather than a bare `new Date()` in the body, so a re-render (choosing a
    delivery tier, typing a card number) does not silently re-date the order
    mid-session.
  */
  const [now] = useState(() => new Date())

  const lines = cart?.lines ?? []
  const activeLines = lines.filter((line) => line.status === 'active')
  const subtotalInr = activeLines.reduce((sum, line) => sum + line.priceAtAddInr, 0)

  const discount = Math.floor((subtotalInr * delivery.discountPercent) / 100)
  const total = subtotalInr - discount + delivery.feeInr

  // Contained in the prices above, not added to them. See the note on the
  // arithmetic — this figure is why the total does not change.
  const gst = orderGst({
    lineInr: activeLines.map((line) => line.priceAtAddInr),
    discountInr: discount,
    deliveryInr: delivery.feeInr,
  })

  const arrival = checkout.delivery.arrives(formatArrival(delivery.lead, now))

  // The dialog names the method back to the shopper rather than showing an id.
  const paymentLabel =
    checkout.payment.methods.find((entry) => entry.id === paymentMethod)?.label ?? ''

  if (placed !== null) return <Placed reference={placed} />

  if (!isLoading && lines.length === 0) return <EmptyBag />

  return (
    <Container>
      <Stack gap={6} className="py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{checkout.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {checkout.title}
          </Type>
        </Stack>

        <Grid gap="loose" rowGap="default">
          {/* ---- The form */}
          <Col mobile={4} tablet={8} desktop={7}>
            <Stack gap={8}>
              <Fieldset legend={checkout.steps.contact}>
                <Field
                  label={checkout.contact.email}
                  help={checkout.contact.emailHelp}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                />
                <Field
                  label={checkout.contact.phone}
                  help={checkout.contact.phoneHelp}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Fieldset>

              <Fieldset legend={checkout.steps.address}>
                <Field label={checkout.address.name} autoComplete="name" />
                <Field label={checkout.address.line1} autoComplete="address-line1" />
                <Field label={checkout.address.line2} autoComplete="address-line2" />
                <Row gap={3} wrap>
                  <div className="min-w-0 flex-1">
                    <Field label={checkout.address.city} autoComplete="address-level2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Field label={checkout.address.state} autoComplete="address-level1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Field
                      label={checkout.address.pin}
                      autoComplete="postal-code"
                      inputMode="numeric"
                    />
                  </div>
                </Row>
              </Fieldset>

              {/*
                Delivery after the address: the windows below only mean anything
                once a shopper has said where the parcel is going.
              */}
              <Stack gap={3}>
                <Eyebrow as="h2">{checkout.delivery.heading}</Eyebrow>
                <DeliveryOptions
                  subtotalInr={subtotalInr}
                  selected={delivery.id}
                  onChange={setDelivery}
                  now={now}
                />
              </Stack>

              <Stack gap={3} className="border-t border-line pt-6">
                <Eyebrow as="h2">{checkout.payment.heading}</Eyebrow>
                <MockPayment onValidityChange={setPaymentReady} onMethodChange={setPaymentMethod} />
              </Stack>

              <div className="border-t border-line pt-6">
                <ConfirmOrder
                  lines={activeLines}
                  subtotalInr={subtotalInr}
                  savingInr={discount}
                  totalInr={total}
                  deliveryWindow={arrival}
                  paymentLabel={paymentLabel}
                  disabled={!paymentReady || lines.length === 0}
                  onPlaced={() => {
                    setPlaced(reference())
                    clear()
                  }}
                />
              </div>
            </Stack>
          </Col>

          {/* ---- The summary, with the actual garments in it */}
          <Col mobile={4} tablet={8} desktop={5}>
            <Stack gap={4} className="border border-line p-6 desktop:sticky desktop:top-6">
              <Row gap={3} justify="between" align="baseline">
                <Eyebrow as="h2">{checkout.summary.heading}</Eyebrow>
                <Type as="span" size="xs" tone="subtle" numeric>
                  {checkout.summary.itemsHeading(lines.length)}
                </Type>
              </Row>
              <Rule />

              <Stack gap={4} as="ul">
                {lines.map((line) => (
                  <li key={line.id}>
                    <Row gap={3} align="start" wrap={false}>
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface">
                        <Image
                          src={line.product.primaryImage.url}
                          alt={line.product.primaryImage.alt}
                          fill
                          sizes="64px"
                          quality={PHOTO_QUALITY}
                          className="object-cover"
                        />
                      </div>

                      <Stack gap={0} className="min-w-0 flex-1">
                        <Type as="span" size="sm" weight="emphasis" truncate>
                          {line.product.title}
                        </Type>
                        {/* What is actually being charged for: the variant. */}
                        <Type as="span" size="xs" tone="muted" truncate>
                          {line.selection !== null
                            ? `${line.selection.colorName} · ${line.selection.sizeLabel}`
                            : `${line.product.color.name} · ${line.product.size.label}`}
                        </Type>
                        <Type as="span" size="xs" tone="subtle" truncate>
                          {line.product.composition}
                        </Type>
                      </Stack>

                      <Type as="span" size="sm" numeric className="shrink-0">
                        {formatInr(line.priceAtAddInr)}
                      </Type>
                    </Row>
                  </li>
                ))}
              </Stack>

              <Rule />

              <Stack gap={2}>
                <SummaryRow label={checkout.summary.subtotal} value={formatInr(subtotalInr)} />

                {/*
                  A negative number in the accent read as an error — red for
                  "− ₹1,845" tells a shopper something went wrong, when it is
                  the one line on the summary that is purely in their favour.
                  Green, and the same green as the tier that produced it, so
                  the two are visibly the same fact. See `--positive`.
                */}
                {discount > 0 && (
                  <SummaryRow
                    label={`${checkout.summary.discount} (${delivery.discountPercent}%)`}
                    value={`− ${formatInr(discount)}`}
                    positive
                  />
                )}

                {/*
                  One delivery row, labelled just "Delivery".

                  It used to read "Delivery · 15% off — Included", which was two
                  faults in one line: it repeated the tier name that the green
                  discount row above already carries, and "Included" described a
                  charge that now exists. The tier is named once, on the row that
                  says what it saved.
                */}
                <SummaryRow
                  label={checkout.summary.deliveryLabel}
                  value={formatInr(delivery.feeInr)}
                />

                {/*
                  GST. Inside the total rather than added to it, hence the
                  "included" qualifier — without it a shopper reasonably reads a
                  tax row as a further charge and expects the total to be higher
                  than the arithmetic above it.
                */}
                <SummaryRow
                  label={`${checkout.summary.gst} (${checkout.summary.gstIncluded})`}
                  value={formatInr(gst)}
                />
              </Stack>

              <Rule />
              <SummaryRow label={checkout.summary.total} value={formatInr(total)} strong />

              {/*
                When it lands. The page never said this outside the confirmation
                dialog, which meant the one fact a shopper most wants before
                committing was behind the commit button.
              */}
              <Row gap={3} justify="between" align="baseline" wrap={false} className="pt-1">
                <Type as="span" size="sm" tone="muted">
                  {checkout.delivery.arrivingLabel}
                </Type>
                <Type as="span" size="sm" weight="emphasis" numeric suppressHydrationWarning>
                  {formatArrival(delivery.lead, now)}
                </Type>
              </Row>

              <Type size="xs" tone="subtle">
                {checkout.delivery.provisionalNote}
              </Type>
            </Stack>
          </Col>
        </Grid>
      </Stack>
    </Container>
  )
}

/** A demo order reference. Not an order number — there is no order. */
function reference(): string {
  return `VP-DEMO-${Math.floor(Math.random() * 9000 + 1000)}`
}

function Placed({ reference }: { reference: string }) {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Eyebrow>{checkout.placed.eyebrow}</Eyebrow>
        <Type as="h1" family="display" size="3xl" weight="heading">
          {checkout.placed.title}
        </Type>
        <Type size="lg" tone="muted">
          {checkout.placed.body}
        </Type>
        <Row gap={2} align="baseline">
          <Type as="span" size="sm" tone="subtle">
            {checkout.placed.reference}
          </Type>
          <Type as="span" size="sm" numeric weight="emphasis">
            {reference}
          </Type>
        </Row>
        <Link
          href="/shop"
          className="ease mt-4 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {checkout.placed.continueAction}
        </Link>
      </Stack>
    </Container>
  )
}

function EmptyBag() {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Type as="h1" family="display" size="2xl" weight="heading">
          {checkout.summary.empty}
        </Type>
        <Link
          href="/shop"
          className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {checkout.summary.emptyAction}
        </Link>
      </Stack>
    </Container>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3">
        <Eyebrow as="span">{legend}</Eyebrow>
      </legend>
      <Stack gap={4}>{children}</Stack>
    </fieldset>
  )
}

/**
 * One field. A visible `<label>` wrapping its input rather than a placeholder
 * standing in for one — a placeholder disappears the moment someone types, which
 * is exactly when they most need to know what the box is for.
 */
function Field({
  label,
  help,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  label: string
  help?: string
  type?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
}) {
  return (
    <label className="block">
      <Type as="span" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <input
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
      />
      {help !== undefined && (
        <Type size="xs" tone="subtle" className="mt-1">
          {help}
        </Type>
      )}
    </label>
  )
}

function SummaryRow({
  label,
  value,
  strong = false,
  positive = false,
}: {
  label: string
  value: string
  strong?: boolean
  /** Money the shopper keeps. Savings only — never a total, never a charge. */
  positive?: boolean
}) {
  return (
    <Row gap={3} justify="between" align="baseline" wrap={false}>
      <Type as="span" size="sm" tone={positive ? 'positive' : 'muted'}>
        {label}
      </Type>
      <Type
        as="span"
        size={strong ? 'lg' : 'sm'}
        weight={strong ? 'heading' : positive ? 'emphasis' : 'regular'}
        tone={positive ? 'positive' : 'default'}
        numeric
      >
        {value}
      </Type>
    </Row>
  )
}
