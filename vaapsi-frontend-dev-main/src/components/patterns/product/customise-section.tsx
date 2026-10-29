'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { customise } from '@/content/customise'
import { cn } from '@/lib/utils'

/**
 * The disclosure around the customiser.
 *
 * A trigger rather than the configurator itself, for one reason: the buy column
 * is where a shopper decides, and five expanded option cards directly under the
 * price competes with the price. Collapsed, it is one line that says what is
 * possible; open, it is the whole thing in place, with no overlay and no
 * navigation — so a shopper never loses sight of the garment they are modifying.
 *
 * Not an `Overlay`, deliberately. The drawer pattern is right for reference
 * material you read and dismiss (specification, the passport). This is a
 * decision that changes the price and the delivery date, and it belongs in the
 * page next to both.
 *
 * The children are rendered only while open, so the configurator's state resets
 * on close. That is the honest behaviour here: leaving a half-built
 * customisation in memory behind a collapsed summary is how someone ends up
 * ordering an addition they thought they had abandoned.
 */
export function CustomiseSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="ease group/customise flex w-full items-center justify-between gap-3 text-left transition-colors duration-fast"
      >
        <span>
          <Type as="span" size="sm" weight="emphasis">
            {customise.trigger}
          </Type>
          <Type as="span" size="xs" tone="subtle" className="mt-0.5 block">
            {customise.triggerNote}
          </Type>
        </span>
        <ChevronDown
          className={cn(
            'ease h-4 w-4 shrink-0 text-ink-muted transition-transform duration-base',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open && <div className="pt-5">{children}</div>}
    </div>
  )
}
