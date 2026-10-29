'use client'

import { Check } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import type { DeliveryOption, DeliveryOptionId } from '@/content/checkout'
import { formatArrival } from '@/lib/format/arrival'
import { formatInr } from '@/lib/format/currency'
import { cn } from '@/lib/utils'

/**
 * The delivery choice, in two bands.
 *
 * ## Two bands, not three rows
 *
 * **Get it soon** holds Standard. **Wait longer, pay less** holds the two
 * discount tiers, inside a single tinted panel so they read as one dial with two
 * positions rather than as two separate offers competing with Standard. Three
 * flat radios would ask a shopper to compare three things at once; the bands ask
 * one question — soon, or cheaper — and then a smaller one inside the answer.
 *
 * Standard is alone in its band now that Express is gone, and that is the right
 * shape rather than a leftover: it is the default, and the band it sits in names
 * what choosing it gets you.
 *
 * ## Every tier states a date, not a duration
 *
 * "4–6 working days" makes a shopper do arithmetic, and working-day arithmetic
 * is the kind they get wrong — the answer depends on which day of the week they
 * happen to be ordering. So each row says "Arrives Tue 9 – Thu 11 Sep". See
 * `lib/format/arrival`, including what it does about weekends and what it
 * deliberately does not do about public holidays.
 *
 * `now` is a prop rather than a `new Date()` in here, so the whole page agrees
 * on one clock and the estimate is testable.
 *
 * ## The fee is on the row, and it is a real number
 *
 * Delivery used to say "Included" on every tier. It is ₹99 now and says so.
 * `extra()` remains in the copy for a future differential ("+₹250") if a paid
 * upgrade ever returns, but with a flat fee across all three tiers nothing
 * reaches it.
 *
 * ## The saving is in rupees, and it is green
 *
 * "10% off" is the label; "You save ₹390" is what makes it a decision. Both are
 * shown, and the amount is floored so nobody is quoted a saving larger than they
 * receive.
 *
 * It is the one figure on the page rendered in a colour, because it is the one
 * figure that is unambiguously in the shopper's favour — and in monochrome it
 * was indistinguishable from the fee it replaced. See `--positive` in
 * tokens.css for why that colour is not the accent.
 *
 * ## Real radios
 *
 * Two `<fieldset>`s with legends, native `<input type="radio">` sharing one
 * `name`, so arrow keys move across both bands as a single group and each option
 * is announced with its window and its price effect rather than as bare text
 * sitting nearby.
 */
export function DeliveryOptions({
  subtotalInr,
  selected,
  onChange,
  now,
}: {
  subtotalInr: number
  selected: DeliveryOptionId
  onChange: (option: DeliveryOption) => void
  /** One clock for the whole page. See the note above. */
  now: Date
}) {
  const soon = checkout.delivery.options.filter((option) => option.group === 'soon')
  const wait = checkout.delivery.options.filter((option) => option.group === 'wait')

  return (
    <Stack gap={4}>
      <fieldset>
        <legend className="mb-2">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.delivery.soonHeading}
          </Type>
        </legend>
        <Stack gap={2}>
          {soon.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              subtotalInr={subtotalInr}
              selected={selected === option.id}
              onSelect={() => onChange(option)}
              now={now}
            />
          ))}
        </Stack>
      </fieldset>

      {/*
        The discount band. One tinted panel around both tiers, so they read as a
        single choice with a dial rather than two more options in a flat list.
      */}
      <fieldset className="border border-line bg-surface p-4">
        <legend className="px-1">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.delivery.waitHeading}
          </Type>
        </legend>

        <Type size="xs" tone="muted" className="mb-3">
          {checkout.delivery.waitNote}
        </Type>

        <Stack gap={2}>
          {wait.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              subtotalInr={subtotalInr}
              selected={selected === option.id}
              onSelect={() => onChange(option)}
              now={now}
              tinted
            />
          ))}
        </Stack>
      </fieldset>

      {checkout.delivery.isProvisional && (
        <Type size="xs" tone="subtle">
          {checkout.delivery.provisionalNote}
        </Type>
      )}
    </Stack>
  )
}

function OptionRow({
  option,
  subtotalInr,
  selected,
  onSelect,
  now,
  tinted = false,
}: {
  option: DeliveryOption
  subtotalInr: number
  selected: boolean
  onSelect: () => void
  now: Date
  /** Inside the discount band, which already has a fill of its own. */
  tinted?: boolean
}) {
  // Integer paise. Floored, so a saving is never quoted larger than it is.
  const saving = Math.floor((subtotalInr * option.discountPercent) / 100)
  const arrives = checkout.delivery.arrives(formatArrival(option.lead, now))

  return (
    <label
      className={cn(
        'ease flex cursor-pointer items-center gap-3 border p-3 transition-colors duration-fast',
        tinted ? 'bg-background' : '',
        selected ? 'border-ink' : 'border-line hover:border-line-strong',
      )}
    >
      <input
        type="radio"
        name="delivery-option"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 shrink-0 accent-ink"
      />

      <Stack gap={0} className="min-w-0 flex-1">
        <Row gap={3} justify="between" align="baseline" wrap={false}>
          <Type as="span" size="sm" weight="emphasis">
            {option.label}
          </Type>

          {/* Green only when it is money kept. A fee and "Included" stay grey. */}
          <Type
            as="span"
            size="sm"
            tone={option.discountPercent > 0 ? 'positive' : 'muted'}
            weight={option.discountPercent > 0 ? 'emphasis' : 'regular'}
            numeric
            className="shrink-0"
          >
            {option.discountPercent > 0
              ? checkout.delivery.saves(formatInr(saving))
              : formatInr(option.feeInr)}
          </Type>
        </Row>

        <Row gap={2} align="baseline" wrap={false}>
          {/*
            The estimate is derived from today's date, so the server render and
            the hydrated render disagree if the two straddle midnight. That is
            the textbook case for `suppressHydrationWarning`: the value is
            correct in both renders, and the alternative is either a flash of
            missing content on the most important fact in the section or a
            warning nobody can act on.
          */}
          <Type as="span" size="xs" tone="subtle" numeric suppressHydrationWarning>
            {arrives}
          </Type>
          {selected && option.discountPercent > 0 && (
            <Row gap={1} align="center" wrap={false}>
              <Check className="h-3 w-3 text-ink-muted" strokeWidth={2} aria-hidden />
              <Type as="span" size="xs" tone="muted">
                {checkout.delivery.applied}
              </Type>
            </Row>
          )}
        </Row>
      </Stack>
    </label>
  )
}
