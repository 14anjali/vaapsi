'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Row } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { PHOTO_QUALITY } from '@/lib/image'
import { formatInr } from '@/lib/format/currency'
import type { ProductSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * "Goes with this" — a rail of thumbnails under the detail column.
 *
 * ## The copy is the honest part
 *
 * It is **not** "Recommended for you". Phase 1 excludes AI recommendations, and
 * there is no personalisation behind this — it is a stated heuristic (other
 * available pieces, favouring different categories so the set reads as an
 * outfit). Labelling a heuristic as a recommendation is the kind of small
 * overclaim this brand cannot afford, given that the rest of the page is built
 * on saying exactly how much we know.
 *
 * ## Native scroll, with buttons
 *
 * Scroll-snap does the work; the arrows are a convenience for a mouse user on a
 * wide screen, and they are **hidden when everything already fits** — an arrow
 * that does nothing is worse than no arrow. They scroll by one viewport of the
 * rail rather than by a fixed pixel count, so the behaviour holds at any
 * breakpoint.
 *
 * Cut-off garments show price but no condition or size: at this thumbnail size
 * neither is legible, and a truncated condition grade would be worse than none.
 */
export function CompleteTheLook({
  products,
  heading,
}: {
  products: readonly ProductSummary[]
  heading: string
}) {
  const railRef = useRef<HTMLUListElement>(null)

  if (products.length === 0) return null

  const scrollBy = (direction: -1 | 1) => {
    const rail = railRef.current
    if (rail === null) return
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' })
  }

  // Three or fewer always fit, so the arrows would be inert.
  const scrollable = products.length > 3

  return (
    <section aria-labelledby="goes-with">
      <Row gap={4} justify="between" align="center" className="pb-3">
        <Eyebrow as="h2" id="goes-with">
          {heading}
        </Eyebrow>

        {scrollable && (
          <Row gap={1} wrap={false}>
            <RailButton label="Scroll left" onClick={() => scrollBy(-1)}>
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            </RailButton>
            <RailButton label="Scroll right" onClick={() => scrollBy(1)}>
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
            </RailButton>
          </Row>
        )}
      </Row>

      <ul
        ref={railRef}
        className={cn(
          'flex gap-3 overflow-x-auto',
          scrollable && 'snap-x snap-mandatory',
          // Hide the scrollbar on the rail only. The page keeps its own.
          'scrollbar-none',
        )}
      >
        {products.map((product) => (
          <li key={product.id} className="w-20 shrink-0 snap-start">
            <Link href={`/product/${product.slug}`} className="group/look block">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <Image
                  src={product.primaryImage.url}
                  alt={product.primaryImage.alt}
                  fill
                  sizes="80px"
                  quality={PHOTO_QUALITY}
                  className="object-cover"
                />
              </div>
              <Type size="xs" tone="subtle" truncate className="pt-1.5">
                {product.brand}
              </Type>
              <Type size="xs" tone="muted" numeric>
                {formatInr(product.priceInr, { paise: 'never' })}
              </Type>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 text-ink-muted transition-colors hover:text-ink"
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  )
}
