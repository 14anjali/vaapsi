import { EmptyState } from './empty-state'
import { FilterRail } from './filter-rail'
import { FilterSheet } from './filter-sheet'
import { LoadMore } from './load-more'
import { ProductGrid } from './product-grid'
import { SortControl } from './sort-control'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import { getProductFacets, listProducts } from '@/lib/data'
import { PAGE_SIZE, parsePlpParams, toProductFilters, toProductSort } from '@/lib/plp/search-params'
import type { RawSearchParams } from '@/lib/plp/search-params'
import type { ListingType, ProductCategory } from '@/lib/types'

/**
 * The listing page, shared by `/shop` and `/shop/[category]`.
 *
 * A server component. It parses the URL, asks the adapter, and renders — so a
 * filtered listing is server-rendered, shareable and indexable, and the back
 * button is correct for free. The only client components on the page are the
 * controls that need to write to the URL.
 *
 * Pagination is cumulative: `?page=3` renders the first three pages' worth in one
 * grid, which is what "load more" means. Asking for `PAGE_SIZE * page` in a
 * single call keeps that a single request rather than three.
 */
export async function ShopView({
  searchParams,
  category,
  title,
  eyebrow,
  /**
   * Which half of the catalogue this listing shows. Defaults to `new`, because
   * `/shop` *is* the New listing — first-party stock, nothing with a previous
   * owner. The pre-loved marketplace passes `pre_loved` and gets the condition
   * filter with it.
   *
   * Set by the page rather than by a URL parameter: it is not a filter a shopper
   * clears, it is which shop they are in.
   */
  listingType = 'new',
}: {
  searchParams: RawSearchParams
  category?: ProductCategory
  title: string
  eyebrow?: string
  listingType?: ListingType
}) {
  const state = parsePlpParams(searchParams)

  const [page, facets] = await Promise.all([
    listProducts({
      filters: toProductFilters(state, category, listingType),
      sort: toProductSort(state.sort),
      limit: PAGE_SIZE * state.page,
    }),
    // Scoped to this listing, so the New panel is never offered a condition
    // grade nothing in it has, nor a size that only exists second-hand.
    getProductFacets(listingType),
  ])

  const isEmpty = page.items.length === 0

  return (
    <Container>
      <div className="py-6 desktop:py-8">
        <Stack gap={2}>
          {eyebrow !== undefined && <Eyebrow>{eyebrow}</Eyebrow>}
          <Type as="h1" family="display" size="3xl" weight="heading">
            {title}
          </Type>
        </Stack>
      </div>

      {/*
        Toolbar. Count on the left, controls on the right. The count is the
        honest headline number for a one-of-one marketplace — it is not
        "12,000 products", it is how many single garments are here right now.
      */}
      <Row
        gap={4}
        justify="between"
        className="sticky top-14 z-30 border-y border-line bg-background py-3 desktop:top-16"
      >
        <Row gap={3}>
          <Type size="sm" tone="muted" numeric>
            {shop.count(page.total)}
          </Type>
        </Row>
        <Row gap={3} wrap={false}>
          <FilterSheet
            facets={facets}
            category={category}
            listingType={listingType}
            categoryLocked={category !== undefined}
          />
          <SortControl />
        </Row>
      </Row>

      <Grid gap="loose" className="pt-6">
        <Col mobile={4} tablet={8} desktop={3} className="hidden desktop:block">
          <FilterRail
            facets={facets}
            listingType={listingType}
            categoryLocked={category !== undefined}
          />
        </Col>

        <Col mobile={4} tablet={8} desktop={9}>
          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              <ProductGrid products={page.items} />
              <LoadMore shown={page.items.length} total={page.total} />
            </>
          )}
        </Col>
      </Grid>
    </Container>
  )
}
