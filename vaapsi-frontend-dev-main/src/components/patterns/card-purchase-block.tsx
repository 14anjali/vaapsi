'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { ColorSwatch } from './color-swatch'
import { Price } from './price'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { productCard } from '@/content/product'
import { useCartStore } from '@/lib/store/cart'
import type { Availability, ColorVariant, Paise, Size } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Everything below a card's photograph and title: the facts, the colourways,
 * the price and the add control.
 *
 * ## Why it is one component
 *
 * The layout interleaves stateful and static content — the colour swatches sit
 * on the same line as the size and composition, and the add button sits on the
 * same line as the price. Splitting it would mean lifting the selected colour
 * and size into the card, which is a server component and cannot hold state. So
 * this owns the state and the two-column arrangement together.
 *
 * ## The arrangement
 *
 *   size · composition          ● ● ●        <- facts left, colours right
 *   [ size buttons ]                         <- only once a colour is chosen
 *   ₹3,900                    [ Add to cart ] <- price left, action right
 *
 * Two rows at rest instead of four. The old version stacked swatches, sizes and
 * button in a column on the right, which left a column of white space beside
 * the price and pushed every card taller than its content needed.
 *
 * The size row is the one thing that appears on demand, and it has to: stock
 * differs by colourway, so the buyable sizes are not known until a colour is
 * picked. Reserving space for it permanently would put the white space back.
 *
 * ## What is not here any more
 *
 * The colour *name* and its swatch used to sit in the facts line. Both are gone:
 * the swatch row on the right already shows every colour available, so naming
 * one of them in the facts line was describing a default rather than the offer,
 * and on a catalogue of blue denim "Mid indigo" next to three blue dots was
 * duplication rather than information. The name comes back as the swatch's
 * accessible label and on the product page, where there is room to be precise.
 */
export function CardPurchaseBlock({
  productId,
  availability,
  /** The size span for new stock, or the single label for a one-of-one piece. */
  sizeText,
  /** Already shortened for a card — see `formatComposition`. */
  composition,
  priceInr,
  originalRetailInr,
  /** Colourways. Empty for one-of-one stock. */
  variants,
  /** Grade, pre-loved only. Already resolved by the card. */
  conditionLabel,
}: {
  productId: string
  availability: Availability
  sizeText: string
  composition: string
  priceInr: Paise
  originalRetailInr: Paise | null
  variants: readonly ColorVariant[]
  conditionLabel: string | null
}) {
  const add = useCartStore((state) => state.add)
  const items = useCartStore((state) => state.items)

  const [colorSlug, setColorSlug] = useState<string | null>(null)
  const [sizeNormalized, setSizeNormalized] = useState<string | null>(null)

  const selectable = variants.filter((variant) => variant.availability !== 'sold')
  const selected =
    colorSlug === null ? null : (variants.find((v) => v.color.slug === colorSlug) ?? null)

  const inBag = items.some(
    (item) =>
      item.productId === productId &&
      (item.colorSlug ?? null) === colorSlug &&
      (item.sizeNormalized ?? null) === sizeNormalized,
  )

  const hasChoice = variants.length > 0
  const ready = colorSlug !== null && sizeNormalized !== null
  const purchasable = availability === 'available'

  function pickColor(variant: ColorVariant) {
    setColorSlug(variant.color.slug)
    // Drop a size this colourway does not carry, rather than leaving an
    // impossible pair selected.
    setSizeNormalized((current) =>
      current !== null && variant.sizes.some((size) => size.normalized === current)
        ? current
        : null,
    )
  }

  return (
    <Stack gap={1} className="pt-2">
      {/* ---- Facts left, colours right */}
      <Row gap={3} justify="between" align="center" wrap={false}>
        <Row gap={2} align="center" wrap={false} className="min-w-0 text-ink-subtle">
          <Type as="span" size="xs" tone="inherit" numeric>
            <span className="sr-only">{productCard.sizeLabel} </span>
            {sizeText}
          </Type>
          <span aria-hidden>·</span>
          <Type as="span" size="xs" tone="inherit" truncate>
            {composition}
          </Type>
          {conditionLabel !== null && (
            <>
              <span aria-hidden>·</span>
              <Type as="span" size="xs" tone="inherit" className="shrink-0">
                {conditionLabel}
              </Type>
            </>
          )}
        </Row>

        {hasChoice && purchasable && (
          <div role="group" aria-label={productCard.colorLabel} className="relative z-10 shrink-0">
            <Row gap={2} align="center" wrap={false}>
              {selectable.map((variant) => {
                const isSelected = variant.color.slug === colorSlug
                return (
                  <button
                    key={variant.color.slug}
                    type="button"
                    onClick={() => pickColor(variant)}
                    aria-pressed={isSelected}
                    aria-label={variant.color.name}
                    className={cn(
                      'ease inline-flex h-5 w-5 items-center justify-center rounded-full transition-shadow duration-fast',
                      isSelected
                        ? 'ring-1 ring-ink ring-offset-2'
                        : 'hover:ring-1 hover:ring-line-strong',
                    )}
                  >
                    <ColorSwatch color={variant.color} />
                  </button>
                )
              })}
            </Row>
          </div>
        )}
      </Row>

      {/* ---- Sizes, once a colour narrows them down */}
      {selected !== null && purchasable && (
        <div role="group" aria-label={productCard.sizeLabel} className="relative z-10 pt-1">
          <Row gap={1} align="center" wrap>
            {selected.sizes.map((size: Size) => {
              const isSelected = size.normalized === sizeNormalized
              return (
                <button
                  key={size.normalized}
                  type="button"
                  onClick={() => setSizeNormalized(size.normalized)}
                  aria-pressed={isSelected}
                  className={cn(
                    'ease min-w-[2.25rem] border px-1.5 py-1 text-xs transition-colors duration-fast',
                    isSelected
                      ? 'border-ink bg-ink text-background'
                      : 'border-line-strong text-ink hover:bg-surface',
                  )}
                >
                  {size.label}
                </button>
              )
            })}
          </Row>
        </div>
      )}

      {/* ---- Price left, action right */}
      <Row gap={3} justify="between" align="center" wrap={false} className="pt-1">
        <Price
          priceInr={priceInr}
          originalRetailInr={originalRetailInr}
          availability={availability}
        />

        {purchasable && (
          <div className="relative z-10 shrink-0">
            {hasChoice ? (
              <button
                type="button"
                onClick={() => {
                  if (!ready || colorSlug === null || sizeNormalized === null) return
                  add(productId, { colorSlug, sizeNormalized })
                }}
                // Not `disabled`: the label says what is missing, and a disabled
                // control is skipped entirely by some assistive tech.
                aria-disabled={!ready || inBag}
                className={cn(
                  'ease border px-3 py-1.5 text-xs transition-colors duration-fast',
                  inBag
                    ? 'cursor-default border-line-strong text-ink-muted'
                    : ready
                      ? 'border-ink bg-ink text-background hover:bg-ink-muted'
                      : 'cursor-default border-line text-ink-subtle',
                )}
              >
                {inBag
                  ? delivery.bag.added
                  : ready
                    ? productCard.addToCart
                    : colorSlug === null
                      ? productCard.pickColorFirst
                      : productCard.pickSizeFirst}
              </button>
            ) : inBag ? (
              <span
                // Not a button: there is nothing left to activate.
                role="img"
                aria-label={delivery.bag.added}
                className="inline-flex h-8 w-8 items-center justify-center border border-line-strong text-ink-muted"
              >
                <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => add(productId)}
                aria-label={delivery.bag.add}
                className="ease inline-flex h-8 w-8 items-center justify-center border border-ink bg-ink text-background transition-colors duration-fast hover:bg-ink-muted"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </button>
            )}
          </div>
        )}
      </Row>
    </Stack>
  )
}
