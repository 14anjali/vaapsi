'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { customise, placementsFor, trinkets } from '@/content/customise'
import { formatInr } from '@/lib/format/currency'
import type { ProductCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * "Make it your own" — the customisation configurator.
 *
 * ## The model
 *
 * A customisation is a set of **place → thing** pairs. That is the whole state,
 * and it is deliberately that small: it makes the current configuration
 * readable at a glance ("Sashiko stitching on the back yoke, initials inside the
 * cuff"), and it makes the one real physical constraint expressible — a placement
 * can hold one addition, because two patches cannot be sewn in the same spot.
 *
 * Placements are filtered by the garment's category (`placementsFor`), so a bag
 * is not offered a back yoke.
 *
 * ## Why the consequences are in the component and not in a policy link
 *
 * Four things change when you add to a garment: the price, the dispatch date,
 * whether it can be returned, and the passport. All four appear as soon as
 * anything is added, and they update as the list grows. The returns line is the
 * important one — hand work cannot be undone, so a customised garment is final
 * sale, and a shopper who learns that after delivery has a legitimate complaint
 * that no amount of copy fixes afterwards. It is stated flatly.
 *
 * The lead time takes the **maximum**, not the sum: the studio does the work in
 * one pass, so two additions do not take twice as long. Summing would be a
 * pessimistic lie in the other direction, and either way the number should match
 * what operations actually does.
 *
 * ## Why the selection is local state
 *
 * It reports upward through `onChange`. Persisting a customisation into the bag
 * means putting it on `CartItemRef`, which is a contract change with a real
 * fulfilment consequence — the studio has to receive it — and that belongs to
 * the phase that builds ordering. The component is shaped so that wiring is one
 * prop, and the note in `content/customise.ts` records what still needs signing
 * off before any of it is chargeable.
 */

export type Customisation = {
  placementId: string
  trinketId: string
}

export function Customiser({
  category,
  hasPassport,
  onChange,
}: {
  category: ProductCategory
  hasPassport: boolean
  onChange?: (state: {
    items: readonly Customisation[]
    priceInr: number
    leadDays: number
  }) => void
}) {
  const available = useMemo(() => placementsFor(category), [category])

  const [items, setItems] = useState<readonly Customisation[]>([])
  const [trinketId, setTrinketId] = useState<string | null>(null)
  const [placementId, setPlacementId] = useState<string | null>(null)

  const byTrinket = useMemo(() => new Map(trinkets.map((t) => [t.id, t])), [])
  const byPlacement = useMemo(() => new Map(available.map((p) => [p.id, p])), [available])

  const selectedTrinket = trinketId === null ? null : (byTrinket.get(trinketId) ?? null)

  const priceInr = items.reduce(
    (sum, item) => sum + (byTrinket.get(item.trinketId)?.priceInr ?? 0),
    0,
  )
  // Max, not sum. The studio does the work in one pass — see the note above.
  const leadDays = items.reduce(
    (longest, item) => Math.max(longest, byTrinket.get(item.trinketId)?.leadDays ?? 0),
    0,
  )

  function report(next: readonly Customisation[]) {
    const nextPrice = next.reduce(
      (sum, item) => sum + (byTrinket.get(item.trinketId)?.priceInr ?? 0),
      0,
    )
    const nextLead = next.reduce(
      (longest, item) => Math.max(longest, byTrinket.get(item.trinketId)?.leadDays ?? 0),
      0,
    )
    onChange?.({ items: next, priceInr: nextPrice, leadDays: nextLead })
  }

  function addSelection() {
    if (trinketId === null || placementId === null) return
    if (items.some((item) => item.placementId === placementId)) return
    const next = [...items, { placementId, trinketId }]
    setItems(next)
    report(next)
    // Clear the placement but keep the thing selected: adding the same charm to
    // two loops is a real thing people do, and re-picking it every time is
    // friction for no reason.
    setPlacementId(null)
  }

  function removeAt(id: string) {
    const next = items.filter((item) => item.placementId !== id)
    setItems(next)
    report(next)
  }

  const takenBy = new Map(items.map((item) => [item.placementId, item.trinketId]))
  const canAdd = trinketId !== null && placementId !== null

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Eyebrow as="h2">{customise.eyebrow}</Eyebrow>
        <Type as="p" size="lg" family="display" weight="heading">
          {customise.title}
        </Type>
        <Type size="sm" tone="muted" measure="default">
          {customise.standfirst}
        </Type>
      </Stack>

      {/* ---- 1. What to add */}
      <Stack gap={2}>
        <Type as="h3" size="xs" tone="subtle" tracking="caps">
          {customise.chooseTrinket}
        </Type>
        <Stack gap={2} as="ul">
          {trinkets.map((trinket) => {
            const isSelected = trinket.id === trinketId
            return (
              <li key={trinket.id}>
                <button
                  type="button"
                  onClick={() => setTrinketId(trinket.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'ease block w-full border p-3 text-left transition-colors duration-fast',
                    isSelected ? 'border-ink' : 'border-line hover:border-line-strong',
                  )}
                >
                  <Row gap={3} justify="between" align="baseline" wrap={false}>
                    <Type as="span" size="sm" weight="emphasis">
                      {trinket.label}
                    </Type>
                    <Type as="span" size="sm" tone="muted" numeric className="shrink-0">
                      {formatInr(trinket.priceInr)}
                    </Type>
                  </Row>
                  <Type size="xs" tone="muted" className="mt-1">
                    {trinket.description}
                  </Type>
                  <Row gap={2} align="baseline" className="mt-1.5">
                    <Type as="span" size="xs" tone="subtle">
                      {trinket.by}
                    </Type>
                    <span aria-hidden className="text-ink-subtle">
                      ·
                    </span>
                    <Type as="span" size="xs" tone="subtle" numeric>
                      +{trinket.leadDays}d
                    </Type>
                  </Row>
                </button>
              </li>
            )
          })}
        </Stack>
      </Stack>

      {/* ---- 2. Where it goes. Only once something is chosen — an empty
               placement grid with nothing to place is a dead control. */}
      {selectedTrinket !== null && (
        <Stack gap={2}>
          <Type as="h3" size="xs" tone="subtle" tracking="caps">
            {customise.choosePlacement}
          </Type>
          <Row gap={2} align="center" wrap>
            {available.map((placement) => {
              const occupiedBy = takenBy.get(placement.id)
              const taken = occupiedBy !== undefined
              const isSelected = placement.id === placementId
              return (
                <button
                  key={placement.id}
                  type="button"
                  onClick={() => setPlacementId(placement.id)}
                  disabled={taken}
                  aria-pressed={isSelected}
                  aria-label={
                    taken
                      ? customise.placementTakenOption(
                          placement.label,
                          byTrinket.get(occupiedBy)?.label ?? '',
                        )
                      : placement.label
                  }
                  className={cn(
                    'ease border px-3 py-2 text-xs transition-colors duration-fast',
                    taken
                      ? 'cursor-not-allowed border-line text-ink-subtle line-through'
                      : isSelected
                        ? 'border-ink bg-ink text-background'
                        : 'border-line-strong text-ink hover:bg-surface',
                  )}
                >
                  {placement.label}
                </button>
              )
            })}
          </Row>

          <button
            type="button"
            onClick={addSelection}
            aria-disabled={!canAdd}
            className={cn(
              'ease mt-1 self-start border px-5 py-2.5 text-sm transition-colors duration-fast',
              canAdd
                ? 'border-ink bg-ink text-background hover:bg-ink-muted'
                : 'cursor-default border-line text-ink-subtle',
            )}
          >
            {customise.addAction}
          </button>
        </Stack>
      )}

      {/* ---- 3. What is on the garment */}
      <Stack gap={2} className="border-t border-line pt-4">
        <Type as="h3" size="xs" tone="subtle" tracking="caps">
          {customise.added}
        </Type>

        {items.length === 0 ? (
          <Stack gap={1}>
            <Type size="sm" tone="muted">
              {customise.empty}
            </Type>
            <Type size="xs" tone="subtle">
              {customise.emptyHelp}
            </Type>
          </Stack>
        ) : (
          <Stack gap={2} as="ul">
            {items.map((item) => {
              const trinket = byTrinket.get(item.trinketId)
              const placement = byPlacement.get(item.placementId)
              if (trinket === undefined || placement === undefined) return null
              return (
                <li key={item.placementId}>
                  <Row gap={3} justify="between" align="baseline" wrap={false}>
                    <Type as="span" size="sm">
                      {trinket.label}
                      <Type as="span" size="sm" tone="muted">
                        {' '}
                        — {placement.label}
                      </Type>
                    </Type>
                    <Row gap={2} align="baseline" wrap={false} className="shrink-0">
                      <Type as="span" size="sm" tone="muted" numeric>
                        {formatInr(trinket.priceInr)}
                      </Type>
                      <button
                        type="button"
                        onClick={() => removeAt(item.placementId)}
                        aria-label={customise.removeAction(trinket.label, placement.label)}
                        className="ease -m-1 p-1 text-ink-subtle transition-colors duration-fast hover:text-ink"
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      </button>
                    </Row>
                  </Row>
                </li>
              )
            })}
          </Stack>
        )}
      </Stack>

      {/* ---- 4. The consequences. All four, as soon as anything is added. */}
      {items.length > 0 && (
        <Stack gap={2} className="border border-line bg-surface p-4">
          <Type as="h3" size="xs" tone="subtle" tracking="caps">
            {customise.consequences.heading}
          </Type>
          <Stack gap={2} as="ul">
            <Consequence>{customise.consequences.cost(formatInr(priceInr))}</Consequence>
            <Consequence>{customise.consequences.lead(leadDays)}</Consequence>
            {/* Emphasised, because it is the one that cannot be undone. */}
            <Consequence emphasis>{customise.consequences.returns}</Consequence>
            <Consequence>
              {hasPassport ? customise.consequences.passport : customise.noPassportNote}
            </Consequence>
          </Stack>

          <Row gap={3} justify="between" align="baseline" className="border-t border-line pt-3">
            <Type as="span" size="sm" tone="muted">
              {customise.totalLabel}
            </Type>
            <Type as="span" size="lg" weight="heading" numeric>
              {formatInr(priceInr)}
            </Type>
          </Row>

          {customise.isProvisional && (
            <Type size="xs" tone="subtle">
              {customise.provisionalNote}
            </Type>
          )}
        </Stack>
      )}
    </Stack>
  )
}

function Consequence({
  children,
  emphasis = false,
}: {
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <Type
      as="li"
      size="xs"
      tone={emphasis ? 'default' : 'muted'}
      weight={emphasis ? 'emphasis' : 'regular'}
    >
      {children}
    </Type>
  )
}
