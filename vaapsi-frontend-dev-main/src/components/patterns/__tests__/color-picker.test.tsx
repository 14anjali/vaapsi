import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from '../product/color-picker'
import { productPage } from '@/content/product'
import type { ColorVariant } from '@/lib/types'

expect.extend(toHaveNoViolations)

/**
 * The colour picker.
 *
 * The behaviour worth pinning down is the size/colour relationship. Everything
 * else here is presentation, but offering a size that the selected colour does
 * not carry is a bug that ends in a cancelled order, so that is what most of
 * these assert.
 */

const RAW = { slug: 'raw-indigo', name: 'Raw indigo', hex: '#2b3a55' }
const LIGHT = { slug: 'light-wash', name: 'Light wash', hex: '#a8c0d8' }
const BLACK = { slug: 'washed-black', name: 'Washed black', hex: '#2f2f33' }

const size = (label: string) => ({ label, system: 'IN' as const, normalized: label.toLowerCase() })

const variants: readonly ColorVariant[] = [
  {
    color: RAW,
    sizes: [size('W28'), size('W30'), size('W32')],
    availability: 'available',
    priceInr: null,
    images: [],
  },
  {
    color: LIGHT,
    sizes: [size('W28')],
    availability: 'available',
    priceInr: 520_000,
    images: [],
  },
  { color: BLACK, sizes: [], availability: 'sold', priceInr: null, images: [] },
]

function setup(defaultColorSlug = RAW.slug) {
  return render(
    <ColorPicker variants={variants} defaultColorSlug={defaultColorSlug} priceInr={390_000} />,
  )
}

describe('ColorPicker', () => {
  it('names the selected colour in words, not only as a swatch', () => {
    setup()
    // A dot alone is unusable in a palette that is almost entirely blue.
    expect(screen.getByText(RAW.name)).toBeInTheDocument()
  })

  it('offers only the sizes the selected colour actually carries', async () => {
    const user = userEvent.setup()
    setup()
    const sizes = screen.getByRole('group', { name: productPage.colorPicker.sizeLabel })
    expect(within(sizes).getAllByRole('button')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: LIGHT.name }))

    const after = screen.getByRole('group', { name: productPage.colorPicker.sizeLabel })
    expect(within(after).getAllByRole('button')).toHaveLength(1)
    expect(within(after).getByRole('button', { name: 'W28' })).toBeInTheDocument()
    expect(within(after).queryByRole('button', { name: 'W32' })).toBeNull()
  })

  it('clears a chosen size the new colour does not carry', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'W32' }))
    expect(screen.getByRole('button', { name: 'W32' })).toHaveAttribute('aria-pressed', 'true')

    // Light wash has no W32. Keeping it selected would be an impossible pair.
    await user.click(screen.getByRole('button', { name: LIGHT.name }))
    expect(screen.getByText(productPage.colorPicker.sizeUnchosen)).toBeInTheDocument()
  })

  it('keeps a chosen size that the new colour does carry', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'W28' }))
    await user.click(screen.getByRole('button', { name: LIGHT.name }))
    expect(screen.getByRole('button', { name: 'W28' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a sold-out colour, disabled and announced as such', () => {
    setup()
    const soldOut = screen.getByRole('button', {
      name: productPage.colorPicker.soldOutOption(BLACK.name),
    })
    // Present rather than removed: a row that loses a swatch looks broken, and
    // the fact it sold out is useful.
    expect(soldOut).toBeDisabled()
  })

  it('never lands on a sold-out colour, even when asked to', () => {
    setup(BLACK.slug)
    expect(screen.getByText(RAW.name)).toBeInTheDocument()
  })

  it('states the price when a colourway is priced differently', async () => {
    const user = userEvent.setup()
    setup()
    // Raw indigo takes the product price, so nothing is said.
    expect(screen.queryByText(/This colour is/)).toBeNull()

    await user.click(screen.getByRole('button', { name: LIGHT.name }))
    expect(
      screen.getByText(productPage.colorPicker.pricedDifferently('₹5,200')),
    ).toBeInTheDocument()
  })

  it('marks the selected colour with aria-pressed, not colour alone', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.getByRole('button', { name: RAW.name })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: LIGHT.name }))
    expect(screen.getByRole('button', { name: LIGHT.name })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: RAW.name })).toHaveAttribute('aria-pressed', 'false')
  })

  it('has no accessibility violations', async () => {
    const { container } = setup()
    expect(await axe(container)).toHaveNoViolations()
  })
})
