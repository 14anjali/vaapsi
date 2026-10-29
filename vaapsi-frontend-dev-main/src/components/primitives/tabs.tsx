'use client'

import { useId, useRef, useState } from 'react'
import { Type } from './type'
import { cn } from '@/lib/utils'

/**
 * A tab set.
 *
 * Hand-rolled rather than pulled from a dependency because the whole thing is
 * ninety lines and the interaction contract is fixed by the ARIA pattern — there
 * is no design latitude to buy.
 *
 * What the pattern requires, and what most hand-rolled tab sets get wrong:
 *
 * - `role="tablist"` / `role="tab"` / `role="tabpanel"`, wired with
 *   `aria-controls` and `aria-labelledby` in both directions.
 * - **Arrow keys move between tabs**, Home and End jump to the ends. Tab moves
 *   *out* of the tablist into the panel — so only the selected tab is in the tab
 *   order (`tabIndex={-1}` on the rest). Without that, a keyboard user has to
 *   press Tab four times to get past a four-tab set.
 * - Selection follows focus, which is correct for panels this cheap to render.
 *
 * Panels are **unmounted when inactive**. That is the opposite of the choice made
 * for the passport's old two-sided flip, and deliberately so: these panels live
 * inside a drawer that is itself behind a click, so nothing here needs to be
 * indexable or printable. Keeping four panels mounted would put three screens of
 * hidden content into the DOM on every product page.
 */

export type TabItem = {
  id: string
  label: string
  /** A count or short qualifier beside the label — "2", "None". */
  hint?: string
  panel: React.ReactNode
}

export function Tabs({
  items,
  initialId,
  className,
}: {
  items: readonly TabItem[]
  initialId?: string
  className?: string
}) {
  const base = useId()
  const first = items[0]
  const [active, setActive] = useState(initialId ?? first?.id ?? '')
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  if (items.length === 0) return null

  const activeIndex = Math.max(
    items.findIndex((item) => item.id === active),
    0,
  )

  const focusTab = (index: number) => {
    const wrapped = (index + items.length) % items.length
    const item = items[wrapped]
    if (item === undefined) return
    setActive(item.id)
    tabRefs.current[item.id]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusTab(activeIndex + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusTab(activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(items.length - 1)
        break
      default:
    }
  }

  const activeItem = items[activeIndex]

  return (
    <div className={className}>
      {/*
        Scrolls horizontally rather than wrapping. Four tabs fit on a phone at
        this size, but a fifth should push the set sideways rather than reflow
        the header to two lines and move everything below it.
      */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="-mb-px flex gap-6 overflow-x-auto border-b border-line"
      >
        {items.map((item) => {
          const selected = item.id === activeItem?.id
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={cn(
                'ease -mb-px flex shrink-0 items-baseline gap-2 whitespace-nowrap border-b-2 pb-3 pt-1 transition-colors duration-fast',
                selected
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink-subtle hover:text-ink-muted',
              )}
            >
              <Type as="span" size="sm" tone="inherit" weight={selected ? 'emphasis' : 'regular'}>
                {item.label}
              </Type>
              {item.hint !== undefined && (
                <Type as="span" size="xs" tone="subtle" numeric>
                  {item.hint}
                </Type>
              )}
            </button>
          )
        })}
      </div>

      {activeItem !== undefined && (
        <div
          role="tabpanel"
          id={`${base}-panel-${activeItem.id}`}
          aria-labelledby={`${base}-tab-${activeItem.id}`}
          // Focusable so a keyboard user can Tab from the tablist into the panel
          // even when its first child is not interactive.
          tabIndex={0}
          className="pt-7 focus:outline-none"
        >
          {activeItem.panel}
        </div>
      )}
    </div>
  )
}
