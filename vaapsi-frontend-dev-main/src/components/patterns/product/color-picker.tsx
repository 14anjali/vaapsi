'use client'

import { useState } from 'react'
import { ColorSwatch } from '../color-swatch'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { productPage } from '@/content/product'
import { formatInr } from '@/lib/format/currency'
import type { ColorVariant, Size } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The colour picker, for new stock.
 *
 * ## Why this only appears on new stock
 *
 * A pre-loved listing is one physical garment. Offering colours on it would be
 * advertising objects that do not exist, so the picker is gated on
 * `colorVariants` being non-empty — which the fixtures guarantee is true only
 * for `listingType: 'new'`. See `ListingType`.
 *
 * ## Sold-out colours stay in the row
 *
 * Struck through, dimmed, and unclickable, rather than removed. Two reasons: a
 * row that silently loses a swatch makes a shopper who saw it earlier think the
 * site is broken, and knowing that the black sold out is genuinely useful
 * information about what people buy. It is announced as unavailable rather than
 * just looking grey.
 *
 * ## Sizes are per colour
 *
 * Picking a colour re-renders the size row, because stock differs by colourway —
 * the light wash has two sizes left, the mid indigo has five. A size list that
 * ignored the selected colour would offer sizes that cannot be bought, which is
 * the failure this component exists to prevent. Selecting a colour whose sizes
 * do not include the current selection clears the size rather than silently
 * keeping an impossible pair.
 *
 * ## A note on the bag
 *
 * The selection here is **local component state and goes no further.** The
 * persisted cart stores a product ID and nothing else (`lib/store/cart`), so
 * there is nowhere to record which colour and size was chosen. Adding a variant
 * ref to `CartItemRef` is the missing piece before new stock can actually be
 * sold; until then this component is an honest picker over an inventory the cart
 * cannot yet express, and the button below it says so.
 */
export function ColorPicker({
  variants,
  /** The colourway a shopper lands on. Defaults to the first available one. */
  defaultColorSlug,
  /** Product-level price, used when a colourway does not override it. */
  priceInr,
}: {
  variants: readonly ColorVariant[]
  defaultColorSlug?: string
  priceInr: number
}) {
  const firstSelectable =
    variants.find((variant) => variant.availability !== 'sold') ?? variants[0]!
  const initial =
    variants.find(
      (variant) => variant.color.slug === defaultColorSlug && variant.availability !== 'sold',
    ) ?? firstSelectable

  const [selectedSlug, setSelectedSlug] = useState(initial.color.slug)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)

  const selected = variants.find((variant) => variant.color.slug === selectedSlug) ?? initial

  function pick(variant: ColorVariant) {
    setSelectedSlug(variant.color.slug)
    // Clear a size that this colourway does not carry, rather than leaving an
    // impossible colour/size pair selected.
    setSelectedSize((current) =>
      current !== null && variant.sizes.some((size) => size.normalized === current.normalized)
        ? current
        : null,
    )
  }

  const effectivePrice = selected.priceInr ?? priceInr

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Row gap={2} align="baseline">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {productPage.colorPicker.label}
          </Type>
          {/* The name of the selected colour, always spelled out beside the row. */}
          <Type as="span" size="sm" weight="emphasis">
            {selected.color.name}
          </Type>
        </Row>

        {/* A group, so the swatches are announced as one control and not as
            eight unrelated buttons. `Row` takes no ARIA props, hence the div. */}
        <div role="group" aria-label={productPage.colorPicker.label}>
          <Row gap={2} align="center">
            {variants.map((variant) => {
              const isSelected = variant.color.slug === selected.color.slug
              const soldOut = variant.availability === 'sold'
              return (
                <button
                  key={variant.color.slug}
                  type="button"
                  onClick={() => pick(variant)}
                  disabled={soldOut}
                  aria-pressed={isSelected}
                  aria-label={
                    soldOut
                      ? productPage.colorPicker.soldOutOption(variant.color.name)
                      : variant.color.name
                  }
                  className={cn(
                    'ease relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-fast',
                    isSelected
                      ? 'ring-1 ring-ink ring-offset-2'
                      : 'hover:ring-1 hover:ring-line-strong',
                    soldOut && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <ColorSwatch color={variant.color} size="large" />
                  {soldOut && (
                    // A diagonal bar, not a tooltip. Visible without hover, which
                    // is the only version that works on touch.
                    <span aria-hidden className="absolute h-px w-7 rotate-45 bg-ink" />
                  )}
                </button>
              )
            })}
          </Row>
        </div>

        {selected.priceInr !== null && (
          <Type size="xs" tone="muted">
            {productPage.colorPicker.pricedDifferently(formatInr(effectivePrice))}
          </Type>
        )}
      </Stack>

      <Stack gap={2} className="border-t border-line pt-4">
        <Row gap={2} align="baseline">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {productPage.colorPicker.sizeLabel}
          </Type>
          <Type as="span" size="sm" weight="emphasis">
            {selectedSize?.label ?? productPage.colorPicker.sizeUnchosen}
          </Type>
        </Row>

        {selected.sizes.length === 0 ? (
          <Type size="xs" tone="muted">
            {productPage.colorPicker.colorSoldOut}
          </Type>
        ) : (
          <div role="group" aria-label={productPage.colorPicker.sizeLabel}>
            <Row gap={2} align="center" wrap>
              {selected.sizes.map((size) => {
                const isSelected = selectedSize?.normalized === size.normalized
                return (
                  <button
                    key={size.normalized}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={isSelected}
                    className={cn(
                      'ease min-w-[3rem] border px-3 py-2 text-sm transition-colors duration-fast',
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
      </Stack>
    </Stack>
  )
}
