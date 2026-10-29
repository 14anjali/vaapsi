'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Stack } from '@/components/primitives/layout'
import { Tabs } from '@/components/primitives/tabs'
import type { TabItem } from '@/components/primitives/tabs'
import { Eyebrow, Type } from '@/components/primitives/type'
import { sizeCharts, sizeGuide } from '@/content/size-guide'
import type { SizeChartId } from '@/content/size-guide'

/**
 * The size guide, opened from beside the size on the product page.
 *
 * ## Two tabs, because there are two different questions
 *
 * "What size am I" is answered by a **body** chart. "Will this piece fit me" is
 * answered by **this garment measured flat**. They are different numbers and
 * mixing them is how a size guide gets someone to order the wrong thing — a
 * 94cm bust and a 94cm garment chest are not the same claim, because the second
 * has no ease in it.
 *
 * So they are separate tabs, each says which it is, and the drawer states the
 * distinction in one line rather than hoping a shopper infers it. The garment
 * panel is passed in already rendered — it is the same measurements table the
 * details drawer uses, and it draws on the server.
 *
 * ## The chart is scoped, not exhaustive
 *
 * One chart, chosen for the garment's category, rather than every chart on the
 * site behind three more tabs. A shopper looking at jeans does not need the
 * neck measurements for shirts, and a guide that makes them find the right table
 * is a guide they close.
 *
 * ## Provenance is on the page
 *
 * The footer of the drawer says the numbers follow H&M's chart and that they are
 * provisional. That is deliberate: presenting another retailer's chart as
 * Vaapsi's own measured spec would be the actual problem here, and the note is
 * what makes it honest scaffolding rather than a silent borrow. See
 * `content/size-guide.ts` for the full warning.
 */
export function SizeGuide({
  chartId,
  /** The garment's own flat measurements, rendered on the server. */
  garmentPanel,
  /** Pre-loved garments run no ladder — see `oneOfOneNote`. */
  oneOfOne = false,
}: {
  chartId: SizeChartId
  garmentPanel?: React.ReactNode
  oneOfOne?: boolean
}) {
  const [open, setOpen] = useState(false)
  const chart = sizeCharts.find((candidate) => candidate.id === chartId) ?? sizeCharts[0]!

  const tabs: TabItem[] = [
    {
      id: 'body',
      label: sizeGuide.tabs.body,
      panel: (
        <Stack gap={5}>
          <Type size="sm" tone="muted" measure="default">
            {oneOfOne ? sizeGuide.oneOfOneNote : sizeGuide.standfirst}
          </Type>

          <ChartTable chart={chart} />

          <Stack gap={2} className="border-t border-line pt-5">
            <Eyebrow as="h3">{sizeGuide.howToMeasure.title}</Eyebrow>
            <Stack gap={2} as="ol">
              {sizeGuide.howToMeasure.steps.map((step) => (
                <Type key={step} as="li" size="sm" tone="muted">
                  {step}
                </Type>
              ))}
            </Stack>
          </Stack>
        </Stack>
      ),
    },
  ]

  if (garmentPanel !== undefined) {
    tabs.push({
      id: 'garment',
      label: sizeGuide.tabs.garment,
      panel: (
        <Stack gap={5}>
          <Type size="sm" tone="muted" measure="default">
            {sizeGuide.bodyVsGarment}
          </Type>
          {garmentPanel}
        </Stack>
      ),
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ease self-start text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-ink"
      >
        {sizeGuide.trigger}
      </button>

      <Overlay open={open} onClose={() => setOpen(false)} label={sizeGuide.title}>
        <Stack gap={5} className="p-6 tablet:p-8">
          <Row gap={4} justify="between" align="start">
            <Type as="h2" family="display" size="xl" weight="heading">
              {sizeGuide.title}
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

          <Tabs items={tabs} />

          <Stack gap={1} className="border-t border-line pt-4">
            <Type size="xs" tone="subtle">
              {sizeGuide.source}
            </Type>
            <Type size="xs" tone="subtle">
              {sizeGuide.sourcePending}
            </Type>
          </Stack>
        </Stack>
      </Overlay>
    </>
  )
}

/**
 * The chart.
 *
 * A real `<table>` with a proper header row, not a grid of divs: this is tabular
 * data, and a screen reader reading "M 88–94 70–76 96–102" as a flat run of
 * numbers is useless. `scope="row"` on the size cell means each measurement is
 * announced with both its column and its size.
 *
 * It scrolls inside its own container rather than widening the drawer, because
 * the bottoms chart has five columns and a phone has none to spare.
 */
function ChartTable({ chart }: { chart: (typeof sizeCharts)[number] }) {
  return (
    <Stack gap={2}>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[22rem] border-collapse text-left">
          <caption className="sr-only">
            {chart.label} — {chart.note}
          </caption>
          <thead>
            <tr className="border-b border-line-strong">
              {chart.columns.map((column) => (
                <th key={column} scope="col" className="py-2 pr-4 last:pr-0">
                  <Type as="span" size="xs" tone="subtle" tracking="caps">
                    {column}
                  </Type>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => (
              <tr key={row.size} className="border-b border-line last:border-0">
                <th scope="row" className="py-2.5 pr-4">
                  <Type as="span" size="sm" weight="emphasis">
                    {row.size}
                  </Type>
                </th>
                {row.values.map((value, index) => (
                  <td key={chart.columns[index + 1] ?? index} className="py-2.5 pr-4 last:pr-0">
                    <Type as="span" size="sm" tone="muted" numeric>
                      {value}
                    </Type>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Type size="xs" tone="subtle">
        {chart.note}
      </Type>
    </Stack>
  )
}
