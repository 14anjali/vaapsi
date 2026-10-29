import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { productPage } from '@/content/product'
import { discountPercent, formatInr } from '@/lib/format/currency'
import type { Availability, Paise } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Price, with original retail struck through when we know it.
 *
 * Three rules, all of them about not overclaiming:
 *
 * 1. No original retail, no strike-through and no percentage. A discount we
 *    cannot substantiate is a lie, and one caught lie costs more than every
 *    "70% off" badge earns.
 * 2. Sold replaces the price entirely. A struck-through price on a sold garment
 *    invites someone to ask whether they can still have it.
 * 3. The percentage is floored, never rounded up. 66.7% is 66% off.
 */

export type PriceProps = {
  priceInr: Paise
  originalRetailInr: Paise | null
  availability: Availability
  size?: 'default' | 'large'
  /** Show the saving as a percentage. Off on cards, on the PDP. */
  showSaving?: boolean
  className?: string
}

export function Price({
  priceInr,
  originalRetailInr,
  availability,
  size = 'default',
  showSaving = false,
  className,
}: PriceProps) {
  if (availability === 'sold') {
    return (
      <Type as="p" size={size === 'large' ? 'xl' : 'base'} tone="subtle" className={className}>
        {productPage.availability.sold}
      </Type>
    )
  }

  const saving = discountPercent(priceInr, originalRetailInr)

  return (
    <Row gap={2} align="baseline" className={cn('min-w-0', className)}>
      <Type as="span" size={size === 'large' ? 'xl' : 'base'} numeric>
        {formatInr(priceInr, { paise: 'never' })}
      </Type>

      {originalRetailInr !== null && (
        <Type as="span" size={size === 'large' ? 'base' : 'sm'} tone="subtle" numeric>
          <s className="decoration-line-strong">
            {formatInr(originalRetailInr, { paise: 'never' })}
          </s>
        </Type>
      )}

      {showSaving && saving !== null && (
        <Type as="span" size="sm" tone="muted" numeric>
          {saving}% less
        </Type>
      )}
    </Row>
  )
}
