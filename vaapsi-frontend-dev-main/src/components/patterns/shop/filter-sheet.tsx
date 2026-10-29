'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { FilterControls, type FilterDraft } from './filter-controls'
import { toDraft, usePlpUrl } from './use-plp-url'
import { Overlay } from '@/components/primitives/overlay'
import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import type { ProductFacets } from '@/lib/data'
import type { ListingType } from '@/lib/types'
import { activeFilterCount, serialisePlpState } from '@/lib/plp/search-params'
import type { PlpState } from '@/lib/plp/search-params'

/**
 * Mobile filter sheet.
 *
 * Holds a **pending draft** and commits it on "Show N pieces". That is the
 * opposite of the desktop rail, and the difference is not inconsistency: on a
 * phone the sheet covers the grid, so applying immediately means the shopper
 * cannot see what their choice did. Instead the count comes to them, on the
 * button, before they commit.
 *
 * The count is live — it queries `/api/products/count` against the pending draft
 * so the button says what will actually happen. A shopper who narrows to zero
 * finds out here rather than after dismissing the sheet.
 *
 * The trap and dismissal behaviour comes from the shared `Overlay`, so it is
 * identical to the nav drawer and the cart drawer by construction rather than by
 * three copies of the same forty lines agreeing with each other.
 */
export function FilterSheet({
  facets,
  category,
  listingType,
  categoryLocked,
}: {
  facets: ProductFacets
  category?: string
  /** Which half of the catalogue this panel filters. */
  listingType: ListingType
  /** True when the route already fixes the category, so Type is hidden. */
  categoryLocked?: boolean
}) {
  const { state, applyFilters } = usePlpUrl()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FilterDraft>(() => toDraft(state))

  // Re-seed from the URL whenever the sheet opens, so a shopper who dismissed
  // without applying does not find their abandoned draft still sitting there.
  useEffect(() => {
    if (open) setDraft(toDraft(state))
  }, [open, state])

  const pending: PlpState = { ...state, ...draft, page: 1 }
  const search = serialisePlpState(pending)
  const countHref = `/api/products/count${search === '' ? '?' : `${search}&`}${
    category === undefined ? '' : `category=${encodeURIComponent(category)}`
  }`

  const { data, isFetching } = useQuery({
    queryKey: ['product-count', countHref],
    queryFn: async () => {
      const response = await fetch(countHref)
      if (!response.ok) throw new Error('Count request failed')
      return (await response.json()) as { total: number }
    },
    // Only ask while the sheet is open. No point counting for a panel nobody
    // can see.
    enabled: open,
    placeholderData: (previous) => previous,
  })

  const applied = activeFilterCount(state)

  return (
    <>
      {/* Trigger. Mobile and tablet only — desktop has the rail. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ease flex items-center gap-2 border border-line px-4 py-2 text-sm transition-colors duration-fast hover:border-ink desktop:hidden"
      >
        <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
        {shop.filters.open}
        {applied > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] tabular-nums leading-none text-accent-ink">
            {applied}
          </span>
        )}
      </button>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        label={shop.filters.heading}
        side="bottom"
        hideAbove="desktop"
      >
        <Row gap={2} justify="between" className="shrink-0 border-b border-line px-gutter py-4">
          <Type as="h2" size="sm" weight="emphasis">
            {shop.filters.heading}
          </Type>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
          >
            <span className="sr-only">{shop.filters.close}</span>
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </Row>

        <div className="flex-1 overflow-y-auto px-gutter py-6">
          <FilterControls
            facets={facets}
            draft={draft}
            onChange={setDraft}
            listingType={listingType}
            categoryLocked={categoryLocked}
          />
        </div>

        {/* Sticky CTA carrying the live count. */}
        <div className="shrink-0 border-t border-line px-gutter py-4">
          <button
            type="button"
            onClick={() => {
              applyFilters(draft)
              setOpen(false)
            }}
            disabled={data?.total === 0}
            className="ease w-full bg-ink py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {data === undefined && isFetching
              ? shop.filters.applyPending
              : shop.filters.apply(data?.total ?? 0)}
          </button>
        </div>
      </Overlay>
    </>
  )
}
