import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/data'
import { parsePlpParams, toProductFilters, toProductSort } from '@/lib/plp/search-params'
import type { RawSearchParams } from '@/lib/plp/search-params'
import type { ProductCategory } from '@/lib/types'

/**
 * How many garments match a set of filters.
 *
 * Exists for one reason: the mobile filter sheet has to show "Show 14 pieces"
 * *before* the shopper applies anything, and that count cannot be
 * server-rendered because nothing has navigated yet.
 *
 * It reads through the same adapter as every page, so it is not a second source
 * of truth — swapping `lib/data` for real endpoints changes this route with
 * everything else. If the backend team would rather answer this from their own
 * API, this file is the only thing that needs deleting.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const raw: RawSearchParams = Object.fromEntries(url.searchParams.entries())
  const state = parsePlpParams(raw)

  const category = url.searchParams.get('category')
  const page = await listProducts({
    filters: toProductFilters(state, (category ?? undefined) as ProductCategory | undefined),
    sort: toProductSort(state.sort),
    limit: 1,
  })

  return NextResponse.json(
    { total: page.total },
    // The count is cheap and changes constantly. Never cached.
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
