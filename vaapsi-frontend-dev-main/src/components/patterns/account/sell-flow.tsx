'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, Camera, Check, Plus, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy, RESALE_COMMISSION_PERCENT } from '@/content/account'
import { conditionCopy } from '@/content/product'
import { formatInr } from '@/lib/format/currency'
import { PHOTO_QUALITY } from '@/lib/image'
import { priceWarning } from '@/lib/data/resale'
import type { OrderLine, ResaleAssessment, ResaleShot } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * "Sell it back" — photographs in, price out.
 *
 * ## The photographs are the authorisation
 *
 * There is no sign-in in this flow, and that is the design rather than a gap.
 * A password proves who is typing; a photograph of the label proves what someone
 * is holding, which is the claim that actually matters when the rule is "you can
 * only sell back what you bought here". So the label shot gates everything: no
 * readable label, no listing, and the copy says exactly that instead of failing
 * vaguely.
 *
 * That also decides the step order. Photographs come first, because everything
 * after them is conditional on the garment being ours — asking someone to name a
 * price for an object we cannot identify would be theatre.
 *
 * ## Four things the quote screen has to do
 *
 * 1. **Separate provenance from price.** Two different kinds of claim; fusing
 *    them is how a marketplace ends up pricing something it cannot identify.
 * 2. **Put every deduction next to the thing it deducts for.** A total that
 *    quietly absorbed six marks reads as a trick, and a seller who discovers it
 *    at the end argues rather than accepts.
 * 3. **Show additions as additions.** Someone who embroidered their jacket
 *    should see that raise the number, not lower it. On a site that sells
 *    customisation, penalising it would be incoherent.
 * 4. **Say the range is the market, not our offer.** A single number invites a
 *    negotiation with us. A range says where comparable pieces landed and leaves
 *    the decision with the seller.
 *
 * ## The seller sets the price
 *
 * They can ask anything. Outside the range they get a flag naming the likely
 * consequence — and a separate one for the extra-digit case, because the advice
 * differs and a typo is more likely than ambition at 10x. It never blocks: it is
 * their garment, and a marketplace that refuses an unusual price is one sellers
 * leave.
 *
 * ⚠️ The read itself is a demonstration — no model behind it. The page says so
 * where a seller could otherwise take a number for a promise.
 */

type Step = 'photos' | 'declare' | 'quote' | 'price' | 'done'

export function SellFlow({
  line,
  shots,
  /** Runs the assessment. Passed in so this component stays presentational. */
  onAssess,
  onSubmit,
}: {
  line: OrderLine
  shots: readonly ResaleShot[]
  onAssess: (input: {
    shotIds: readonly string[]
    declaredFlaws: readonly string[]
    hasCustomisations: boolean
  }) => Promise<ResaleAssessment>
  onSubmit: (input: { askingInr: number; assessment: ResaleAssessment }) => Promise<string>
}) {
  const [step, setStep] = useState<Step>('photos')
  const [added, setAdded] = useState<readonly string[]>([])
  const [declared, setDeclared] = useState<readonly string[]>([])
  const [draft, setDraft] = useState('')
  const [hasCustomisations, setHasCustomisations] = useState(false)
  const [assessment, setAssessment] = useState<ResaleAssessment | null>(null)
  const [asking, setAsking] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [reference, setReference] = useState<string | null>(null)

  const requiredShots = shots.filter((shot) => shot.required)
  const hasAllRequired = requiredShots.every((shot) => added.includes(shot.id))

  async function runAssessment() {
    setBusy(true)
    const result = await onAssess({ shotIds: added, declaredFlaws: declared, hasCustomisations })
    setAssessment(result)
    setAsking(result.suggestedInr.mid)
    setBusy(false)
    setStep('quote')
  }

  async function submit() {
    if (assessment === null || asking === null) return
    setBusy(true)
    const ref = await onSubmit({ askingInr: asking, assessment })
    setReference(ref)
    setBusy(false)
    setStep('done')
  }

  if (step === 'done' && reference !== null) {
    return <Done reference={reference} />
  }

  return (
    <Stack gap={6}>
      <Progress step={step} />

      {step === 'photos' && (
        <PhotoStep
          shots={shots}
          added={added}
          onToggle={(id) =>
            setAdded((current) =>
              current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
            )
          }
          canContinue={hasAllRequired}
          onContinue={() => setStep('declare')}
        />
      )}

      {step === 'declare' && (
        <DeclareStep
          declared={declared}
          draft={draft}
          onDraft={setDraft}
          onAdd={() => {
            const value = draft.trim()
            if (value === '') return
            setDeclared((current) => [...current, value])
            setDraft('')
          }}
          onRemove={(index) => setDeclared((current) => current.filter((_, i) => i !== index))}
          hasCustomisations={hasCustomisations}
          onCustomisations={setHasCustomisations}
          busy={busy}
          onContinue={runAssessment}
        />
      )}

      {step === 'quote' && assessment !== null && (
        <QuoteStep
          line={line}
          assessment={assessment}
          onBack={() => setStep('photos')}
          onContinue={() => setStep('price')}
        />
      )}

      {step === 'price' && assessment !== null && asking !== null && (
        <PriceStep
          assessment={assessment}
          asking={asking}
          onAsking={setAsking}
          busy={busy}
          onSubmit={submit}
        />
      )}
    </Stack>
  )
}

// ---------------------------------------------------------------------------

type ProgressStep = 'photos' | 'declare' | 'quote' | 'price'

function Progress({ step }: { step: Step }) {
  const order: ProgressStep[] = ['photos', 'declare', 'quote', 'price']
  const current = order.indexOf(step as ProgressStep)

  return (
    <Row gap={2} align="center" wrap>
      {order.map((key, index) => (
        <Row key={key} gap={2} align="center" wrap={false}>
          <Type
            as="span"
            size="xs"
            tone={index <= current ? 'default' : 'subtle'}
            weight={index === current ? 'emphasis' : 'regular'}
          >
            {accountCopy.sell.steps[key]}
          </Type>
          {index < order.length - 1 && <span aria-hidden className="h-px w-6 bg-line-strong" />}
        </Row>
      ))}
    </Row>
  )
}

function PhotoStep({
  shots,
  added,
  onToggle,
  canContinue,
  onContinue,
}: {
  shots: readonly ResaleShot[]
  added: readonly string[]
  onToggle: (id: string) => void
  canContinue: boolean
  onContinue: () => void
}) {
  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Type as="h2" family="display" size="xl" weight="heading">
          {accountCopy.sell.photos.heading}
        </Type>
        <Type size="sm" tone="muted" measure="default">
          {accountCopy.sell.photos.lede}
        </Type>
      </Stack>

      <Stack gap={3} as="ul">
        {shots.map((shot) => {
          const isAdded = added.includes(shot.id)
          return (
            <li key={shot.id}>
              <div
                className={cn(
                  'ease border p-4 transition-colors duration-fast',
                  isAdded ? 'border-ink' : 'border-line',
                )}
              >
                <Row gap={3} justify="between" align="start" wrap={false}>
                  <Stack gap={1} className="min-w-0 flex-1">
                    <Row gap={2} align="baseline" wrap>
                      <Type as="h3" size="sm" weight="emphasis">
                        {shot.label}
                      </Type>
                      <Type as="span" size="xs" tone={shot.required ? 'default' : 'subtle'}>
                        {shot.required
                          ? accountCopy.sell.photos.required
                          : accountCopy.sell.photos.optional}
                      </Type>
                    </Row>
                    <Type size="xs" tone="muted">
                      {shot.instruction}
                    </Type>
                    {/* Why we are asking. A prescribed shot list without stated
                        reasons reads as bureaucracy. */}
                    <Type size="xs" tone="subtle">
                      {shot.purpose}
                    </Type>
                  </Stack>

                  <button
                    type="button"
                    onClick={() => onToggle(shot.id)}
                    className={cn(
                      'ease inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors duration-fast',
                      isAdded
                        ? 'border-line-strong text-ink-muted'
                        : 'border-ink bg-ink text-background hover:bg-ink-muted',
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                        {accountCopy.sell.photos.added}
                      </>
                    ) : (
                      <>
                        <Camera className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                        {accountCopy.sell.photos.simulate}
                      </>
                    )}
                  </button>
                </Row>
              </div>
            </li>
          )
        })}
      </Stack>

      {/* The demo shortcut, named as one rather than left to be discovered. */}
      <Type size="xs" tone="subtle">
        {accountCopy.sell.photos.simulateNote}
      </Type>

      <button
        type="button"
        onClick={onContinue}
        aria-disabled={!canContinue}
        className={cn(
          'ease self-start px-6 py-3 text-sm transition-colors duration-fast',
          canContinue
            ? 'bg-ink text-background hover:bg-ink-muted'
            : 'cursor-default border border-line text-ink-subtle',
        )}
      >
        {canContinue ? 'Continue' : accountCopy.sell.blocked.title}
      </button>

      {!canContinue && (
        <Type size="xs" tone="muted" measure="default">
          {accountCopy.sell.blocked.body}
        </Type>
      )}
    </Stack>
  )
}

function DeclareStep({
  declared,
  draft,
  onDraft,
  onAdd,
  onRemove,
  hasCustomisations,
  onCustomisations,
  busy,
  onContinue,
}: {
  declared: readonly string[]
  draft: string
  onDraft: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  hasCustomisations: boolean
  onCustomisations: (value: boolean) => void
  busy: boolean
  onContinue: () => void
}) {
  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Type as="h2" family="display" size="xl" weight="heading">
          {accountCopy.sell.declare.heading}
        </Type>
        {/* States that declaring is not punished. It is the sentence that makes
            an honest declaration rational. */}
        <Type size="sm" tone="muted" measure="default">
          {accountCopy.sell.declare.lede}
        </Type>
      </Stack>

      <Stack gap={2}>
        <Row gap={2} wrap={false}>
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onAdd()
              }
            }}
            placeholder={accountCopy.sell.declare.placeholder}
            aria-label={accountCopy.sell.declare.heading}
            className="ease min-w-0 flex-1 border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={onAdd}
            className="ease shrink-0 border border-line-strong px-4 py-2.5 text-sm text-ink transition-colors duration-fast hover:bg-surface"
          >
            {accountCopy.sell.declare.add}
          </button>
        </Row>

        {declared.length === 0 ? (
          <Type size="xs" tone="subtle">
            {accountCopy.sell.declare.none}
          </Type>
        ) : (
          <Stack gap={1} as="ul">
            {declared.map((item, index) => (
              <li key={`${item}-${index}`}>
                <Row gap={2} justify="between" align="center" wrap={false}>
                  <Type as="span" size="sm" truncate>
                    {item}
                  </Type>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label={`${accountCopy.sell.photos.remove}: ${item}`}
                    className="ease -m-1 shrink-0 p-1 text-ink-subtle transition-colors duration-fast hover:text-ink"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </button>
                </Row>
              </li>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Customisations, framed as upside. See the component note. */}
      <label className="flex cursor-pointer gap-3 border border-line bg-surface p-4">
        <input
          type="checkbox"
          checked={hasCustomisations}
          onChange={(event) => onCustomisations(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
        />
        <Stack gap={1}>
          <Row gap={2} align="center" wrap={false}>
            <Sparkles className="h-4 w-4 text-ink" strokeWidth={1.5} aria-hidden />
            <Type as="span" size="sm" weight="emphasis">
              {accountCopy.sell.declare.customisationsLabel}
            </Type>
          </Row>
          <Type size="xs" tone="muted">
            {accountCopy.sell.declare.customisationsNote}
          </Type>
        </Stack>
      </label>

      <button
        type="button"
        onClick={onContinue}
        disabled={busy}
        className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted disabled:opacity-70"
      >
        {busy ? 'Reading your photographs…' : 'See what it is worth'}
      </button>
    </Stack>
  )
}

function QuoteStep({
  line,
  assessment,
  onBack,
  onContinue,
}: {
  line: OrderLine
  assessment: ResaleAssessment
  onBack: () => void
  onContinue: () => void
}) {
  const condition = conditionCopy[assessment.suggestedCondition]
  const blocked = assessment.verification === 'no_match'

  return (
    <Stack gap={6}>
      {/* 1. Provenance, on its own and before any number. */}
      <Stack
        gap={2}
        className={cn('border p-4', blocked ? 'border-ink' : 'border-line bg-surface')}
      >
        <Row gap={2} align="center" wrap={false}>
          {blocked ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
          ) : (
            <ShieldCheck className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
          )}
          <Type as="h2" size="sm" weight="emphasis">
            {assessment.verification === 'match'
              ? accountCopy.sell.quote.verified
              : assessment.verification === 'uncertain'
                ? accountCopy.sell.quote.uncertain
                : accountCopy.sell.quote.noMatch}
          </Type>
        </Row>
        <Type size="xs" tone="muted" measure="default">
          {assessment.verificationNote}
        </Type>
      </Stack>

      {blocked ? (
        <button
          type="button"
          onClick={onBack}
          className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          Add the label photo
        </button>
      ) : (
        <>
          <Stack gap={2}>
            <Eyebrow as="h3">{accountCopy.sell.quote.conditionLabel}</Eyebrow>
            <Row gap={2} align="baseline">
              <Type as="span" size="lg" family="display" weight="heading">
                {condition.label}
              </Type>
              <Type as="span" size="xs" tone="subtle">
                {condition.short}
              </Type>
            </Row>
            <Type size="xs" tone="muted" measure="default">
              {assessment.conditionNote}
            </Type>
          </Stack>

          {/* 2. Every deduction next to the thing it deducts for. */}
          {assessment.flaws.length > 0 && (
            <Stack gap={2}>
              <Eyebrow as="h3">{accountCopy.sell.quote.flawsLabel}</Eyebrow>
              <Type size="xs" tone="subtle">
                {accountCopy.sell.quote.flawsNote}
              </Type>
              <Rule />
              <Stack gap={3} as="ul">
                {assessment.flaws.map((flaw, index) => (
                  <li key={`${flaw.description}-${index}`}>
                    <Row gap={3} justify="between" align="start" wrap={false}>
                      <Stack gap={0} className="min-w-0">
                        <Type as="span" size="sm">
                          {flaw.description}
                        </Type>
                        <Type as="span" size="xs" tone="subtle">
                          {flaw.location} ·{' '}
                          {flaw.declaredBySeller
                            ? accountCopy.sell.quote.declaredByYou
                            : accountCopy.sell.quote.foundByUs}
                        </Type>
                      </Stack>
                      <Type as="span" size="sm" tone="muted" numeric className="shrink-0">
                        − {formatInr(flaw.deductionInr)}
                      </Type>
                    </Row>
                  </li>
                ))}
              </Stack>
            </Stack>
          )}

          {/* 3. Additions, as additions. */}
          {assessment.customisations.length > 0 && (
            <Stack gap={2} className="border border-line bg-surface p-4">
              <Row gap={2} align="center" wrap={false}>
                <Sparkles className="h-4 w-4 text-ink" strokeWidth={1.5} aria-hidden />
                <Eyebrow as="h3">{accountCopy.sell.quote.additionsLabel}</Eyebrow>
              </Row>
              {assessment.customisations.map((factor) => (
                <Row key={factor.label} gap={3} justify="between" align="start" wrap={false}>
                  <Stack gap={0} className="min-w-0">
                    <Type as="span" size="sm">
                      {factor.label}
                    </Type>
                    <Type as="span" size="xs" tone="muted">
                      {factor.reason}
                    </Type>
                  </Stack>
                  <Type
                    as="span"
                    size="sm"
                    tone="positive"
                    weight="emphasis"
                    numeric
                    className="shrink-0"
                  >
                    + {formatInr(factor.effectInr)}
                  </Type>
                </Row>
              ))}
            </Stack>
          )}

          <Stack gap={2}>
            <Eyebrow as="h3">{accountCopy.sell.quote.factorsLabel}</Eyebrow>
            <Rule />
            <Stack gap={2} as="ul">
              <li>
                <Row gap={3} justify="between" align="baseline" wrap={false}>
                  <Type as="span" size="sm" tone="muted">
                    You paid
                  </Type>
                  <Type as="span" size="sm" numeric>
                    {formatInr(line.pricePaidInr)}
                  </Type>
                </Row>
              </li>
              {assessment.factors.map((factor, index) => (
                <li key={`${factor.label}-${index}`}>
                  <Row gap={3} justify="between" align="start" wrap={false}>
                    <Stack gap={0} className="min-w-0">
                      <Type as="span" size="sm">
                        {factor.label}
                      </Type>
                      <Type as="span" size="xs" tone="subtle">
                        {factor.reason}
                      </Type>
                    </Stack>
                    <Type
                      as="span"
                      size="sm"
                      tone={factor.effectInr >= 0 ? 'positive' : 'muted'}
                      numeric
                      className="shrink-0"
                    >
                      {factor.effectInr >= 0 ? '+ ' : '− '}
                      {formatInr(Math.abs(factor.effectInr))}
                    </Type>
                  </Row>
                </li>
              ))}
            </Stack>
          </Stack>

          {/* 4. The range, named as the market rather than as our offer. */}
          <Stack gap={2} className="border-t border-line pt-5">
            <Eyebrow as="h3">{accountCopy.sell.quote.rangeLabel}</Eyebrow>
            <Type as="p" family="display" size="3xl" weight="heading" numeric>
              {formatInr(assessment.suggestedInr.low)} – {formatInr(assessment.suggestedInr.high)}
            </Type>
            <Type size="xs" tone="muted" measure="default">
              {accountCopy.sell.quote.rangeNote}
            </Type>
          </Stack>

          <button
            type="button"
            onClick={onContinue}
            className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
          >
            Set your price
          </button>
        </>
      )}
    </Stack>
  )
}

function PriceStep({
  assessment,
  asking,
  onAsking,
  busy,
  onSubmit,
}: {
  assessment: ResaleAssessment
  asking: number
  onAsking: (value: number) => void
  busy: boolean
  onSubmit: () => void
}) {
  const warning = priceWarning(asking, assessment.suggestedInr)
  const payout = Math.round(asking * (1 - RESALE_COMMISSION_PERCENT / 100))

  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <Type as="h2" family="display" size="xl" weight="heading">
          {accountCopy.sell.price.heading}
        </Type>
        <Type size="sm" tone="muted" measure="default">
          {accountCopy.sell.quote.rangeNote}
        </Type>
      </Stack>

      <Stack gap={2}>
        <label className="block">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {accountCopy.sell.price.label}
          </Type>
          <Row gap={2} align="center" wrap={false} className="mt-1.5">
            <Type as="span" size="lg" tone="muted">
              ₹
            </Type>
            <input
              type="number"
              min={0}
              // Rupees in the field, paise in the state. Money is integer paise
              // everywhere in this codebase; the input is the only place a
              // rupee figure exists.
              value={Math.round(asking / 100)}
              onChange={(event) => {
                const rupees = Number.parseInt(event.target.value, 10)
                onAsking(Number.isFinite(rupees) && rupees >= 0 ? rupees * 100 : 0)
              }}
              className="ease w-40 border border-line bg-background px-3 py-2.5 text-lg text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onAsking(assessment.suggestedInr.mid)}
              className="ease text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-ink"
            >
              {accountCopy.sell.price.useSuggested}
            </button>
          </Row>
        </label>

        {/* A flag, never a block. See the component note. */}
        {warning !== null && (
          <Row gap={2} align="start" wrap={false} className="border border-line-strong p-3">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-ink"
              strokeWidth={1.5}
              aria-hidden
            />
            <Stack gap={0}>
              <Type as="span" size="sm" weight="emphasis">
                {accountCopy.sell.price.flagTitle}
              </Type>
              <Type size="xs" tone="muted">
                {warning.message}
              </Type>
            </Stack>
          </Row>
        )}
      </Stack>

      <Stack gap={1} className="border-t border-line pt-4">
        <Row gap={3} justify="between" align="baseline">
          <Type as="span" size="sm" tone="muted">
            {accountCopy.sell.price.payoutLabel}
          </Type>
          <Type as="span" size="xl" family="display" weight="heading" numeric>
            {formatInr(payout)}
          </Type>
        </Row>
        <Type size="xs" tone="subtle">
          {accountCopy.sell.price.payoutNote(RESALE_COMMISSION_PERCENT)}
        </Type>
      </Stack>

      <Stack gap={2}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || asking <= 0}
          className="ease self-start bg-ink px-6 py-3.5 text-sm text-background transition-colors duration-fast hover:bg-ink-muted disabled:opacity-70"
        >
          {busy ? 'Sending…' : accountCopy.sell.price.submit}
        </button>
        <Type size="xs" tone="subtle" measure="default">
          {accountCopy.sell.price.submitNote}
        </Type>
      </Stack>
    </Stack>
  )
}

function Done({ reference }: { reference: string }) {
  return (
    <Stack gap={4}>
      <Eyebrow>{accountCopy.sell.done.eyebrow}</Eyebrow>
      <Type as="h1" family="display" size="3xl" weight="heading">
        {accountCopy.sell.done.title}
      </Type>
      <Type size="lg" tone="muted" measure="default">
        {accountCopy.sell.done.body}
      </Type>
      <Row gap={2} align="baseline">
        <Type as="span" size="sm" tone="subtle">
          {accountCopy.sell.done.reference}
        </Type>
        <Type as="span" size="sm" numeric weight="emphasis">
          {reference}
        </Type>
      </Row>
      <Link
        href="/account/purchases"
        className="ease mt-2 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
      >
        {accountCopy.sell.done.backAction}
      </Link>
    </Stack>
  )
}

/** The garment being sold, shown alongside the flow so it stays concrete. */
export function SellSubject({ line }: { line: OrderLine }) {
  return (
    <Row gap={4} align="start" wrap={false} className="border border-line p-4">
      <div className="w-22 relative h-28 shrink-0 overflow-hidden bg-surface">
        <Image
          src={line.product.primaryImage.url}
          alt={line.product.primaryImage.alt}
          fill
          sizes="88px"
          quality={PHOTO_QUALITY}
          className="object-cover"
        />
      </div>
      <Stack gap={1} className="min-w-0">
        <Type as="h2" size="sm" weight="emphasis" truncate>
          {line.product.title}
        </Type>
        <Type as="span" size="xs" tone="muted" truncate>
          {line.selection !== null
            ? `${line.selection.colorName} · ${line.selection.sizeLabel}`
            : `${line.product.color.name} · ${line.size.label}`}
        </Type>
        <Type as="span" size="xs" tone="subtle" numeric>
          You paid {formatInr(line.pricePaidInr)}
        </Type>
      </Stack>
    </Row>
  )
}
