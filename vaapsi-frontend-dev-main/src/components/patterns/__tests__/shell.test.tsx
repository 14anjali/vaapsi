import { act, screen, within } from '@testing-library/react'
import { renderWithProviders as render } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Dot, Logo } from '../logo'
import { MobileNav } from '../mobile-nav'
import { NavLink, isActive } from '../nav-link'
import { SiteFooter } from '../site-footer'
import { SiteHeader } from '../site-header'
import { SkipLink } from '../skip-link'
import { footerMeta, navLabels, primaryNav } from '@/content/navigation'
import { passportCopy } from '@/content/passport'
import { useCartStore } from '@/lib/store/cart'
import { useUiStore } from '@/lib/store/ui'

let pathname = '/'
// `useRouter` is here because the header's profile menu can now sign out, and
// signing out navigates home. The header itself still never routes.
jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), refresh: jest.fn() }),
}))

beforeEach(() => {
  pathname = '/'
  useUiStore.setState({ mobileNavOpen: false, searchOpen: false, cartOpen: false })
  useCartStore.setState({ items: [], hydrated: true })
})

// ---------------------------------------------------------------------------

describe('isActive', () => {
  it('matches a section by prefix', () => {
    expect(isActive({ label: 'Women', href: '/shop/women' }, '/shop/women')).toBe(true)
    expect(isActive({ label: 'Women', href: '/shop/women' }, '/shop/women/knitwear')).toBe(true)
    expect(isActive({ label: 'Women', href: '/shop/women' }, '/shop/men')).toBe(false)
  })

  it('ignores the query string when matching', () => {
    expect(isActive({ label: 'New in', href: '/shop?sort=newest' }, '/shop')).toBe(true)
  })

  it('matches the home route exactly, not as a prefix of everything', () => {
    expect(isActive({ label: 'Home', href: '/' }, '/')).toBe(true)
    expect(isActive({ label: 'Home', href: '/' }, '/shop')).toBe(false)
  })

  it('does not treat a sibling with a shared prefix as active', () => {
    expect(isActive({ label: 'Shop', href: '/shop' }, '/shopping-bag')).toBe(false)
  })
})

describe('NavLink', () => {
  it('marks the active item with aria-current and the accent dot', () => {
    pathname = '/shop/women'
    const { container } = render(<NavLink item={{ label: 'Women', href: '/shop/women' }} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-current', 'page')
    // The dot, not an underline.
    expect(container.querySelector('.bg-accent')).not.toBeNull()
    expect(link.className).not.toContain('underline')
  })

  it('reserves the dot slot when inactive, so the label does not shift', () => {
    pathname = '/shop'
    const { container } = render(<NavLink item={{ label: 'Men', href: '/shop/men' }} />)
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current')
    expect(container.querySelector('.bg-accent')).toBeNull()
    // The empty slot is still there.
    expect(container.querySelector('span.inline-flex')).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------

describe('Logo', () => {
  it('is labelled by default and decorative on request', () => {
    const { unmount } = render(<Logo />)
    expect(screen.getByRole('img', { name: 'Vaapsi' })).toBeInTheDocument()
    unmount()

    const { container } = render(<Logo decorative />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders the brand asset, not a typographic stand-in', () => {
    // The dot floats well above where a tittle sits. No font substitution
    // reproduces that, which is why the mark is an image and not live text.
    const { container } = render(<Logo />)
    expect(container.textContent).toBe('')
    const sources = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
    expect(sources.some((src) => src?.includes('wordmark'))).toBe(true)
  })

  it('ships a light-on-dark copy so the mark survives the inverse preset', () => {
    // Black letterforms on a black page is an invisible logo, and an invert()
    // filter would take the red dot with it and turn it cyan.
    const { container } = render(<Logo />)
    const images = [...container.querySelectorAll('img')]
    expect(images).toHaveLength(2)
    // Exactly one is painted at a time, chosen off the theme attribute.
    expect(images[0]?.className).toContain("[data-theme='inverse']_&]:hidden")
    expect(images[1]?.className).toContain('hidden')
    expect(images[1]?.getAttribute('src')).toContain('inverse')
  })

  it('carries the alt text on the wrapper, not on either copy', () => {
    // Two <img> for one logo would otherwise announce the brand twice.
    const { container } = render(<Logo />)
    for (const img of container.querySelectorAll('img')) {
      expect(img.getAttribute('alt')).toBe('')
    }
  })

  it('is sized by height, so both variants set from the same visual weight', () => {
    // The wordmark is 2.7:1 and the mark is roughly 1:3.5 — a shared width
    // would make one of them the wrong size.
    const wordmark = render(<Logo />).container.firstElementChild?.className ?? ''
    expect(wordmark).toContain('h-5')
    expect(wordmark).not.toMatch(/w-\d/)
  })

  it('has a mark-only variant pointing at the cropped asset', () => {
    const { container } = render(<Logo variant="mark" />)
    const sources = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
    expect(sources.every((src) => src?.includes('mark'))).toBe(true)
    expect(sources.some((src) => src?.includes('wordmark'))).toBe(false)
  })
})

describe('Dot', () => {
  it('is the accent, at two sizes', () => {
    expect(render(<Dot />).container.firstElementChild?.className).toContain('bg-accent')
    expect(render(<Dot size="small" />).container.firstElementChild?.className).toContain('size-1')
  })
})

describe('SkipLink', () => {
  it('points at the main landmark and is hidden until focused', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link', { name: navLabels.skipToContent })
    expect(link).toHaveAttribute('href', '#main')
    expect(link.className).toContain('sr-only')
    expect(link.className).toContain('focus:not-sr-only')
  })
})

// ---------------------------------------------------------------------------

describe('SiteHeader', () => {
  it('renders every primary nav item', () => {
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: navLabels.mainNav })
    for (const item of primaryNav) {
      expect(within(nav).getByRole('link', { name: item.label })).toBeInTheDocument()
    }
  })

  it('says the bag is empty rather than showing a zero', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('button', { name: navLabels.cartEmpty })).toBeInTheDocument()
    expect(screen.queryByText('0')).toBeNull()
  })

  it('labels the bag with a readable count and caps the badge', () => {
    useCartStore.setState({
      items: [
        { productId: 'a', addedAt: '2026-08-01T00:00:00.000Z' },
        { productId: 'b', addedAt: '2026-08-02T00:00:00.000Z' },
        { productId: 'c', addedAt: '2026-08-03T00:00:00.000Z' },
      ],
      hydrated: true,
    })
    const { unmount } = render(<SiteHeader />)
    expect(screen.getByRole('button', { name: '3 items in your bag' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    unmount()

    useCartStore.setState({
      items: Array.from({ length: 14 }, (_, i) => ({
        productId: `p${i}`,
        addedAt: '2026-08-01T00:00:00.000Z',
      })),
      hydrated: true,
    })
    render(<SiteHeader />)
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('uses the singular for one item', () => {
    useCartStore.setState({
      items: [{ productId: 'a', addedAt: '2026-08-01T00:00:00.000Z' }],
      hydrated: true,
    })
    render(<SiteHeader />)
    expect(screen.getByRole('button', { name: '1 item in your bag' })).toBeInTheDocument()
  })

  it('renders no badge before the persisted bag has been read', () => {
    // A zero that jumps to three a frame later reads as a bug.
    useCartStore.setState({
      items: [{ productId: 'a', addedAt: '2026-08-01T00:00:00.000Z' }],
      hydrated: false,
    })
    render(<SiteHeader />)
    expect(screen.queryByText('1')).toBeNull()
  })

  it('opens the bag as a drawer rather than navigating away', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    await user.click(screen.getByRole('button', { name: navLabels.cartEmpty }))
    expect(useUiStore.getState().cartOpen).toBe(true)
  })

  it('transitions to a solid background on scroll rather than swapping markup', async () => {
    render(<SiteHeader />)
    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('data-scrolled', 'false')
    const linkCountAtTop = screen.getAllByRole('link').length

    window.scrollY = 400
    window.dispatchEvent(new Event('scroll'))
    await screen.findByRole('banner')

    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true')
    // Same markup in both states — only colour classes move.
    expect(screen.getAllByRole('link')).toHaveLength(linkCountAtTop)
  })
})

// ---------------------------------------------------------------------------

describe('MobileNav', () => {
  it('is hidden and unfocusable while closed, with no JavaScript involved', () => {
    render(<MobileNav />)
    // Portalled to `document.body`, so the panel's z-index is compared against
    // the header rather than against whatever opened it — which means it is not
    // in the render container. See `Overlay`.
    const shell = document.body.querySelector('[aria-hidden="true"]')
    expect(shell).not.toBeNull()
    // `invisible` is what removes the closed drawer from the tab order. It has
    // to be a class rather than an imperatively-set `inert`, or the drawer's
    // links are focusable in the server-rendered HTML before hydration.
    expect(shell?.className).toContain('invisible')
    expect(shell?.className).toContain('pointer-events-none')
  })

  it('becomes visible when opened', async () => {
    render(<MobileNav />)
    act(() => useUiStore.getState().openMobileNav())
    const dialog = await screen.findByRole('dialog')
    // The shell is the portalled wrapper the dialog sits inside.
    expect(dialog.closest('.fixed')?.className).not.toContain('invisible')
  })

  it('opens, moves focus inside the panel, and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)

    act(() => useUiStore.getState().openMobileNav())
    const dialog = await screen.findByRole('dialog')
    // Overlay focuses the first focusable thing in the panel. What matters is
    // that focus is inside it and cannot be tabbed out — not which control.
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(screen.getByRole('button', { name: navLabels.closeMenu })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(useUiStore.getState().mobileNavOpen).toBe(false)
  })

  it('traps Tab inside the panel', async () => {
    const user = userEvent.setup()
    render(<MobileNav />)
    act(() => useUiStore.getState().openMobileNav())

    const dialog = await screen.findByRole('dialog')
    const focusable = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const last = focusable[focusable.length - 1]
    expect(last).toBeDefined()

    last?.focus()
    await user.tab()
    // Wrapped back to the first focusable thing in the panel, not out to the page.
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('closes when the route changes', async () => {
    const { rerender } = render(<MobileNav />)
    act(() => useUiStore.getState().openMobileNav())
    expect(useUiStore.getState().mobileNavOpen).toBe(true)

    pathname = '/shop'
    rerender(<MobileNav />)
    expect(useUiStore.getState().mobileNavOpen).toBe(false)
  })

  it('locks the page behind it while open', async () => {
    render(<MobileNav />)
    act(() => useUiStore.getState().openMobileNav())
    await screen.findByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')

    act(() => useUiStore.getState().closeMobileNav())
    // The lock is released on close.
    await Promise.resolve()
  })
})

// ---------------------------------------------------------------------------

describe('SiteFooter', () => {
  it('renders as the contentinfo landmark', () => {
    render(<SiteFooter />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('leaves currency, tax and payment to the cart, where they are asked about', () => {
    // These were a full-width band at the bottom of every page answering a
    // question nobody has while browsing. The tax line is in the cart summary.
    render(<SiteFooter />)
    expect(screen.queryByText(footerMeta.gstNote)).toBeNull()
    for (const mark of footerMeta.paymentMarks) {
      expect(screen.queryByText(mark)).toBeNull()
    }
  })

  it('gives every footer column a heading', () => {
    render(<SiteFooter />)
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThanOrEqual(5)
  })

  it('names the passport from the content constant, never a hardcoded string', () => {
    render(<SiteFooter />)
    expect(screen.getByText(passportCopy.oneLiner)).toBeInTheDocument()
  })
})
