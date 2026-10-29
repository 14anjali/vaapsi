'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import { PHOTO_QUALITY } from '@/lib/image'
import type { CartLine } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * "Are you sure you want to buy?" — the gate between a filled-in form and a
 * placed order.
 *
 * ## Why this exists at all
 *
 * A bare Pay button is the most consequential control on the site with the least
 * ceremony around it. This restates the things somebody actually regrets getting
 * wrong — what they are buying, what it costs, when it arrives — and asks for a
 * second, deliberate action.
 *
 * On a one-of-one marketplace it earns its place twice over: confirming takes a
 * pre-loved garment out of the catalogue permanently, and the copy says so
 * rather than leaving it as a surprise.
 *
 * ## Why a centred modal, and not a drawer
 *
 * It used to arrive as a side drawer, and that was the wrong instrument. A
 * drawer is a *place*: the bag, the filters and the nav all live at an edge, you
 * slide them open, you look through them, they go back. This has no home to
 * return to. It is one question, asked once, and it should land in front of the
 * shopper rather than beside them — sliding it in from the right made the single
 * most consequential moment in the flow read like another panel to skim.
 *
 * Not an inline expander either, for the original reason: it should interrupt.
 * Everything else on the checkout page can be scrolled past.
 *
 * ## It summarises. It does not re-list
 *
 * The page's right-hand column already itemises the order — photograph, colour,
 * size, composition, price, per line. Repeating that table inside the dialog
 * showed the shopper the same thing twice and buried the four facts the decision
 * actually turns on. So the garments appear as a strip of thumbnails, which is
 * enough to recognise your own order at a glance, and then the numbers: what it
 * comes to, what the wait saved, when it arrives, how it is being paid.
 *
 * The saving is the one figure in colour. See `--positive` in tokens.css.
 *
 * ## Not a dark pattern in reverse, either
 *
 * "Not yet" is a real, equally-weighted way out — not a greyed link tucked under
 * the primary button. A confirmation step that makes cancelling hard is worse
 * than no confirmation step, because it adds friction without adding a choice.
 */

/** How many garments the strip shows before it collapses into "+N". */
const THUMBS = 4

export function ConfirmOrder({
  lines,
  subtotalInr,
  savingInr,
  totalInr,
  deliveryWindow,
  paymentLabel,
  disabled,
  onPlaced,
}: {
  lines: readonly CartLine[]
  subtotalInr: number
  /** The delivery discount, in paise. Zero on Standard. */
  savingInr: number
  totalInr: number
  /**
   * The estimated arrival, already formatted as a date by the page.
   *
   * A string rather than a lead time, because the page owns the clock — three
   * components each calling `new Date()` would disagree with each other by a
   * day at midnight, and this figure has to match the one on the summary
   * beside it. It used to be "arrives in about 30 days", which asked the
   * shopper to do the arithmetic at the exact moment they are committing.
   */
  deliveryWindow: string
  /** The chosen payment method, named back to the shopper. */
  paymentLabel: string
  /** True until the form and mock payment look complete. */
  disabled: boolean
  onPlaced: () => void
}) {
  const [open, setOpen] = useState(false)
  const [placing, setPlacing] = useState(false)

  const shown = lines.slice(0, THUMBS)
  const hidden = lines.length - shown.length

  function place() {
    setPlacing(true)
    // A beat, so the state change is legible rather than instant. There is no
    // request behind this — see MockPayment.
    window.setTimeout(() => {
      setPlacing(false)
      setOpen(false)
      onPlaced()
    }, 700)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-disabled={disabled}
        onClickCapture={(event) => {
          if (disabled) event.stopPropagation()
        }}
        className={cn(
          'ease w-full px-6 py-3.5 text-sm transition-colors duration-fast',
          disabled
            ? 'cursor-default border border-line text-ink-subtle'
            : 'bg-ink text-background hover:bg-ink-muted',
        )}
      >
        {checkout.confirm.trigger}
      </button>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        label={checkout.confirm.title}
        side="center"
      >
        <Stack gap={5} className="p-6">
          <Row gap={4} justify="between" align="start">
            <Type as="h2" family="display" size="xl" weight="heading">
              {checkout.confirm.title}
            </Type>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="ease -m-2 p-2 text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
          </Row>

          <Type size="sm" tone="muted" measure="default">
            {checkout.confirm.body}
          </Type>

          {/*
            The garments, as objects rather than as a table. Four thumbnails is
            enough to recognise your own order; the count carries the rest.
          */}
          <Stack gap={2}>
            <Row gap={3} justify="between" align="baseline">
              <Eyebrow as="h3">{checkout.confirm.itemsLabel}</Eyebrow>
              <Type as="span" size="xs" tone="subtle" numeric>
                {checkout.confirm.itemCount(lines.length)}
              </Type>
            </Row>

            <Row gap={2} align="center">
              {shown.map((line) => (
                <div
                  key={line.id}
                  className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface"
                  /* The names are one line down; a tooltip is the only place a
                     mouse user gets them without leaving the dialog. */
                  title={line.product.title}
                >
                  <Image
                    src={line.product.primaryImage.url}
                    alt={line.product.primaryImage.alt}
                    fill
                    sizes="64px"
                    quality={PHOTO_QUALITY}
                    className="object-cover"
                  />
                </div>
              ))}
              {hidden > 0 && (
                <Type
                  as="span"
                  size="sm"
                  tone="muted"
                  numeric
                  className="flex h-20 w-16 shrink-0 items-center justify-center border border-line"
                >
                  {checkout.confirm.more(hidden)}
                </Type>
              )}
            </Row>

            {/*
              The names, in one line, under the pictures. A shopper checking
              "did I buy the right jacket" reads the strip; a shopper checking
              "did I buy both" reads this.
            */}
            <Type size="xs" tone="subtle" truncate>
              {lines.map((line) => line.product.title).join(' · ')}
            </Type>
          </Stack>

          {/* The four numbers the decision turns on. */}
          <Stack gap={2} className="border-t border-line pt-4">
            <SummaryLine label={checkout.confirm.subtotalLabel} value={formatInr(subtotalInr)} />

            {savingInr > 0 && (
              <SummaryLine
                label={checkout.confirm.savedLabel}
                value={`− ${formatInr(savingInr)}`}
                positive
              />
            )}

            <SummaryLine
              label={checkout.confirm.deliveryLabel}
              value={deliveryWindow}
              suppressHydrationWarning
            />
            <SummaryLine label={checkout.confirm.payingLabel} value={paymentLabel} />

            <Row gap={3} justify="between" align="baseline" className="pt-2">
              <Type as="span" size="sm" tone="muted">
                {checkout.confirm.totalLabel}
              </Type>
              <Type as="span" size="2xl" family="display" weight="heading" numeric>
                {formatInr(totalInr)}
              </Type>
            </Row>
          </Stack>

          {/* Both ways out, weighted the same. See the note above. */}
          <Row gap={3} wrap={false} className="pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ease flex-1 border border-line-strong px-5 py-3 text-sm text-ink transition-colors duration-fast hover:bg-surface"
            >
              {checkout.confirm.cancel}
            </button>
            <button
              type="button"
              onClick={place}
              disabled={placing}
              className="ease flex-1 bg-ink px-5 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted disabled:opacity-70"
            >
              {placing ? checkout.confirm.placing : checkout.confirm.confirm}
            </button>
          </Row>
        </Stack>
      </Overlay>
    </>
  )
}

/** One label-and-figure line. `positive` is for money kept, and nothing else. */
function SummaryLine({
  label,
  value,
  positive = false,
  suppressHydrationWarning = false,
}: {
  label: string
  value: string
  positive?: boolean
  /** For the arrival date, which is derived from the clock. */
  suppressHydrationWarning?: boolean
}) {
  return (
    <Row gap={3} justify="between" align="baseline" wrap={false}>
      <Type as="span" size="sm" tone={positive ? 'positive' : 'muted'}>
        {label}
      </Type>
      <Type
        as="span"
        size="sm"
        tone={positive ? 'positive' : 'default'}
        numeric
        suppressHydrationWarning={suppressHydrationWarning}
      >
        {value}
      </Type>
    </Row>
  )
}
