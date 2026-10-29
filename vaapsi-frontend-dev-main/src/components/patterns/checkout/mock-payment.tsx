'use client'

import { useRef, useState } from 'react'
import { ArrowUpRight, Banknote, CreditCard, Landmark, Smartphone } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import { cn } from '@/lib/utils'

/**
 * The payment step — a demo mock, labelled on the card itself.
 *
 * ## Read this before changing anything here
 *
 * This repo deliberately refused a fake payment screen for a long time: a stub
 * gets believed, and then the phase that builds the real thing stops being
 * estimated honestly. That reasoning has not changed. This exists as a scoped
 * exception for a client demo.
 *
 * **The banner is gone.** There used to be a permanent "Demo only — no payment
 * is taken" note above the methods, and it was removed on request as stating the
 * obvious on a prototype nobody reaches without a link. What that banner was
 * *for* has not gone anywhere, and these three still carry it:
 *
 * 1. **A real card cannot be entered.** The number field accepts only the
 *    published test PANs and rejects everything else with a visible message.
 *    This is the load-bearing one: it makes it structurally impossible for
 *    someone to type their actual card into a prototype, and it does not depend
 *    on anybody reading a banner.
 * 2. **The card says "Demo card" on its face.** On the object, not above it — so
 *    a screenshot cropped to the card is still labelled, which is the case the
 *    banner always missed.
 * 3. **Nothing leaves the browser.** No fetch, no form action, no analytics
 *    event. Values live in component state for the life of the render and are
 *    never persisted, and the CVV is never held at all — it is an uncontrolled
 *    input with no state behind it.
 *
 * If the banner is ever wanted back, it is four lines. If safeguard 1 is
 * weakened, this file becomes a liability rather than a mock.
 *
 * When real payment lands, delete this file and `checkout.payment` together. Do
 * not evolve it into the integration: it is shaped to look right, not to be
 * right, and the provider's SDK will want a different structure entirely.
 *
 * ## Why the method chooser is tiles with marks on them
 *
 * Payment method is one of the few genuinely iconic choices in a checkout — a
 * card, a phone, a bank, cash — and every shopper already holds a picture of
 * each. A tile with a mark is recognised before it is read; a column of
 * identical radio rows has to be read line by line. The icons are doing
 * recognition work, which is the only thing that earns them a place on a page
 * this restrained.
 *
 * ## Why only Card gets a picture of itself
 *
 * Card is the one method that actually *happens* here, so it gets the object:
 * fields sit where the embossing is, and nobody has to work out which box wants
 * which group of digits. UPI, net banking and cash on delivery all complete
 * somewhere we do not own — an app, a bank page, the courier at the door — so
 * each states where it continues and then stops. Drawing an elaborate form for
 * a step that happens on someone else's screen is inventing an interface.
 */

export type PaymentMethodId = 'card' | 'upi' | 'netbanking' | 'cod'

/** Marks for the method tiles, keyed by `icon` in `checkout.payment.methods`. */
const PAYMENT_ICONS = {
  card: CreditCard,
  upi: Smartphone,
  bank: Landmark,
  cash: Banknote,
} as const

export function MockPayment({
  onValidityChange,
  onMethodChange,
}: {
  /** Lets the page gate its confirm button on a plausible-looking entry. */
  onValidityChange?: (valid: boolean) => void
  /** The confirmation dialog names the chosen method back to the shopper. */
  onMethodChange?: (method: PaymentMethodId) => void
}) {
  const [method, setMethod] = useState<PaymentMethodId>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [upiId, setUpiId] = useState('')
  const [bank, setBank] = useState<string>(checkout.payment.netbanking.banks[0]!)

  const digits = cardNumber.replace(/\D/g, '')
  const cardAccepted = isTestCard(digits)
  // A wrong number is only *rejected* once it is long enough to be a real
  // attempt — flagging an error on the first keystroke is noise. Sixteen is the
  // length of every accepted number, so it is also the point at which a wrong
  // one has definitely been finished rather than half-typed.
  const cardRejected = digits.length >= PAN_LENGTH && !cardAccepted

  const valid =
    method === 'card'
      ? cardAccepted
      : method === 'upi'
        ? upiId.includes('@')
        : method === 'netbanking'
          ? bank !== ''
          : // Cash on delivery has nothing to fill in. That is the whole offer.
            true

  function report(nextMethod: PaymentMethodId, nextCard: string, nextUpi: string) {
    onValidityChange?.(
      nextMethod === 'card'
        ? isTestCard(nextCard.replace(/\D/g, ''))
        : nextMethod === 'upi'
          ? nextUpi.includes('@')
          : true,
    )
  }

  function chooseMethod(next: PaymentMethodId) {
    setMethod(next)
    onMethodChange?.(next)
    report(next, cardNumber, upiId)
  }

  return (
    <Stack gap={4}>
      {/*
        The chooser. Real radios under the tiles — the input is visually hidden
        rather than replaced, so arrow keys move across the group and each tile
        is announced with its label and its note. A div of click handlers would
        have needed all of that rebuilt by hand and worse.
      */}
      <fieldset>
        <legend className="mb-2">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.payment.methodLabel}
          </Type>
        </legend>

        <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
          {checkout.payment.methods.map((entry) => {
            const Icon = PAYMENT_ICONS[entry.icon as keyof typeof PAYMENT_ICONS]
            const active = method === entry.id
            return (
              <label
                key={entry.id}
                className={cn(
                  'ease flex cursor-pointer flex-col gap-2 border p-3 transition-colors duration-fast',
                  'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink',
                  active ? 'border-ink bg-surface' : 'border-line hover:border-line-strong',
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={entry.id}
                  checked={active}
                  onChange={() => chooseMethod(entry.id as PaymentMethodId)}
                  className="sr-only"
                />
                <Icon
                  className={cn('h-5 w-5', active ? 'text-ink' : 'text-ink-muted')}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <Stack gap={0}>
                  <Type as="span" size="sm" weight="emphasis">
                    {entry.label}
                  </Type>
                  <Type as="span" size="xs" tone="subtle">
                    {entry.note}
                  </Type>
                </Stack>
              </label>
            )
          })}
        </div>
      </fieldset>

      {method === 'card' && (
        <CardFace
          number={cardNumber}
          name={cardName}
          expiry={expiry}
          rejected={cardRejected}
          onNumber={(value) => {
            setCardNumber(value)
            report(method, value, upiId)
          }}
          onName={setCardName}
          onExpiry={setExpiry}
        />
      )}

      {method === 'upi' && (
        <Handoff icon="upi" body={checkout.payment.upi.handoff}>
          <label className="block">
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {checkout.payment.upi.id}
            </Type>
            <input
              type="text"
              autoComplete="off"
              value={upiId}
              onChange={(event) => {
                setUpiId(event.target.value)
                report(method, cardNumber, event.target.value)
              }}
              placeholder={checkout.payment.upi.placeholder}
              className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
            />
            <Type size="xs" tone="subtle" className="mt-1">
              {checkout.payment.upi.hint}
            </Type>
          </label>
        </Handoff>
      )}

      {method === 'netbanking' && (
        <Handoff icon="bank" body={checkout.payment.netbanking.handoff}>
          <label className="block">
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {checkout.payment.netbanking.label}
            </Type>
            <select
              value={bank}
              onChange={(event) => {
                setBank(event.target.value)
                onValidityChange?.(true)
              }}
              className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
            >
              {checkout.payment.netbanking.banks.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </Handoff>
      )}

      {method === 'cod' && (
        <Handoff icon="cash" body={checkout.payment.cod.handoff}>
          {/* Flagged on screen, not just in a code comment. It is unconfirmed. */}
          <Type size="xs" tone="subtle">
            {checkout.payment.cod.pendingNote}
          </Type>
        </Handoff>
      )}

      <input type="hidden" value={valid ? 'ready' : 'incomplete'} readOnly />
    </Stack>
  )
}

/**
 * A hand-off panel: where this method actually completes.
 *
 * Same frame for all three, because they are the same kind of thing — a step
 * that finishes on a screen we do not own. The arrow is the only ornament, and
 * it points out of the page on purpose.
 */
function Handoff({
  icon,
  body,
  children,
}: {
  icon: keyof typeof PAYMENT_ICONS
  body: string
  children: React.ReactNode
}) {
  const Icon = PAYMENT_ICONS[icon]
  return (
    <Stack gap={3} className="border border-line bg-surface p-4">
      <Row gap={3} align="start" wrap={false}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden />
        <Stack gap={1} className="min-w-0">
          <Row gap={1} align="center" wrap={false}>
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {checkout.payment.handoff.continues}
            </Type>
            <ArrowUpRight className="h-3 w-3 text-ink-subtle" strokeWidth={1.5} aria-hidden />
          </Row>
          <Type size="sm" tone="muted">
            {body}
          </Type>
        </Stack>
      </Row>
      <div className="bg-background p-3">{children}</div>
    </Stack>
  )
}

/**
 * The card, as an object.
 *
 * ## Why the fields are on the card and not under it
 *
 * A card is a thing people have held. The number runs across the middle, the
 * name is bottom left, the expiry bottom right, the CVV is on the back. Putting
 * the inputs exactly there means the form needs no explaining: you are filling
 * in the card, in the places the card already has. A stacked list of labelled
 * boxes asks the same questions and makes you translate each one.
 *
 * ## Light, not dark, and full width
 *
 * It started as a near-black slab with white type on it — the obvious way to
 * draw a premium card, and wrong for this site. Nothing else on Vaapsi is a
 * dark filled panel: surfaces are white or `--surface`, type is `--ink`, and a
 * black rectangle in the middle of a checkout column read as a component
 * borrowed from somewhere else. So it is `--surface` with a hairline and
 * ordinary ink type, which is what every other panel on the page is, and the
 * card reads as a card through its *proportions* rather than through colour.
 *
 * It also runs the full width of the form column now. It was capped at
 * `max-w-sm`, which left it stopping halfway across and looking like a widget
 * that had failed to size itself rather than the primary control on the step.
 *
 * ## The network mark
 *
 * Detected from the number's leading digits and drawn in monochrome type — see
 * `checkout.payment.card.networks` for why it is drawn rather than reproduced.
 * It changes on the first digit, not on a valid number, because that is what a
 * real card does and it is the thing that makes the object feel live.
 *
 * ## The flip
 *
 * The CVV lives on the back, because that is where it is, and the card turns to
 * show it. Two rules keep that from becoming a trap:
 *
 * - **The visible face always follows focus.** Focusing anything on the front
 *   turns the card to the front; focusing the CVV turns it to the back. So a
 *   keyboard user tabbing through never types into a face they cannot see.
 * - **There is a real control for the mouse.** The front carries a CVV button
 *   where the CVV would be if it were on the front; pressing it turns the card
 *   and moves focus into the field. Without it, a mouse user would have to
 *   discover a click target on a surface that is facing away.
 *
 * Reduced motion drops the rotation and swaps the faces outright — the
 * information is in which face is showing, not in the turn.
 */
function CardFace({
  number,
  name,
  expiry,
  rejected,
  onNumber,
  onName,
  onExpiry,
}: {
  number: string
  name: string
  expiry: string
  rejected: boolean
  onNumber: (value: string) => void
  onName: (value: string) => void
  onExpiry: (value: string) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const cvvRef = useRef<HTMLInputElement>(null)
  const copy = checkout.payment.card
  const network = detectNetwork(number)

  return (
    <Stack gap={2}>
      <div className="[perspective:1200px]">
        <div
          className={cn(
            'ease relative aspect-[1.75] w-full transition-transform duration-slow [transform-style:preserve-3d] motion-reduce:transition-none tablet:aspect-[2.2]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          {/* ---- Front */}
          <div className="absolute inset-0 flex flex-col justify-between border border-line-strong bg-surface p-5 [backface-visibility:hidden] tablet:p-6">
            <Row gap={3} justify="between" align="start" wrap={false}>
              {/* The chip. A drawn rectangle, not an icon — it is a shape, and
                  an icon set does not have this one. */}
              <div aria-hidden className="h-7 w-9 rounded-sm border border-line-strong bg-line" />

              <Row gap={3} align="center" wrap={false}>
                {/* Safeguard 2, on the object itself. */}
                <Type as="span" size="xs" tone="subtle" tracking="caps">
                  {copy.faceMark}
                </Type>
                <NetworkMark network={network} />
              </Row>
            </Row>

            <label className="block">
              <span className="sr-only">{copy.number}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={number}
                onFocus={() => setFlipped(false)}
                onChange={(event) => onNumber(groupDigits(event.target.value))}
                placeholder={copy.numberBlank}
                aria-invalid={rejected}
                aria-describedby="card-number-hint"
                className={cn(
                  'ease w-full border-b bg-transparent pb-1 font-body text-lg tabular-nums tracking-[0.14em] text-ink transition-colors duration-fast placeholder:text-ink-subtle focus:outline-none tablet:text-xl',
                  rejected ? 'border-accent' : 'border-line-strong focus:border-ink',
                )}
              />
            </label>

            <Row gap={4} justify="between" align="end" wrap={false}>
              <label className="block min-w-0 flex-1">
                <Type as="span" size="xs" tone="subtle" tracking="caps">
                  {copy.name}
                </Type>
                <input
                  type="text"
                  autoComplete="off"
                  value={name}
                  onFocus={() => setFlipped(false)}
                  onChange={(event) => onName(event.target.value.toUpperCase())}
                  placeholder={copy.nameBlank}
                  className="ease mt-0.5 w-full border-b border-line-strong bg-transparent pb-0.5 text-sm uppercase text-ink transition-colors duration-fast placeholder:text-ink-subtle focus:border-ink focus:outline-none"
                />
              </label>

              <label className="block w-16 shrink-0">
                <Type as="span" size="xs" tone="subtle" tracking="caps">
                  {copy.expiry}
                </Type>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={expiry}
                  onFocus={() => setFlipped(false)}
                  onChange={(event) => onExpiry(formatExpiry(event.target.value))}
                  placeholder={copy.expiryBlank}
                  maxLength={5}
                  className="ease mt-0.5 w-full border-b border-line-strong bg-transparent pb-0.5 text-sm tabular-nums text-ink transition-colors duration-fast placeholder:text-ink-subtle focus:border-ink focus:outline-none"
                />
              </label>

              {/* The mouse's way to the back. See the note above. */}
              <button
                type="button"
                onClick={() => {
                  setFlipped(true)
                  // After the state flush, so the field exists facing forward.
                  window.setTimeout(() => cvvRef.current?.focus(), 0)
                }}
                className="ease shrink-0 border-b border-dashed border-line-strong pb-0.5 text-xs uppercase tracking-caps text-ink-subtle transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span className="sr-only">{copy.flipToBack}</span>
                <span aria-hidden>{copy.cvv}</span>
              </button>
            </Row>
          </div>

          {/* ---- Back */}
          <div className="absolute inset-0 flex flex-col justify-between border border-line-strong bg-surface py-5 [backface-visibility:hidden] [transform:rotateY(180deg)] tablet:py-6">
            {/* The magnetic stripe. Full bleed, as it is on the object. */}
            <div aria-hidden className="h-9 w-full bg-ink-muted" />

            <Row gap={3} justify="between" align="end" wrap={false} className="px-5 tablet:px-6">
              {/* The signature panel, which is where the CVV is printed. */}
              <div aria-hidden className="h-8 min-w-0 flex-1 border border-line bg-background" />
              <label className="block w-20 shrink-0">
                <Type as="span" size="xs" tone="subtle" tracking="caps">
                  {copy.cvv}
                </Type>
                {/* Safeguard 3. Uncontrolled — nothing holds this, even in memory. */}
                <input
                  ref={cvvRef}
                  type="text"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={4}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  className="ease mt-0.5 w-full border-b border-line-strong bg-transparent pb-0.5 text-sm tabular-nums text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
                />
              </label>
            </Row>

            <Type size="xs" tone="subtle" className="px-5 tablet:px-6">
              {copy.cvvHint}
            </Type>
          </div>
        </div>
      </div>

      {/* Safeguard 1. A real card is refused, visibly, under the object. */}
      <Type id="card-number-hint" size="xs" tone={rejected ? 'accent' : 'subtle'}>
        {rejected ? copy.rejected : copy.testHint}
      </Type>
    </Stack>
  )
}

/**
 * The network's name, set as type.
 *
 * Visa in wide caps, Mastercard beside its two overlapping discs, everything
 * else as its own word — recognisable at a glance without reproducing anyone's
 * trademark, and monochrome so the card stays part of this page rather than
 * importing two more brand colours into a palette that has one. Renders nothing
 * until there are enough digits to know, because a mark that guesses and then
 * changes its mind is worse than a mark that waits.
 */
function NetworkMark({ network }: { network: (typeof NETWORKS)[number] | null }) {
  if (network === null) return null

  return (
    // A span rather than `Row`, which takes no ARIA props — and the mark needs a
    // spoken name, or a screen reader gets a wordmark it cannot place.
    <span className="flex items-center gap-1" role="img" aria-label={network.label}>
      {network.id === 'mastercard' && (
        // The two interlocking discs, drawn. The overlap is the whole mark.
        <span aria-hidden className="relative flex h-4 w-6 items-center">
          <span className="absolute left-0 h-4 w-4 rounded-full bg-ink-muted" />
          <span className="absolute right-0 h-4 w-4 rounded-full border border-ink-muted bg-surface" />
        </span>
      )}
      <Type
        as="span"
        size="sm"
        weight="heading"
        tracking={network.id === 'visa' ? 'caps' : 'default'}
        className={network.id === 'visa' ? 'italic' : undefined}
      >
        {network.id === 'visa' ? network.label.toUpperCase() : network.label}
      </Type>
    </span>
  )
}

/** `4111111111111111` → `4111 1111 1111 1111`, capped at sixteen digits. */
function groupDigits(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})(?=.)/g, '$1 ')
}

/** `1226` → `12/26`. Types forward only; the slash appears on the third digit. */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Every accepted number is sixteen digits. Also the rejection threshold. */
const PAN_LENGTH = 16

/** The published test PANs, digits only. See `checkout.payment.card`. */
const TEST_DIGITS: readonly string[] = checkout.payment.card.testNumbers.map((value) =>
  value.replace(/\D/g, ''),
)

function isTestCard(digits: string): boolean {
  return TEST_DIGITS.includes(digits)
}

/**
 * Networks with their IIN patterns compiled once.
 *
 * The patterns live in the content module as strings so that file stays copy
 * and imports nothing; they are turned into expressions here, at module scope,
 * rather than on every keystroke.
 */
const NETWORKS = checkout.payment.card.networks.map((entry) => ({
  ...entry,
  test: new RegExp(entry.pattern),
}))

/**
 * Which network a part-typed number belongs to.
 *
 * Null until two digits are in, because a single `5` is a Mastercard and a `5`
 * followed by `0` is not — showing a mark on one digit means showing the wrong
 * one some of the time. Two is enough to settle every range we recognise.
 */
function detectNetwork(value: string): (typeof NETWORKS)[number] | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 2) return null
  return NETWORKS.find((entry) => entry.test.test(digits)) ?? null
}
