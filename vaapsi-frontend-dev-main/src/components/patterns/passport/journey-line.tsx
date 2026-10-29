import { ProvenanceDot } from './provenance-dot'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { formatDate } from '@/lib/format/date'
import type { ChainEvent, ChainEventType } from '@/lib/types'

/**
 * The journey line.
 *
 * Still the emotional centre of the product, and still typographic rather than
 * iconographic — no icons per event type, no coloured stages, no progress bar. A
 * garment's life is not a checkout funnel and it has no completion percentage.
 *
 * ## What was cut, and why
 *
 * Each event was rendering five stacked lines: label, date, actor, note, and an
 * italic sentence saying how we knew. On an eight-event chain that is forty lines
 * of text, and the fifth line was the worst offender — *"Stated by the owner at
 * intake"* appeared three times on one passport, so the repetition trained the
 * eye to skip exactly the field that carries the honesty.
 *
 * Now: **label, date, actor**, plus the note only when there is one. How we know
 * is carried by the **provenance mark on the rail**, which is already labelled
 * for assistive tech and already the site's established vocabulary for
 * confidence. The verification sentences are collected once, under the line, in a
 * disclosure — said properly in one place instead of badly in eight.
 *
 * That is roughly a 40% reduction in text with no loss of information, and the
 * shape of the garment's life is now legible at a glance.
 */

/**
 * Shopper-facing labels. Deliberately the same verbs as the home page explainer,
 * so someone who read that arrives here recognising them.
 */
const EVENT_LABEL: Record<ChainEventType, string> = {
  made: 'Made',
  first_sold: 'First sold',
  owned: 'Owned',
  returned: 'Came back',
  inspected: 'Inspected',
  repaired: 'Repaired',
  // Not "Personalised". An owner had something added; the record says what
  // happened, in the same register as the rest of the verbs.
  customised: 'Added to',
  relisted: 'Relisted',
}

export function JourneyLine({ chain }: { chain: readonly ChainEvent[] }) {
  if (chain.length === 0) return null

  return (
    <Stack gap={5}>
      {/* Mobile and tablet: vertical. */}
      <ol className="desktop:hidden">
        {chain.map((event) => (
          <li key={event.id} className="grid grid-cols-[auto_1fr] gap-x-4">
            <div className="relative flex w-3 justify-center">
              {/* The rule runs through the marks, so the sequence reads as a line
                  rather than as a stack of rows. */}
              <span className="absolute inset-y-0 w-px bg-line" aria-hidden />
              <span className="relative bg-background py-1">
                <ProvenanceDot provenance={event.verification.provenance} />
              </span>
            </div>
            <div className="pb-5">
              <EventBody event={event} />
            </div>
          </li>
        ))}
      </ol>

      {/* Desktop: horizontal. */}
      <ol
        className="hidden desktop:grid"
        style={{ gridTemplateColumns: `repeat(${chain.length}, minmax(0, 1fr))` }}
      >
        {chain.map((event) => (
          <li key={event.id} className="relative pr-4">
            <span className="absolute left-0 right-0 top-1.5 h-px bg-line" aria-hidden />
            <span className="relative -ml-px inline-block bg-background pr-1.5">
              <ProvenanceDot provenance={event.verification.provenance} />
            </span>
            <div className="pt-3">
              <EventBody event={event} />
            </div>
          </li>
        ))}
      </ol>

      {/*
        How each step is known — collected once. The provenance marks on the rail
        already carry the confidence; this is the detail behind them, for the
        shopper who wants it and for anyone auditing the record.
      */}
      <details className="group/verify">
        <summary className="cursor-pointer text-xs text-ink-subtle transition-colors hover:text-ink-muted">
          How each step was verified
        </summary>
        <Stack gap={2} as="ul" className="pt-3">
          {chain.map((event) => (
            <Row key={event.id} gap={3} align="baseline" as="li" wrap={false}>
              <ProvenanceDot provenance={event.verification.provenance} className="mt-1" />
              <Type as="span" size="xs" tone="muted">
                {EVENT_LABEL[event.type]}
              </Type>
              <Type as="span" size="xs" tone="subtle" aria-hidden>
                —
              </Type>
              <Type as="span" size="xs" tone="subtle">
                {event.verification.value}
              </Type>
            </Row>
          ))}
        </Stack>
      </details>
    </Stack>
  )
}

function EventBody({ event }: { event: ChainEvent }) {
  return (
    <Stack gap={0}>
      <Type as="p" family="display" size="base" weight="heading">
        {EVENT_LABEL[event.type]}
      </Type>
      <Type as="time" size="xs" tone="subtle" numeric dateTime={event.date}>
        {formatDate(event.date)}
      </Type>
      <Type as="p" size="xs" tone="muted" className="pt-1">
        {event.actor}
      </Type>
      {event.note !== null && (
        <Type as="p" size="xs" tone="subtle" measure="narrow" className="pt-1">
          {event.note}
        </Type>
      )}
    </Stack>
  )
}
