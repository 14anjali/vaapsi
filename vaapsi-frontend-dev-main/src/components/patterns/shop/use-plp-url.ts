'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { FilterDraft } from './filter-controls'
import {
  parsePlpParams,
  serialisePlpState,
  type PlpState,
  type RawSearchParams,
} from '@/lib/plp/search-params'

/**
 * Read and write the listing page's URL state from a client component.
 *
 * Every write resets `page` to 1. Changing a filter while on page 4 and keeping
 * the page number is the bug that makes a shopper narrow their search and land
 * on an empty screen with results sitting above them.
 *
 * Navigation uses `replace` with `scroll: false` for filter changes: a shopper
 * ticking four boxes should not push four entries onto the back stack, and the
 * page should not jump to the top while they are working down the rail. Load-more
 * uses `push` instead, because "back" after loading more should mean "show fewer
 * again", which is what a shopper expects.
 */
export function usePlpUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const state = useMemo<PlpState>(() => {
    const raw: RawSearchParams = {}
    for (const [key, value] of searchParams.entries()) raw[key] = value
    return parsePlpParams(raw)
  }, [searchParams])

  const commit = useCallback(
    (next: PlpState, options: { push?: boolean } = {}) => {
      const href = `${pathname}${serialisePlpState(next)}`
      if (options.push === true) router.push(href, { scroll: false })
      else router.replace(href, { scroll: false })
    },
    [pathname, router],
  )

  /** Apply a filter draft. Always returns to page 1. */
  const applyFilters = useCallback(
    (draft: FilterDraft) => commit({ ...state, ...draft, page: 1 }),
    [commit, state],
  )

  const setSort = useCallback(
    (sort: PlpState['sort']) => commit({ ...state, sort, page: 1 }),
    [commit, state],
  )

  const setState = useCallback((next: PlpState) => commit({ ...next, page: 1 }), [commit])

  const loadMore = useCallback(
    () => commit({ ...state, page: state.page + 1 }, { push: true }),
    [commit, state],
  )

  return { state, applyFilters, setSort, setState, loadMore }
}

/** The filter subset of the current URL state, for seeding a draft. */
export function toDraft(state: PlpState): FilterDraft {
  return {
    brands: state.brands,
    conditions: state.conditions,
    genders: state.genders,
    materials: state.materials,
    types: state.types,
    sizes: state.sizes,
    minRupees: state.minRupees,
    maxRupees: state.maxRupees,
    sizeSystem: state.sizeSystem,
  }
}
