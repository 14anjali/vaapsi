import { axe, toHaveNoViolations } from 'jest-axe'
import { act, screen } from '@testing-library/react'
import { renderWithProviders as render } from '@/test-utils'
import { CartDrawer } from '../cart/cart-drawer'
import { CartView } from '../cart/cart-view'
import { ConditionScale } from '../home/condition-scale'
import { HeroTiles } from '../home/hero-tiles'
import { HowItWorks } from '../home/how-it-works'
import { MobileNav } from '../mobile-nav'
import { PassportStory } from '../passport/story'
import { ProvenanceLegend } from '../passport/provenance-dot'
import { ProductCard } from '../product-card'
import { ConditionBlock } from '../product/condition-block'
import { SizeAndMeasurements } from '../product/measurements'
import { PincodeCheck } from '../product/pincode-check'
import { ProductGrid, ProductGridSkeleton } from '../shop/product-grid'
import { SiteFooter } from '../site-footer'
import { SiteHeader } from '../site-header'
import { passports } from '@/lib/data/fixtures/passports'
import { products } from '@/lib/data/fixtures/products'
import { useCartStore } from '@/lib/store/cart'
import { useUiStore } from '@/lib/store/ui'
import type { ProductSummary } from '@/lib/types'

expect.extend(toHaveNoViolations)

// `useRouter` is here because the header's profile menu can now sign out, which
// navigates. `useSearchParams` is not needed: the auth forms that read it are
// not part of any composed surface swept here.
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
}))

/**
 * Automated accessibility sweep.
 *
 * axe over every composed surface in the app. It does not replace the manual
 * keyboard and screen-reader passes — axe cannot tell you that a focus order is
 * illogical or that a label is technically present but useless — but it catches
 * the whole class of mistakes that are easy to make and invisible in review:
 * unlabelled controls, broken heading order, missing landmark structure, list
 * markup that is not a list.
 *
 * Every surface is rendered inside a `<main>` where the real page would have
 * one, so landmark rules resolve the way they do in the app rather than
 * flagging a false positive about content outside a region.
 */

beforeEach(() => {
  useCartStore.setState({ items: [], hydrated: true })
  useUiStore.setState({ mobileNavOpen: false, cartOpen: false })

  global.fetch = jest.fn(
    async () =>
      ({
        ok: true,
        json: async () => ({
          id: 'c',
          lines: [],
          totals: { subtotalInr: 0, shippingInr: null, taxInr: null, discountInr: 0, totalInr: 0 },
          currency: 'INR',
          updatedAt: '2026-08-20T00:00:00.000Z',
        }),
      }) as unknown as Response,
  ) as unknown as typeof fetch
})

const product = products[0]!
const withoutPassport = products.find((p) => p.passportId === null)!
const sold = products.find((p) => p.availability === 'sold')!
const passport = passports[0]!
const nicobar = passports.find((p) => p.impact === undefined)!

function summary(source: typeof product): ProductSummary {
  const primary = source.images.find((image) => image.kind === 'primary') ?? source.images[0]!
  return {
    id: source.id,
    slug: source.slug,
    title: source.title,
    brand: source.brand,
    category: source.category,
    subcategory: source.subcategory,
    listingType: source.listingType,
    gender: source.gender,
    condition: source.condition,
    color: source.color,
    composition: source.composition,
    colorVariants: source.colorVariants,
    size: source.size,
    priceInr: source.priceInr,
    originalRetailInr: source.originalRetailInr,
    currency: source.currency,
    availability: source.availability,
    passportId: source.passportId,
    primaryImage: primary,
  }
}

/** Render inside a main landmark, as the real shell does. */
async function auditInMain(ui: React.ReactElement) {
  const { container } = render(<main>{ui}</main>)
  expect(await axe(container)).toHaveNoViolations()
}

// ---------------------------------------------------------------------------

describe('axe — shell', () => {
  it('header', async () => {
    const { container } = render(<SiteHeader />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('footer', async () => {
    const { container } = render(<SiteFooter />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('mobile nav, closed and open', async () => {
    const { container } = render(<MobileNav />)
    expect(await axe(container)).toHaveNoViolations()

    act(() => useUiStore.getState().openMobileNav())
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('axe — home', () => {
  it('hero tiles', async () => {
    await auditInMain(<HeroTiles />)
  })

  it('how it works', async () => {
    await auditInMain(<HowItWorks />)
  })

  it('condition scale', async () => {
    await auditInMain(<ConditionScale />)
  })
})

describe('axe — listing', () => {
  it('product grid', async () => {
    await auditInMain(<ProductGrid products={products.map(summary)} />)
  })

  it('loading skeletons', async () => {
    await auditInMain(<ProductGridSkeleton />)
  })

  it('card in all three states', async () => {
    await auditInMain(
      <ul>
        <ProductCard as="li" product={summary(product)} />
        <ProductCard as="li" product={summary(withoutPassport)} />
        <ProductCard as="li" product={summary(sold)} />
      </ul>,
    )
  })
})

describe('axe — product', () => {
  it('condition and flaw disclosure', async () => {
    await auditInMain(<ConditionBlock product={products.find((p) => p.flaws.length > 0)!} />)
  })

  it('size and measurements', async () => {
    await auditInMain(
      <SizeAndMeasurements size={product.size} measurements={product.measurements} />,
    )
  })

  it('PIN-code check', async () => {
    await auditInMain(<PincodeCheck />)
  })
})

describe('axe — passport', () => {
  it('front, with full data', async () => {
    await auditInMain(<PassportStory passport={passport} />)
  })

  it('front, with partial data and no impact block', async () => {
    await auditInMain(<PassportStory passport={nicobar} />)
  })

  it('provenance legend', async () => {
    // The dots encode meaning visually, so each needs a text equivalent. This is
    // the check that keeps them from becoming a purely visual code.
    await auditInMain(<ProvenanceLegend />)
  })
})

describe('axe — cart', () => {
  it('empty bag', async () => {
    const { container } = render(<CartView />)
    await screen.findByText(/your bag is empty/i)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('drawer, closed and open', async () => {
    const { container } = render(<CartDrawer />)
    expect(await axe(container)).toHaveNoViolations()

    act(() => useUiStore.getState().openCart())
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
