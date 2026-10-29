'use client'

import { FilterControls, type FilterDraft } from './filter-controls'
import { toDraft, usePlpUrl } from './use-plp-url'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import type { ProductFacets } from '@/lib/data'
import type { ListingType } from '@/lib/types'
import { activeFilterCount, emptyPlpState } from '@/lib/plp/search-params'

/**
 * Desktop filter rail.
 *
 * Sticky, and **it does not scroll independently of the page unless it
 * overflows** — `max-h` with `overflow-y-auto` only kicks in when the rail is
 * taller than the viewport. A rail with its own permanent scrollbar puts two
 * scroll contexts side by side and a shopper ends up scrolling the wrong one.
 *
 * Changes commit immediately. On desktop the grid is right there, so applying a
 * filter and watching the result narrow is the fastest possible feedback; a
 * pending draft with an Apply button would be strictly worse. Mobile is the
 * opposite case, which is why the sheet works differently.
 */
export function FilterRail({
  facets,
  listingType,
  categoryLocked,
}: {
  facets: ProductFacets
  /** Which half of the catalogue this panel filters. */
  listingType: ListingType
  /** True when the route already fixes the category, so Type is hidden. */
  categoryLocked?: boolean
}) {
  const { state, applyFilters, setState } = usePlpUrl()
  const applied = activeFilterCount(state)

  const onChange = (next: FilterDraft) => applyFilters(next)

  return (
    <aside
      aria-label={shop.filters.heading}
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8"
    >
      <Row gap={2} justify="between" className="mb-6 border-b border-line pb-3">
        <Type as="h2" size="sm" weight="emphasis">
          {shop.filters.heading}
        </Type>
        {applied > 0 && (
          <button
            type="button"
            onClick={() => setState({ ...emptyPlpState(), sort: state.sort })}
            className="text-xs text-ink-subtle transition-colors hover:text-ink"
          >
            {shop.filters.clearAll}
          </button>
        )}
      </Row>

      <Stack gap={8}>
        <FilterControls
          facets={facets}
          draft={toDraft(state)}
          onChange={onChange}
          listingType={listingType}
          categoryLocked={categoryLocked}
        />
      </Stack>
    </aside>
  )
}
