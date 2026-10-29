import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { productPage } from '@/content/product'
import { PHOTO_QUALITY } from '@/lib/image'
import { formatInr } from '@/lib/format/currency'
import { conditionCopy } from '@/content/product'
import type { Paise, ProductSummary } from '@/lib/types'

/**
 * "Also available pre-loved" — the same kind of garment, second-hand, cheaper.
 *
 * ## A cross-sell that runs downward
 *
 * Every other recommendation on a storefront moves a shopper up in price. This
 * one moves them down, on purpose. A shopper looking at a new jean who can have
 * a barely-worn one for a third less is a shopper who buys, and a garment kept
 * in circulation is the whole business — so the cheaper route is the one worth
 * surfacing. It also does the job of introducing the resale side to someone who
 * arrived through the front door and has never opened /pre-loved.
 *
 * ## The saving is the content
 *
 * Each tile leads with what you save, not with the price. "₹1,400 less" is the
 * reason to look; "₹2,650" on its own is just another number next to the one
 * already on the page. The adapter guarantees every item here is strictly
 * cheaper than the garment being viewed, so the figure is never negative and
 * never zero.
 *
 * Condition is shown on every tile. These are second-hand pieces being offered
 * as substitutes for something new, so the grade is the first question a shopper
 * has and hiding it to make the row look cleaner would be the wrong kind of
 * clean.
 *
 * ## It disappears when it has nothing to say
 *
 * No alternatives, no section — not an empty state. A row headed "also available
 * pre-loved" with nothing under it advertises an absence.
 */
export function PreLovedAlternatives({
  products,
  /** The price being compared against, so each tile can state its saving. */
  comparedToInr,
}: {
  products: readonly ProductSummary[]
  comparedToInr: Paise
}) {
  if (products.length === 0) return null

  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Eyebrow as="h2">{productPage.preLoved.eyebrow}</Eyebrow>
        <Type size="sm" tone="muted">
          {productPage.preLoved.lede}
        </Type>
      </Stack>

      <ul className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((product) => {
          const saving = comparedToInr - product.priceInr
          const condition = product.condition === null ? null : conditionCopy[product.condition]

          return (
            <li key={product.id}>
              <Link
                href={`/product/${product.slug}`}
                className="group/alt block focus-visible:outline-offset-4"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  <Image
                    src={product.primaryImage.url}
                    alt={product.primaryImage.alt}
                    fill
                    sizes="(min-width: 1024px) 14vw, 40vw"
                    quality={PHOTO_QUALITY}
                    className="ease object-cover transition-transform duration-slow group-hover/alt:scale-[1.03]"
                  />
                </div>

                <Stack gap={0} className="pt-2">
                  {/* The saving leads. See the note above. */}
                  {saving > 0 && (
                    <Type as="span" size="sm" weight="emphasis" tone="accent" numeric>
                      {productPage.preLoved.saving(formatInr(saving))}
                    </Type>
                  )}
                  <Type as="span" size="xs" tone="muted" truncate>
                    {product.title}
                  </Type>
                  <Row gap={2} align="baseline" className="text-ink-subtle">
                    <Type as="span" size="xs" tone="inherit" numeric>
                      {formatInr(product.priceInr)}
                    </Type>
                    {condition !== null && (
                      <>
                        <span aria-hidden>·</span>
                        <Type as="span" size="xs" tone="inherit">
                          {condition.label}
                        </Type>
                      </>
                    )}
                  </Row>
                </Stack>
              </Link>
            </li>
          )
        })}
      </ul>

      {/*
        The way out to the whole resale side, for someone who came in through
        the front door and has never opened it.
      */}
      <Link
        href="/pre-loved"
        className="ease inline-flex items-center gap-1.5 self-start text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-ink"
      >
        {productPage.preLoved.browseAll}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </Link>
    </Stack>
  )
}
