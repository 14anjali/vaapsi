import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeliveryOptions } from '../checkout/delivery-options'
import { Gallery } from '../product/gallery'
import { checkout } from '@/content/checkout'
import { formatArrival } from '@/lib/format/arrival'
import { formatInr } from '@/lib/format/currency'
import type { DeliveryOptionId } from '@/content/checkout'
import { productPage } from '@/content/product'
import type { ProductImage } from '@/lib/types'
import { useWishlistStore } from '@/lib/store/wishlist'

expect.extend(toHaveNoViolations)

const images: readonly ProductImage[] = Array.from({ length: 5 }, (_, i) => ({
  id: `img_${i + 1}`,
  url: `/products/x/${i + 1}.jpg`,
  alt: `Frame ${i + 1}`,
  kind: i === 0 ? 'primary' : 'detail',
  aspectRatio: 0.8,
}))

beforeEach(() => {
  useWishlistStore.setState({ items: [] })
})

/**
 * The gallery.
 *
 * The point of the rewrite was reducing scroll, so what is worth asserting is
 * that every frame is reachable without one: three thumbnails onto frames other
 * than the hero, arrows that wrap, and a stated position.
 */
describe('Gallery', () => {
  it('shows three thumbnails, and none of them is the current hero', () => {
    render(<Gallery images={images} sold={false} productId="p" />)
    const thumbs = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    const buttons = within(thumbs).getAllByRole('button')
    expect(buttons).toHaveLength(3)
    // Hero is frame 1, so the tiles are 2, 3 and 4.
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      productPage.gallery.frame(2, 5),
      productPage.gallery.frame(3, 5),
      productPage.gallery.frame(4, 5),
    ])
  })

  it('states which frame is showing', () => {
    render(<Gallery images={images} sold={false} productId="p" />)
    expect(screen.getByText(productPage.gallery.position(1, 5))).toBeInTheDocument()
  })

  it('brings a clicked thumbnail into the hero, and rolls the row on', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)

    const thumbs = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    await user.click(within(thumbs).getByRole('button', { name: productPage.gallery.frame(3, 5) }))

    expect(screen.getByText(productPage.gallery.position(3, 5))).toBeInTheDocument()
    // The row now offers frames 4, 5 and 1 — never the one in the hero.
    const after = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    expect(
      within(after).queryByRole('button', { name: productPage.gallery.frame(3, 5) }),
    ).toBeNull()
  })

  it('steps forward and wraps at the end', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)
    const next = screen.getByRole('button', { name: productPage.gallery.next })

    for (let i = 0; i < 4; i++) await user.click(next)
    expect(screen.getByText(productPage.gallery.position(5, 5))).toBeInTheDocument()

    // Wraps rather than dead-ending.
    await user.click(next)
    expect(screen.getByText(productPage.gallery.position(1, 5))).toBeInTheDocument()
  })

  it('steps backward from the first frame to the last', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)
    await user.click(screen.getByRole('button', { name: productPage.gallery.previous }))
    expect(screen.getByText(productPage.gallery.position(5, 5))).toBeInTheDocument()
  })

  it('hides the arrows when there is only one frame to step through', () => {
    render(<Gallery images={[images[0]!]} sold={false} productId="p" />)
    expect(screen.queryByRole('button', { name: productPage.gallery.next })).toBeNull()
  })

  it('announces the frame that came into view', async () => {
    const user = userEvent.setup()
    const { container } = render(<Gallery images={images} sold={false} productId="p" />)
    await user.click(screen.getByRole('button', { name: productPage.gallery.next }))
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('Frame 2')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Gallery images={images} sold={false} productId="p" />
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/**
 * The delivery choice.
 *
 * The arithmetic is a commercial commitment, so it is asserted rather than
 * eyeballed — and it must round in the shopper's favour, never against. The
 * grouping is asserted too, because the whole point of the layout is that the
 * two discount tiers read as one choice rather than as two more options.
 */
describe('DeliveryOptions', () => {
  const SUBTOTAL = 400_000 // ₹4,000
  // A Monday, so working-day arithmetic has a known answer and the suite does
  // not behave differently depending on the day it runs.
  const NOW = new Date(2026, 8, 7)

  function setup(initial: DeliveryOptionId = 'standard') {
    function Harness() {
      const [selected, setSelected] = useState<DeliveryOptionId>(initial)
      return (
        <DeliveryOptions
          subtotalInr={SUBTOTAL}
          selected={selected}
          onChange={(option) => setSelected(option.id)}
          now={NOW}
        />
      )
    }
    return render(<Harness />)
  }

  it('renders every configured option, across two bands', () => {
    setup()
    // Counted from the content rather than hardcoded: which tiers exist is a
    // commercial decision that has already changed once, and a test that
    // hardcodes it fails on the decision rather than on a defect.
    expect(screen.getAllByRole('radio')).toHaveLength(checkout.delivery.options.length)
    expect(screen.getByRole('group', { name: checkout.delivery.soonHeading })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: checkout.delivery.waitHeading })).toBeInTheDocument()
  })

  it('keeps both discount tiers inside the wait band, and neither outside it', () => {
    setup()
    const wait = screen.getByRole('group', { name: checkout.delivery.waitHeading })
    // The grouping is the design: one dial with two positions.
    expect(within(wait).getAllByRole('radio')).toHaveLength(2)
    expect(within(wait).getByRole('radio', { name: /10% off/ })).toBeInTheDocument()
    expect(within(wait).getByRole('radio', { name: /15% off/ })).toBeInTheDocument()

    const soon = screen.getByRole('group', { name: checkout.delivery.soonHeading })
    expect(within(soon).queryByRole('radio', { name: /10% off/ })).toBeNull()
  })

  it('charges one flat delivery fee across every tier', () => {
    // Flat on purpose. The consolidated tiers give their benefit as a discount
    // on the garments, so a second variable in the delivery line would mean two
    // numbers moving at once for one choice.
    const fees = new Set(checkout.delivery.options.map((option) => option.feeInr))
    expect(fees.size).toBe(1)
    expect([...fees][0]).toBeGreaterThan(0)
  })

  it('states the delivery fee as an amount, never as "Included"', () => {
    // "Included" was honest while delivery was free and became a lie the moment
    // it was not. A shopper adding up an order should see every rupee in it.
    setup()
    expect(screen.getByText(formatInr(checkout.delivery.options[0]!.feeInr))).toBeInTheDocument()
    expect(screen.queryByText(/included/i)).toBeNull()
  })

  it('gives every tier a date rather than a duration', () => {
    setup()
    // Ordering on Monday 7 Sep 2026 with a 4–6 working-day window lands
    // Fri 11 – Tue 15 Sep: the weekend is skipped, which is exactly the
    // arithmetic a shopper reading "4–6 working days" has to do themselves.
    expect(screen.getByText('Arrives Fri 11 – Tue 15 Sep')).toBeInTheDocument()
    for (const option of checkout.delivery.options) {
      expect(
        screen.getByText(checkout.delivery.arrives(formatArrival(option.lead, NOW))),
      ).toBeInTheDocument()
    }
    expect(screen.queryByText(/working days/)).toBeNull()
    expect(screen.queryByText(/about 30 days/)).toBeNull()
  })

  it('states each saving in rupees, not only as a percentage', () => {
    setup()
    // 10% and 15% of ₹4,000.
    expect(screen.getByText(checkout.delivery.saves('₹400'))).toBeInTheDocument()
    expect(screen.getByText(checkout.delivery.saves('₹600'))).toBeInTheDocument()
  })

  it('starts on standard, so a discount is always opted into', () => {
    setup()
    expect(screen.getByRole('radio', { name: /Standard/ })).toBeChecked()
  })

  it('reports the chosen option upward, with its fee and discount', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <DeliveryOptions subtotalInr={SUBTOTAL} selected="standard" onChange={onChange} now={NOW} />,
    )
    await user.click(screen.getByRole('radio', { name: /15% off/ }))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'save15', discountPercent: 15, feeInr: 9_900 }),
    )
  })

  it('marks the chosen discount tier as applied', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.queryByText(checkout.delivery.applied)).toBeNull()
    await user.click(screen.getByRole('radio', { name: /10% off/ }))
    expect(screen.getByText(checkout.delivery.applied)).toBeInTheDocument()
  })

  it('dates the long wait too, so a month is not left abstract', () => {
    setup()
    // 28–32 and 38–42 calendar days from Mon 7 Sep 2026. Counted as calendar
    // days, not working days — "about 30 days" means a month, and 30 working
    // days would quietly be six weeks.
    expect(screen.getByText('Arrives Mon 5 – Fri 9 Oct')).toBeInTheDocument()
    expect(screen.getByText('Arrives Thu 15 – Mon 19 Oct')).toBeInTheDocument()
  })

  it('floors a saving, so rounding never favours us over the shopper', () => {
    function Harness() {
      const [selected, setSelected] = useState<DeliveryOptionId>('standard')
      return (
        <DeliveryOptions
          subtotalInr={999}
          selected={selected}
          onChange={(option) => setSelected(option.id)}
          now={NOW}
        />
      )
    }
    render(<Harness />)
    // 10% of 999 paise is 99.9 → 99 paise. Never quoted larger than it is.
    expect(screen.getByText(checkout.delivery.saves('₹0.99'))).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
