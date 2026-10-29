import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders as render } from '@/test-utils'
import { CartDrawer } from '../cart/cart-drawer'
import { CartLine } from '../cart/cart-line'
import { CartSummary } from '../cart/cart-summary'
import { CartView } from '../cart/cart-view'
import { cart as copy } from '@/content/cart'
import { resolveCart } from '@/lib/data'
import { useCartStore } from '@/lib/store/cart'
import { useUiStore } from '@/lib/store/ui'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { Cart, CartLine as CartLineType } from '@/lib/types'

// Mutable, so a test can simulate navigating away. Defaults to '/cart' for
// every other test in this file.
let pathname = '/cart'
jest.mock('next/navigation', () => ({ usePathname: () => pathname }))

/**
 * The cart route handler is exercised here by pointing `fetch` straight at the
 * adapter. That keeps these tests about cart *behaviour* — how an unavailable
 * line is treated, whether checkout blocks — rather than about HTTP.
 */
beforeEach(() => {
  useCartStore.setState({ items: [], hydrated: true })
  useWishlistStore.setState({ items: [] })
  useUiStore.setState({ cartOpen: false })

  global.fetch = jest.fn(async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as {
      items: { productId: string; addedAt: string }[]
    }
    const cart = await resolveCart(body.items)
    return { ok: true, json: async () => cart } as Response
  }) as unknown as typeof fetch
})

const AVAILABLE = 'prd_levis_501_indigo'
const SOLD = 'prd_diesel_denim_shoulder_bag'
const RESERVED = 'prd_acne_denim_maxi_skirt'

function seed(...productIds: string[]) {
  useCartStore.setState({
    items: productIds.map((productId, index) => ({
      productId,
      addedAt: new Date(Date.UTC(2026, 7, 20 - index)).toISOString(),
    })),
    hydrated: true,
  })
}

// ---------------------------------------------------------------------------

describe('cart store', () => {
  it('stores an id, a timestamp and the chosen variant — and nothing else', () => {
    act(() => useCartStore.getState().add(AVAILABLE))
    const item = useCartStore.getState().items[0]
    // The variant is a *choice*, which cannot be re-derived server-side. Price,
    // availability, title and image are all resolved fresh on every read, and a
    // cart that remembered any of them would show a stale one.
    expect(Object.keys(item ?? {}).sort()).toEqual([
      'addedAt',
      'colorSlug',
      'productId',
      'sizeNormalized',
    ])
    for (const forbidden of ['priceInr', 'availability', 'title', 'primaryImage', 'quantity']) {
      expect(item).not.toHaveProperty(forbidden)
    }
  })

  it('is idempotent, because there is only one of each garment', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE)
      useCartStore.getState().add(AVAILABLE)
      useCartStore.getState().add(AVAILABLE)
    })
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('treats two colourways of one style as two lines', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'light-wash', sizeNormalized: 'w30' })
    })
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('is still idempotent per colour and size', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
    })
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('separates the same colour in two sizes', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w32' })
    })
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('removes one variant without touching the other', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'light-wash', sizeNormalized: 'w30' })
      useCartStore.getState().remove(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
    })
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0]?.colorSlug).toBe('light-wash')
  })

  it('removes every line for a product when no variant is named', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'raw-indigo', sizeNormalized: 'w30' })
      useCartStore.getState().add(AVAILABLE, { colorSlug: 'light-wash', sizeNormalized: 'w30' })
      useCartStore.getState().remove(AVAILABLE)
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('has no quantity anywhere', () => {
    act(() => useCartStore.getState().add(AVAILABLE))
    expect(useCartStore.getState().items[0]).not.toHaveProperty('quantity')
  })

  it('removes by product id', () => {
    act(() => {
      useCartStore.getState().add(AVAILABLE)
      useCartStore.getState().remove(AVAILABLE)
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------

describe('CartView', () => {
  it('names what to do next when the bag is empty', async () => {
    render(<CartView />)
    expect(await screen.findByText(copy.empty.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: copy.empty.action })).toHaveAttribute(
      'href',
      '/shop?sort=newest',
    )
  })

  it('renders a resolved line with its price', async () => {
    seed(AVAILABLE)
    render(<CartView />)
    expect(await screen.findByText('Ravi Straight Jean')).toBeInTheDocument()
    expect(screen.getAllByText('₹2,650').length).toBeGreaterThan(0)
  })

  it('never shows a quantity stepper, not even a disabled one', async () => {
    seed(AVAILABLE)
    const { container } = render(<CartView />)
    await screen.findByText('Ravi Straight Jean')
    expect(container.querySelector('input[type="number"]')).toBeNull()
    expect(screen.queryByRole('button', { name: /increase|decrease|\+|−/ })).toBeNull()
  })

  it('keeps a sold line visible, marked, and out of the total', async () => {
    seed(AVAILABLE, SOLD)
    render(<CartView />)
    expect(await screen.findByText(copy.line.soldOut)).toBeInTheDocument()
    // Still there, still named.
    expect(screen.getByText('Jhelum Shoulder Bag')).toBeInTheDocument()
    // The total is the available garment only.
    expect(screen.getByText(copy.summary.excludedNote(1))).toBeInTheDocument()
  })

  it('blocks checkout with the reason on the button, not in a toast', async () => {
    seed(AVAILABLE, SOLD)
    render(<CartView />)
    const blocked = await screen.findByRole('button', {
      name: copy.checkout.blockedUnavailable,
    })
    expect(blocked).toBeDisabled()
    expect(screen.queryByRole('link', { name: copy.checkout.action })).toBeNull()
  })

  it('allows checkout once every line is available', async () => {
    seed(AVAILABLE)
    render(<CartView />)
    const link = await screen.findByRole('link', { name: copy.checkout.action })
    expect(link).toHaveAttribute('href', '/checkout')
  })

  it('treats a reserved line as unavailable too', async () => {
    seed(RESERVED)
    render(<CartView />)
    expect(await screen.findByText(copy.line.reserved)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: copy.checkout.blockedUnavailable }),
    ).toBeInTheDocument()
  })

  it('removes a line and updates the persisted store', async () => {
    const user = userEvent.setup()
    seed(AVAILABLE)
    render(<CartView />)
    await screen.findByText('Ravi Straight Jean')

    await user.click(
      screen.getByRole('button', {
        name: copy.line.removeLabel('Ravi Straight Jean'),
      }),
    )
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('moves a line to the wishlist instead of only offering removal', async () => {
    const user = userEvent.setup()
    seed(AVAILABLE)
    render(<CartView />)
    await screen.findByText('Ravi Straight Jean')

    await user.click(screen.getByRole('button', { name: copy.line.moveToWishlist }))
    expect(useWishlistStore.getState().items).toContain(AVAILABLE)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('shows no urgency device — no countdown, no viewer count', async () => {
    seed(AVAILABLE, SOLD)
    const { container } = render(<CartView />)
    await screen.findByText(copy.line.soldOut)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/\d+\s*(minutes?|seconds?|hours?) left/i)
    expect(text).not.toMatch(/people are (viewing|looking)/i)
    expect(text).not.toMatch(/hurry|only .* left|selling fast/i)
  })
})

// ---------------------------------------------------------------------------

describe('CartDrawer', () => {
  afterEach(() => {
    pathname = '/cart'
  })

  it('closes itself when the shopper navigates away', async () => {
    seed(AVAILABLE)
    act(() => useUiStore.getState().openCart())
    const { rerender } = render(<CartDrawer />)
    await screen.findByText('Ravi Straight Jean')
    expect(useUiStore.getState().cartOpen).toBe(true)

    // Every link in the drawer leaves the page — Checkout, "view the full bag",
    // a line's product link — and a panel left open over the destination hides
    // the thing the shopper just asked for.
    pathname = '/checkout'
    rerender(<CartDrawer />)

    expect(useUiStore.getState().cartOpen).toBe(false)
  })

  it('is unfocusable while closed', () => {
    render(<CartDrawer />)
    // The panel is portalled to `document.body` so its z-index is compared
    // against the header rather than against whatever page element opened it —
    // so it is not in the render container.
    const panel = document.body.querySelector('[aria-hidden="true"]')
    expect(panel).not.toBeNull()
    expect(panel?.className).toContain('invisible')
  })

  it('opens, traps focus, and closes on Escape', async () => {
    const user = userEvent.setup()
    seed(AVAILABLE)
    render(<CartDrawer />)

    act(() => useUiStore.getState().openCart())
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))

    await user.keyboard('{Escape}')
    expect(useUiStore.getState().cartOpen).toBe(false)
  })

  it('revalidates when it opens, because a garment can sell while it waits', async () => {
    seed(AVAILABLE)
    render(<CartDrawer />)

    // Let the initial resolve settle first. An invalidation issued while a
    // request is already in flight is deduped, which is correct behaviour and
    // would make this assertion meaningless.
    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBe(1))

    act(() => useUiStore.getState().openCart())
    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(1))
  })
})

// ---------------------------------------------------------------------------

describe('CartSummary', () => {
  const line = (status: CartLineType['status']): CartLineType => ({
    id: 'crl_x',
    // Pre-loved fixture: one physical garment, so nothing was chosen.
    selection: null,
    product: {
      id: 'p',
      slug: 's',
      title: 'T',
      brand: 'B',
      category: 'knitwear',
      subcategory: 'Crewneck',
      listingType: 'pre_loved',
      gender: 'unisex',
      condition: 'good',
      color: { slug: 'navy', name: 'Navy', hex: '#25314f' },
      colorVariants: [],
      composition: '100% merino wool',
      size: { label: 'M', system: 'IN', normalized: 'm' },
      priceInr: 100_000,
      originalRetailInr: null,
      currency: 'INR',
      availability: status === 'active' ? 'available' : 'sold',
      passportId: null,
      primaryImage: {
        id: 'i',
        url: 'https://x/y.jpg',
        alt: 'a',
        kind: 'primary',
        aspectRatio: 0.75,
      },
    },
    priceAtAddInr: 100_000,
    addedAt: '2026-08-20T00:00:00.000Z',
    status,
  })

  const build = (lines: CartLineType[]): Cart => ({
    id: 'c',
    lines,
    totals: {
      subtotalInr: lines.filter((l) => l.status === 'active').length * 100_000,
      shippingInr: null,
      taxInr: null,
      discountInr: 0,
      totalInr: lines.filter((l) => l.status === 'active').length * 100_000,
    },
    currency: 'INR',
    updatedAt: '2026-08-20T00:00:00.000Z',
  })

  it('says delivery is calculated later rather than inventing a figure', () => {
    render(<CartSummary cart={build([line('active')])} unavailable={[]} canCheckout />)
    expect(screen.getByText(copy.summary.deliveryUnknown)).toBeInTheDocument()
  })

  it('formats money with lakh grouping', () => {
    const cart = build([line('active')])
    const big = {
      ...cart,
      totals: { ...cart.totals, subtotalInr: 12_000_000, totalInr: 12_000_000 },
    }
    render(<CartSummary cart={big} unavailable={[]} canCheckout />)
    expect(screen.getAllByText('₹1,20,000').length).toBeGreaterThan(0)
  })

  it('states the GST position', () => {
    render(<CartSummary cart={build([line('active')])} unavailable={[]} canCheckout />)
    expect(screen.getByText(copy.summary.gstNote)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------

describe('CartLine', () => {
  it('strikes the price through on an unavailable line', () => {
    const soldLine: CartLineType = {
      id: 'crl_x',
      selection: null,
      product: {
        id: 'p',
        slug: 's',
        title: 'A sweater',
        brand: 'B',
        category: 'knitwear',
        subcategory: 'Crewneck',
        listingType: 'pre_loved',
        gender: 'unisex',
        condition: 'good',
        color: { slug: 'navy', name: 'Navy', hex: '#25314f' },
        colorVariants: [],
        composition: '100% merino wool',
        size: { label: 'M', system: 'IN', normalized: 'm' },
        priceInr: 100_000,
        originalRetailInr: null,
        currency: 'INR',
        availability: 'sold',
        passportId: null,
        primaryImage: {
          id: 'i',
          url: 'https://picsum.photos/seed/x/100/100',
          alt: 'a',
          kind: 'primary',
          aspectRatio: 0.75,
        },
      },
      priceAtAddInr: 100_000,
      addedAt: '2026-08-20T00:00:00.000Z',
      status: 'sold_out',
    }
    const { container } = render(<CartLine line={soldLine} />)
    expect(container.querySelector('s')).toHaveTextContent('₹1,000')
    expect(screen.getByText(copy.line.soldOut)).toBeInTheDocument()
    // Save-for-later is not offered on something that cannot be bought.
    expect(screen.queryByRole('button', { name: copy.line.moveToWishlist })).toBeNull()
  })
})
