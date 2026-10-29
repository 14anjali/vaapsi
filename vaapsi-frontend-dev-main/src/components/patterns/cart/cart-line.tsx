'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { cart as copy } from '@/content/cart'
import { conditionCopy } from '@/content/product'
import { PHOTO_QUALITY } from '@/lib/image'
import { formatInr } from '@/lib/format/currency'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { CartLine as CartLineType } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * One line in the bag. Shared by the drawer and the `/cart` route — the same
 * component, so the two surfaces cannot drift.
 *
 * **No quantity stepper, and no space left where one would go.** Every garment
 * is one-of-one, so a line is a garment. Leaving a disabled stepper in place
 * "for later" would be an interface promising something the inventory cannot do.
 *
 * An unavailable line stays visible, marked, excluded from the total, with one
 * action: remove. It does not disappear — a garment vanishing from a bag is far
 * more alarming than one that says it sold, and the shopper needs to know what
 * happened to decide what to do next.
 */
export function CartLine({
  line,
  compact = false,
}: {
  line: CartLineType
  /** Drawer layout. Tighter, smaller image, fewer secondary actions. */
  compact?: boolean
}) {
  const remove = useCartStore((state) => state.remove)
  const addToWishlist = useWishlistStore((state) => state.add)
  const savedForLater = useWishlistStore((state) => state.items.includes(line.product.id))

  const unavailable = line.status !== 'active'
  // Null on new stock. A cart can hold both kinds.
  const condition = line.product.condition === null ? null : conditionCopy[line.product.condition]

  return (
    <li className="border-b border-line py-5 first:pt-0">
      <Row gap={4} align="start" wrap={false}>
        <Link
          href={`/product/${line.product.slug}`}
          className={cn(
            'relative shrink-0 overflow-hidden bg-surface',
            compact ? 'h-24 w-[4.5rem]' : 'tablet:w-30 h-32 w-24 tablet:h-40',
          )}
        >
          <Image
            src={line.product.primaryImage.url}
            alt={line.product.primaryImage.alt}
            fill
            sizes={compact ? '72px' : '120px'}
            quality={PHOTO_QUALITY}
            className={cn('object-cover', unavailable && 'opacity-60 saturate-0')}
          />
        </Link>

        <Stack gap={1} className="min-w-0 flex-1">
          <Row gap={3} justify="between" align="start" wrap={false}>
            <Stack gap={1} className="min-w-0">
              <Type size="sm" weight="emphasis" truncate>
                {line.product.brand}
              </Type>
              <Link href={`/product/${line.product.slug}`} className="min-w-0">
                <Type size="sm" tone="muted" truncate>
                  {line.product.title}
                </Type>
              </Link>
            </Stack>

            {/*
              The price is struck through on an unavailable line rather than
              removed, so the shopper can see what they nearly had. It is
              already excluded from the total.
            */}
            <Type
              as="span"
              size="sm"
              numeric
              className="shrink-0"
              tone={unavailable ? 'subtle' : 'default'}
            >
              {unavailable ? (
                <s>{formatInr(line.product.priceInr, { paise: 'never' })}</s>
              ) : (
                formatInr(line.product.priceInr, { paise: 'never' })
              )}
            </Type>
          </Row>

          <Row gap={2} align="baseline" className="pt-0.5 text-ink-subtle">
            <Type as="span" size="xs" tone="inherit">
              {line.product.size.label}
            </Type>
            <span aria-hidden>·</span>
            <Type as="span" size="xs" tone="inherit">
              {line.product.color.name}
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

          {unavailable && (
            <Stack gap={0} className="pt-2">
              <Type size="xs" weight="emphasis">
                {line.status === 'sold_out' ? copy.line.soldOut : copy.line.reserved}
              </Type>
              <Type size="xs" tone="subtle">
                {line.status === 'sold_out' ? copy.line.soldOutHelp : copy.line.reservedHelp}
              </Type>
            </Stack>
          )}

          <Row gap={4} className="pt-3">
            <button
              type="button"
              onClick={() => remove(line.product.id)}
              aria-label={copy.line.removeLabel(line.product.title)}
              className="text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
            >
              {copy.line.remove}
            </button>

            {/*
              "Save for later" instead of only "remove". A shopper hesitating
              over a one-of-one garment should not have to choose between buying
              it now and losing track of it — we cannot hold it, but we can
              remember that they wanted it.
            */}
            {!unavailable && !compact && (
              <button
                type="button"
                disabled={savedForLater}
                onClick={() => {
                  addToWishlist(line.product.id)
                  remove(line.product.id)
                }}
                className="text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink disabled:no-underline disabled:opacity-60"
              >
                {savedForLater ? copy.line.movedToWishlist : copy.line.moveToWishlist}
              </button>
            )}
          </Row>
        </Stack>
      </Row>
    </li>
  )
}
