'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Stack } from '@/components/primitives/layout'
import { Tabs } from '@/components/primitives/tabs'
import type { TabItem } from '@/components/primitives/tabs'
import { Type } from '@/components/primitives/type'
import { Eyebrow } from '@/components/primitives/type'
import { drawers } from '@/content/drawers'

/**
 * The product-page drawers.
 *
 * **Everything below the photographs now lives in here.** The page is the split
 * — photographs and the buying decision — and nothing else. Specification,
 * condition, the passport and the impact figures are four tabs inside one
 * drawer, and Delivery and returns is a second drawer beside it.
 *
 * A shell, deliberately: the panels arrive as props, already rendered on the
 * server. `PassportRecord` awaits a QR encode and `ProductSpecification` draws
 * charts, neither of which needs to ship to the browser. All this component
 * contributes is the trigger, the overlay and the tab mechanics.
 *
 * ## What this replaced
 *
 * Condition and the passport were full-width sections stacked under the split.
 * They were the right *content* — they are what makes a resale listing
 * believable — but as a page they meant every shopper scrolled past three
 * screens of reference material whether or not they wanted it, and the
 * differentiator sat at the bottom where it looked like an appendix.
 *
 * Behind one control with four tabs, the whole set is one click from the buy
 * button and a shopper chooses which question to answer. The trade is that this
 * content is no longer in the page's own markup — which is why
 * **`/passport/[id]` still renders the passport inline and stays in the
 * sitemap.** That route is the indexable, printable, QR-resolvable home for it;
 * the drawer is the convenient one.
 */

type Which = 'details' | 'delivery' | null

export function ProductDrawers({
  tabs,
  triggerLabel = drawers.details.trigger,
}: {
  /** Server-rendered panels: specification, condition, passport, impact. */
  tabs: readonly TabItem[]
  triggerLabel?: string
}) {
  const [open, setOpen] = useState<Which>(null)

  return (
    <>
      <Stack gap={3} as="ul">
        <li>
          <DrawerTrigger onClick={() => setOpen('details')}>{triggerLabel}</DrawerTrigger>
        </li>
        <li>
          <DrawerTrigger onClick={() => setOpen('delivery')}>
            {drawers.delivery.trigger}
          </DrawerTrigger>
        </li>
      </Stack>

      <Overlay
        open={open === 'details'}
        onClose={() => setOpen(null)}
        label={drawers.details.heading}
        side="right"
        // Wider than the other panels: the passport tab carries a timeline that
        // needs room to read as a line rather than as a stack.
        className="desktop:max-w-[56rem]"
      >
        <DrawerShell heading={drawers.details.heading} onClose={() => setOpen(null)}>
          <Tabs items={tabs} />
        </DrawerShell>
      </Overlay>

      <Overlay
        open={open === 'delivery'}
        onClose={() => setOpen(null)}
        label={drawers.delivery.heading}
        side="right"
        className="desktop:max-w-[40rem]"
      >
        <DrawerShell heading={drawers.delivery.heading} onClose={() => setOpen(null)}>
          <DeliveryBody />
        </DrawerShell>
      </Overlay>
    </>
  )
}

export function DrawerTrigger({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ease text-left text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:decoration-ink"
    >
      {children}
    </button>
  )
}

/** The panel chrome. Close control top-right, where a reader's hand already is. */
export function DrawerShell({
  heading,
  onClose,
  children,
}: {
  heading: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <Row
        gap={4}
        justify="between"
        align="start"
        className="shrink-0 border-b border-line px-gutter py-5"
      >
        <Type as="h2" family="display" size="xl" weight="heading">
          {heading}
        </Type>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 -mt-1 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <span className="sr-only">{drawers.close}</span>
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </Row>

      <div className="flex-1 overflow-y-auto px-gutter py-6">{children}</div>
    </>
  )
}

function DeliveryBody() {
  return (
    <Stack gap={6}>
      <section>
        <Eyebrow as="h3">{drawers.delivery.sections.delivery}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.deliveryBody}
        </Type>
      </section>
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.delivery.sections.returns}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.returnsBody}
        </Type>
      </section>
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.delivery.sections.oneOfOne}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.oneOfOneBody}
        </Type>
      </section>
    </Stack>
  )
}
