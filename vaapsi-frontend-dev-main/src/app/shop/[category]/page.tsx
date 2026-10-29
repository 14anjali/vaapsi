import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductGridSkeleton } from '@/components/patterns/shop/product-grid'
import { ShopView } from '@/components/patterns/shop/shop-view'
import { Container } from '@/components/primitives/layout'
import { getProductFacets } from '@/lib/data'
import type { RawSearchParams } from '@/lib/plp/search-params'
import { GENDERS } from '@/lib/types'
import type { Gender, ProductCategory } from '@/lib/types'

type Params = { category: string }

/**
 * The listing under `/shop/[segment]`, where a segment is either a **gender** or
 * a **garment type**.
 *
 * `/shop/women` and `/shop/men` used to 404 despite sitting in the primary nav,
 * because gender was a segment the contract had no field for. `Product.gender`
 * now exists, so this route resolves both kinds of segment: gender first, then
 * category. A `unisex` garment appears under both women and men, which is what
 * unisex means and the reason it is not offered as a third department.
 *
 * A type segment is still validated against the live facets rather than a
 * hardcoded list, so a type with no stock 404s instead of rendering an empty
 * grid that looks like a bug.
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: toTitle(params.category) }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: RawSearchParams
}) {
  const segment = params.category
  const gender = (GENDERS as readonly string[]).includes(segment) ? (segment as Gender) : null

  // New stock only — `/shop` and everything under it is the New listing.
  const facets = await getProductFacets('new')
  const isType = facets.categories.some((facet) => facet.value === segment)

  if (gender === null && !isType) notFound()

  return (
    <Suspense
      key={`${segment}:${JSON.stringify(searchParams)}`}
      fallback={
        <Container>
          <div className="pt-24">
            <ProductGridSkeleton />
          </div>
        </Container>
      }
    >
      <ShopView
        searchParams={
          // A gender segment seeds the gender filter rather than being a
          // separate concept: /shop/women and /shop?for=women are the same
          // listing, so they resolve through one code path and the panel shows
          // the segment as an applied filter a shopper can widen.
          gender === null ? searchParams : { ...searchParams, for: gender }
        }
        category={gender === null ? (segment as ProductCategory) : undefined}
        eyebrow="Shop"
        title={toTitle(segment)}
      />
    </Suspense>
  )
}

function toTitle(segment: string): string {
  return segment
    .split('-')
    .map((word) => (word.length === 0 ? word : `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`))
    .join(' ')
}
