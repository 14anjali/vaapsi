import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductGridSkeleton } from '@/components/patterns/shop/product-grid'
import { ShopView } from '@/components/patterns/shop/shop-view'
import { Container } from '@/components/primitives/layout'
import { shop } from '@/content/shop'
import type { RawSearchParams } from '@/lib/plp/search-params'

export const metadata: Metadata = { title: 'Shop' }

export default function ShopPage({ searchParams }: { searchParams: RawSearchParams }) {
  return (
    <Suspense
      key={JSON.stringify(searchParams)}
      fallback={
        <Container>
          <div className="pt-24">
            <ProductGridSkeleton />
          </div>
        </Container>
      }
    >
      <ShopView searchParams={searchParams} title={shop.title} />
    </Suspense>
  )
}
