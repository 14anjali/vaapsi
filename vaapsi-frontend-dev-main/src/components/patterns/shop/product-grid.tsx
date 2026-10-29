import { ProductCard, ProductCardSkeleton } from '../product-card'
import type { ProductSummary } from '@/lib/types'

/**
 * The product grid.
 *
 * Two across on mobile, three on tablet, four on desktop. **These counts divide
 * the page size (12) exactly**, which is what stops an orphan row — a single
 * card sitting alone at the bottom of an otherwise full grid is the most visible
 * possible sign that nobody checked.
 *
 * The grid is its own `grid-cols-2/3/4` rather than the site's 4/8/12 `Grid`,
 * because a card is not a column: it is a fixed-ratio tile, and expressing "four
 * across" as "three of twelve columns each" adds a translation step for no gain.
 * The gutter still comes from the same tokens, so it stays aligned to the page.
 *
 * A server component. Nothing here is interactive beyond the card links.
 */

const GRID =
  'grid grid-cols-2 gap-x-4 gap-y-10 tablet:grid-cols-3 desktop:grid-cols-4 desktop:gap-x-6'

/** `sizes` matched to the column counts above, so no oversized image is fetched. */
const CARD_SIZES = '(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 46vw'

export function ProductGrid({ products }: { products: readonly ProductSummary[] }) {
  return (
    <ul className={GRID}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          as="li"
          product={product}
          sizes={CARD_SIZES}
          // The first row only. Priority-loading everything is the same as
          // priority-loading nothing, and it delays the images that matter.
          priority={index < 4}
        />
      ))}
    </ul>
  )
}

/**
 * Skeleton grid, at the card's exact dimensions so nothing reflows when the real
 * results arrive.
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} as="li" />
      ))}
    </ul>
  )
}
