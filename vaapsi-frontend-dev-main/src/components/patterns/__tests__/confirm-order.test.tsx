import { axe, toHaveNoViolations } from 'jest-axe'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmOrder } from '../checkout/confirm-order'
import { checkout } from '@/content/checkout'
import { products } from '@/lib/data/fixtures/products'
import type { CartLine } from '@/lib/types'

expect.extend(toHaveNoViolations)

/**
 * The confirmation gate.
 *
 * Two things are worth asserting here and they pull in opposite directions.
 *
 * It has to **interrupt** — a modal, focus moved into it, escapable, with a
 * cancel that is as easy to reach as the confirm. And it has to **summarise**
 * rather than repeat the page's own itemised column, because the four numbers a
 * shopper regrets getting wrong were previously buried in a second copy of a
 * table they had already read.
 */

function line(index: number, status: CartLine['status'] = 'active'): CartLine {
  const product = products[index]!
  return {
    id: `line_${index}`,
    product: {
      ...product,
      primaryImage: product.images[0]!,
    } as unknown as CartLine['product'],
    priceAtAddInr: product.priceInr,
    addedAt: '2026-09-01T00:00:00.000Z',
    status,
    selection: null,
  }
}

function setup(overrides: Partial<React.ComponentProps<typeof ConfirmOrder>> = {}) {
  const onPlaced = jest.fn()
  const lines = overrides.lines ?? [line(0), line(1)]
  const subtotalInr = lines.reduce((sum, item) => sum + item.priceAtAddInr, 0)
  const result = render(
    <ConfirmOrder
      lines={lines}
      subtotalInr={subtotalInr}
      savingInr={0}
      totalInr={subtotalInr}
      deliveryWindow="4–6 working days"
      paymentLabel="Card"
      disabled={false}
      onPlaced={onPlaced}
      {...overrides}
    />,
  )
  return { ...result, onPlaced, lines, subtotalInr }
}

async function open() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: checkout.confirm.trigger }))
  return user
}

describe('ConfirmOrder', () => {
  it('asks before it buys, rather than placing the order on the first click', async () => {
    const { onPlaced } = setup()
    await open()
    expect(onPlaced).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: checkout.confirm.title })).toBeInTheDocument()
  })

  it('will not open while the form is incomplete', async () => {
    setup({ disabled: true })
    const trigger = screen.getByRole('button', { name: checkout.confirm.trigger })
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    await userEvent.setup().click(trigger)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('summarises the garments instead of re-listing them', async () => {
    // The page's own right-hand column already carries a photograph, colour,
    // size, composition and price per line. This is deliberately not that: a
    // strip of thumbnails and a count, so the order is recognisable at a glance
    // without the four figures below it being pushed off screen.
    const { lines } = setup()
    await open()
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByText(checkout.confirm.itemCount(lines.length))).toBeInTheDocument()
    expect(within(dialog).getAllByRole('img')).toHaveLength(lines.length)
    // No per-line price table. The total is the number that matters here.
    expect(within(dialog).queryByRole('list')).toBeNull()
  })

  it('collapses a long order rather than growing the dialog', async () => {
    const lines = [line(0), line(1), line(2), line(3), line(4), line(5)]
    setup({
      lines,
      subtotalInr: 100,
      totalInr: 100,
    })
    await open()
    const dialog = screen.getByRole('dialog')
    // Four thumbnails and a "+2", not six thumbnails.
    expect(within(dialog).getAllByRole('img')).toHaveLength(4)
    expect(within(dialog).getByText(checkout.confirm.more(2))).toBeInTheDocument()
  })

  it('states the four facts the decision turns on', async () => {
    setup({ savingInr: 123_000, deliveryWindow: 'Arrives in about 40 days' })
    await open()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(checkout.confirm.subtotalLabel)).toBeInTheDocument()
    expect(within(dialog).getByText(checkout.confirm.savedLabel)).toBeInTheDocument()
    expect(within(dialog).getByText('Arrives in about 40 days')).toBeInTheDocument()
    expect(within(dialog).getByText('Card')).toBeInTheDocument()
    expect(within(dialog).getByText(checkout.confirm.totalLabel)).toBeInTheDocument()
  })

  it('shows a saving in the positive tone, never the accent', async () => {
    setup({ savingInr: 123_000 })
    await open()
    // Red for "− ₹1,230" reads as an error on the one line that is purely in
    // the shopper's favour. This is the whole reason --positive exists.
    const saved = screen.getByText(checkout.confirm.savedLabel)
    expect(saved).toHaveClass('text-positive')
    expect(saved).not.toHaveClass('text-accent')
  })

  it('says nothing about a saving when there is none to report', async () => {
    setup({ savingInr: 0 })
    await open()
    expect(screen.queryByText(checkout.confirm.savedLabel)).toBeNull()
  })

  it('offers a way out that is as easy to reach as the way in', async () => {
    const { onPlaced } = setup()
    const user = await open()
    // Not a greyed link under the primary button — a real, equally-weighted
    // control. A confirmation that makes cancelling hard adds friction without
    // adding a choice.
    await user.click(screen.getByRole('button', { name: checkout.confirm.cancel }))
    expect(onPlaced).not.toHaveBeenCalled()
    // The panel stays mounted so it can transition out, but it leaves the
    // accessibility tree — see the `invisible`/`aria-hidden` note on `Overlay`.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('closes on Escape without buying anything', async () => {
    const { onPlaced } = setup()
    const user = await open()
    await user.keyboard('{Escape}')
    expect(onPlaced).not.toHaveBeenCalled()
  })

  it('places the order on the second, deliberate action', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onPlaced = jest.fn()
    setup({ onPlaced })
    await user.click(screen.getByRole('button', { name: checkout.confirm.trigger }))
    await user.click(screen.getByRole('button', { name: checkout.confirm.confirm }))
    expect(screen.getByRole('button', { name: checkout.confirm.placing })).toBeInTheDocument()
    act(() => jest.runAllTimers())
    expect(onPlaced).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  it('has no accessibility violations while open', async () => {
    const { container } = setup({ savingInr: 50_000 })
    await open()
    expect(await axe(container)).toHaveNoViolations()
  })
})
