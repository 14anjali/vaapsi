'use client'

import { usePlpUrl } from './use-plp-url'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import { activeFilters, clearFilter, emptyPlpState } from '@/lib/plp/search-params'
import type { FilterKey } from '@/lib/plp/search-params'

/**
 * Empty result.
 *
 * **It names which filter is too narrow and offers to clear that one.** A
 * generic "no results found, try adjusting your filters" hands the problem back
 * to the shopper without telling them where to start — they have five filters on
 * and no idea which one is the culprit.
 *
 * The culprit is picked as the most specific active filter, in a fixed order of
 * how narrowing each one usually is: a single size cuts the catalogue harder
 * than a condition grade, which cuts harder than a passport toggle. It is a
 * heuristic, not a computation, and it is right often enough to be useful — and
 * "clear everything" is always there beside it for when it is not.
 */

/** Narrowest first. Order is the heuristic. */
const CULPRIT_ORDER: readonly FilterKey[] = ['query', 'sizes', 'brands', 'price', 'conditions']

export function EmptyState() {
  const { state, setState } = usePlpUrl()
  const active = activeFilters(state)
  const culprit = CULPRIT_ORDER.find((key) => active.includes(key)) ?? null

  return (
    <div className="border-t border-line py-section">
      <Stack gap={4} className="max-w-measure-narrow">
        <Type as="p" family="display" size="2xl" weight="heading">
          {shop.empty.title}
        </Type>
        <Type size="base" tone="muted">
          {culprit === null
            ? shop.empty.bodyGeneric
            : shop.empty.bodyWithCulprit(shop.filterLabels[culprit])}
        </Type>

        <Row gap={3} className="mt-2">
          {culprit !== null && (
            <button
              type="button"
              onClick={() => setState(clearFilter(state, culprit))}
              className="ease bg-ink px-5 py-2.5 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
            >
              {shop.empty.clearOne(shop.filterLabels[culprit])}
            </button>
          )}
          {active.length > 1 && (
            <button
              type="button"
              onClick={() => setState({ ...emptyPlpState(), sort: state.sort })}
              className="ease border border-line-strong px-5 py-2.5 text-sm transition-colors duration-fast hover:border-ink"
            >
              {shop.empty.clearAll}
            </button>
          )}
        </Row>
      </Stack>
    </div>
  )
}
