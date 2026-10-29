import Image from 'next/image'
import Link from 'next/link'
import { CardPurchaseBlock } from './card-purchase-block'
import { Price } from './price'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { conditionCopy, productCard, productPage } from '@/content/product'
import { PHOTO_QUALITY } from '@/lib/image'
import type { ProductImage, ProductSummary } from '@/lib/types'
import { formatComposition, formatSizeRange } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * The most reused component on the site.
 *
 * Interaction, deliberately restrained: hovering cross-fades to the first
 * `detail` image. No zoom, no lift, no shadow, no border appearing. The image
 * changing *is* the affordance, and it also does something useful — it shows
 * you the fabric.
 *
 * ## What a card states
 *
 * The name, then one line of facts — **sizes, composition, and the grade where
 * there is one** — then the price. Colourways are shown as swatches rather than
 * named, because the swatch row already says what is available and naming one
 * colour described a default rather than the offer.
 *
 * **Sizes are a span, not a single label.** New stock carries several sizes
 * across its colourways, so "W28–W36" is the offer where "W30" was just
 * whichever size happened to be the product's default. A pre-loved garment is
 * one physical object and still shows its own single size — that is not a
 * default, it is the only one there is. See `formatSizeRange`.
 *
 * **The garment's own name leads, and it is the only name shown.** Every listing
 * is a Vaapsi piece, so the brand distinguished nothing — eleven identical
 * headings. `subcategory` went the same way: under "Ravi Straight Jean" it read
 * "Straight jeans", which is the name again with a word removed.
 *
 * Composition is shortened for the line — "98% cotton", not "98% cotton, 2%
 * elastane" — while keeping the percentage, because dropping it would imply
 * 100% and quietly lose the stretch. See `formatComposition`.
 *
 * ## The block below the title
 *
 * `CardPurchaseBlock` owns the facts line, the swatches, the size buttons and
 * the price/action row together, because they interleave: colours sit beside the
 * facts, the action sits beside the price. It is a client component for the
 * selection state; this card stays a server component.
 *
 * **Condition appears on pre-loved cards only.** New stock has no grade: it has
 * not been worn, so there is nothing to grade, and `condition` is null on those
 * products precisely so this cannot be faked. See `ListingType`.
 *
 * ## The link is a stretched overlay
 *
 * The card carries a button now, and a button inside an anchor is invalid. So
 * the anchor is an absolutely positioned overlay across the whole card at `z-0`,
 * the bag button sits at `z-10`, and neither is nested in the other. The anchor
 * has no visible text, so it takes its spoken name from `productCard.linkLabel`.
 *
 * **Sold garments stay visible and look spent.** Image desaturated, "Sold" in
 * place of the price, the whole card at reduced contrast. On a one-of-one
 * marketplace, seeing sold stock is proof of liquidity — it tells a shopper that
 * things here actually move, and that hesitating has a cost. Hiding it throws
 * that away. The card stays a link, because a sold garment still has a passport
 * worth reading.
 *
 * A `reserved` garment is not marked on the card. It is still available if the
 * other shopper abandons checkout, and flagging it here would either be wrong
 * within the minute or read as a scarcity trick.
 */

export type ProductCardProps = {
  product: ProductSummary
  /**
   * The `detail` image, for the hover cross-fade. Optional — `ProductSummary`
   * only carries the primary, so a caller with the full product passes it and a
   * caller working from a list summary does not. Without it the card simply
   * does not cross-fade.
   */
  detailImage?: ProductImage
  /** Priority-load the image. Use for the first row of a grid, nothing else. */
  priority?: boolean
  /** Responsive `sizes` for the image. Set per layout by the parent. */
  sizes?: string
  /**
   * Show the condition grade. Defaults to following the listing type, which is
   * what every grid wants. Pass `false` to suppress it somewhere that has
   * already stated it.
   */
  showCondition?: boolean
  /** Hide the bag button, for contexts where adding is not the action. */
  showBagButton?: boolean
  className?: string
  as?: 'div' | 'li'
}

export function ProductCard({
  product,
  detailImage,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw',
  showCondition,
  showBagButton = true,
  className,
  as: Component = 'div',
}: ProductCardProps) {
  const sold = product.availability === 'sold'

  // Pre-loved carries a grade; new stock has none to carry. The null check is
  // not defensive — `condition` is genuinely null on new products.
  const condition = product.condition === null ? null : (conditionCopy[product.condition] ?? null)
  const withCondition = (showCondition ?? product.listingType === 'pre_loved') && condition !== null

  // New stock spans its colourways' sizes; a one-of-one garment has exactly the
  // size on its own label.
  const sizeText =
    product.colorVariants.length > 0
      ? formatSizeRange(product.colorVariants.flatMap((variant) => variant.sizes))
      : product.size.label

  return (
    <Component className={cn('group/card relative', className)}>
      {/* 3:4, always. The grid reserves the space before the image loads. */}
      <div className={cn('relative aspect-[3/4] overflow-hidden bg-surface', sold && 'opacity-60')}>
        <Image
          src={product.primaryImage.url}
          alt={product.primaryImage.alt}
          fill
          sizes={sizes}
          quality={PHOTO_QUALITY}
          priority={priority}
          className={cn(
            'ease object-cover transition-opacity duration-slow',
            sold && 'saturate-0',
            detailImage !== undefined && 'group-hover/card:opacity-0',
          )}
        />

        {detailImage !== undefined && (
          <Image
            src={detailImage.url}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            quality={PHOTO_QUALITY}
            className={cn(
              'ease object-cover opacity-0 transition-opacity duration-slow group-hover/card:opacity-100',
              sold && 'saturate-0',
            )}
          />
        )}
      </div>

      <Stack gap={1} className="pt-3">
        {/*
          No passport mark. Every garment has a record, so a badge on some cards
          and not others was reporting the state of our data rather than telling
          a shopper anything about the garment. The record itself lives in the
          product page's details, where there is room to show what is actually
          in it.
        */}
        <Type as="h3" size="sm" weight="emphasis" truncate tone={sold ? 'muted' : 'default'}>
          {product.title}
        </Type>

        {showBagButton ? (
          <CardPurchaseBlock
            productId={product.id}
            availability={product.availability}
            sizeText={sizeText}
            composition={formatComposition(product.composition)}
            priceInr={product.priceInr}
            originalRetailInr={product.originalRetailInr}
            variants={product.colorVariants}
            conditionLabel={withCondition ? condition.label : null}
          />
        ) : (
          // Somewhere adding is not the action — the cart's own "goes with"
          // rail, for instance. Facts and price, no controls.
          <Stack gap={1} className="pt-2">
            <Row gap={2} align="center" wrap={false} className="min-w-0 text-ink-subtle">
              <Type as="span" size="xs" tone="inherit" numeric>
                {sizeText}
              </Type>
              <span aria-hidden>·</span>
              <Type as="span" size="xs" tone="inherit" truncate>
                {formatComposition(product.composition)}
              </Type>
            </Row>
            <Price
              priceInr={product.priceInr}
              originalRetailInr={product.originalRetailInr}
              availability={product.availability}
            />
          </Stack>
        )}
      </Stack>

      {/*
        The card link. Stretched across everything above at z-0, so the bag
        button at z-10 stays clickable and nothing is nested. See the component
        note.
      */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-offset-4"
      >
        <span className="sr-only">
          {productCard.linkLabel({
            name: product.title,
            garment: product.subcategory,
            // The spoken name keeps the *span* of sizes and the colour count,
            // matching what is visible. `product.size.label` here would name a
            // default the card no longer shows.
            size: sizeText,
            color: product.color.name,
          })}
        </span>
      </Link>
    </Component>
  )
}

/**
 * Skeleton matching the card's exact dimensions, so a grid does not reflow when
 * the real thing arrives. The proportions below have to stay in step with the
 * card above — if you change the card's spacing, change this.
 */
export function ProductCardSkeleton({ as: Component = 'div' }: { as?: 'div' | 'li' }) {
  return (
    <Component aria-hidden>
      <div className="aspect-[3/4] animate-pulse bg-surface" />
      <Stack gap={1} className="pt-3">
        <div className="h-4 w-2/5 animate-pulse bg-surface" />
        <div className="h-4 w-3/5 animate-pulse bg-surface" />
        <div className="h-3 w-1/2 animate-pulse bg-surface" />
        <div className="mt-1 flex items-end justify-between">
          <div className="h-5 w-1/3 animate-pulse bg-surface" />
          <div className="h-9 w-9 animate-pulse bg-surface" />
        </div>
      </Stack>
    </Component>
  )
}

/** Screen-reader-only availability note, for contexts that need it spoken. */
export function AvailabilityNote({ product }: { product: ProductSummary }) {
  if (product.availability === 'available') return null
  return <span className="sr-only">{productPage.availability[product.availability]}</span>
}
