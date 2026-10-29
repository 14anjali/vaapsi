import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockPayment } from '../checkout/mock-payment'
import { checkout } from '@/content/checkout'

expect.extend(toHaveNoViolations)

/**
 * The demo payment step.
 *
 * These are safety tests, not feature tests. The risk this component carries is
 * that somebody types a real card number into a prototype, or that a reviewer
 * mistakes it for a working checkout — so what is asserted here is the
 * safeguards, and they should be the last things anyone weakens.
 */
describe('MockPayment', () => {
  it('carries no banner, because the card itself is labelled', () => {
    // The "Demo only — no payment is taken" note was removed on request as
    // stating the obvious. What replaced it is not nothing: the mark is on the
    // card face, which is the case a banner outside the frame always missed.
    render(<MockPayment />)
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.getByText(checkout.payment.card.faceMark)).toBeInTheDocument()
  })

  it('refuses a real-looking card number', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const field = screen.getByLabelText(new RegExp(checkout.payment.card.number))

    await user.type(field, '5454545454545454')
    expect(screen.getByText(checkout.payment.card.rejected)).toBeInTheDocument()
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  it('accepts every published test card, and nothing else', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    const { unmount } = render(<MockPayment onValidityChange={onValidityChange} />)
    unmount()

    // One per network, so the mark on the card face is reachable for each. Both
    // are the numbers every payment provider publishes; neither is anyone's
    // card and both fail a real authorisation by design.
    for (const number of checkout.payment.card.testNumbers) {
      const view = render(<MockPayment onValidityChange={onValidityChange} />)
      await user.type(screen.getByLabelText(new RegExp(checkout.payment.card.number)), number)
      expect(onValidityChange).toHaveBeenLastCalledWith(true)
      view.unmount()
    }
  })

  it('names the network of the number being typed', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const field = screen.getByLabelText(new RegExp(checkout.payment.card.number))

    await user.type(field, '41')
    expect(screen.getByLabelText('Visa')).toBeInTheDocument()

    await user.clear(field)
    await user.type(field, '55')
    expect(screen.getByLabelText('Mastercard')).toBeInTheDocument()
    expect(screen.queryByLabelText('Visa')).toBeNull()
  })

  it('waits for two digits before naming a network', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    // A lone "5" is a Mastercard and "50" is not. A mark that guesses and then
    // corrects itself is worse than one that waits.
    await user.type(screen.getByLabelText(new RegExp(checkout.payment.card.number)), '5')
    expect(screen.queryByLabelText('Mastercard')).toBeNull()
  })

  it('accepts only the published test card', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    render(<MockPayment onValidityChange={onValidityChange} />)

    await user.type(
      screen.getByLabelText(new RegExp(checkout.payment.card.number)),
      checkout.payment.card.testNumbers[0]!,
    )
    expect(screen.queryByText(checkout.payment.card.rejected)).toBeNull()
    expect(onValidityChange).toHaveBeenLastCalledWith(true)
  })

  it('does not report readiness while the card is wrong', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    render(<MockPayment onValidityChange={onValidityChange} />)
    await user.type(
      screen.getByLabelText(new RegExp(checkout.payment.card.number)),
      '4111111111111112',
    )
    expect(onValidityChange).toHaveBeenLastCalledWith(false)
  })

  it('offers every configured payment method', () => {
    render(<MockPayment />)
    // Derived from the content: the method list is a commercial decision, and
    // it has already gained cash on delivery once.
    expect(screen.getAllByRole('radio')).toHaveLength(checkout.payment.methods.length)
    for (const method of checkout.payment.methods) {
      expect(screen.getByRole('radio', { name: new RegExp(method.label) })).toBeInTheDocument()
    }
  })

  it('swaps the fields with the method, so no card field is left hanging', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    await user.click(screen.getByRole('radio', { name: /UPI/ }))

    expect(screen.queryByLabelText(new RegExp(checkout.payment.card.number))).toBeNull()
    expect(screen.getByLabelText(new RegExp(checkout.payment.upi.id))).toBeInTheDocument()
  })

  it('groups the card number as it is typed, the way the card is printed', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const field = screen.getByLabelText(new RegExp(checkout.payment.card.number))
    await user.type(field, '4111111111111111')
    // The number sits across the middle of the card face, so it is formatted
    // to match the embossing rather than left as a sixteen-digit run.
    expect(field).toHaveValue('4111 1111 1111 1111')
  })

  it('will not take a seventeenth digit', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const field = screen.getByLabelText(new RegExp(checkout.payment.card.number))
    await user.type(field, '41111111111111119')
    expect(field).toHaveValue('4111 1111 1111 1111')
  })

  it('keeps the CVV on the back, and gives the mouse a way to turn the card', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    // The field exists either way — the card is one object, both faces
    // rendered. What the control provides is a way to *see* the face it is on,
    // which a mouse user has no other route to.
    const flip = screen.getByRole('button', { name: checkout.payment.card.flipToBack })
    await user.click(flip)
    expect(screen.getByLabelText(new RegExp(checkout.payment.card.cvv))).toHaveFocus()
  })

  it('never holds the CVV, even in memory', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const cvv = screen.getByLabelText(new RegExp(checkout.payment.card.cvv))
    await user.type(cvv, '123')
    // Safeguard 4: uncontrolled, so React has no state for it. A controlled
    // input would round-trip the value through the component on every keystroke.
    expect(cvv).not.toHaveAttribute('value')
  })

  it('labels the card face itself as a demo, not just the banner above it', () => {
    render(<MockPayment />)
    // A screenshot cropped to the card is still unmistakably a mock.
    expect(screen.getByText(checkout.payment.card.faceMark)).toBeInTheDocument()
  })

  it('is ready on cash on delivery with nothing filled in', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    render(<MockPayment onValidityChange={onValidityChange} />)
    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    // There is nothing to enter. That is the entire offer, and gating the
    // confirm button on a field that does not exist would strand the shopper.
    expect(onValidityChange).toHaveBeenLastCalledWith(true)
  })

  it('flags cash on delivery as unconfirmed on screen, not only in a comment', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    expect(screen.getByText(checkout.payment.cod.pendingNote)).toBeInTheDocument()
  })

  it('says where a hand-off method actually completes', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    await user.click(screen.getByRole('radio', { name: /Net banking/ }))
    // UPI, net banking and COD all finish on a screen we do not own. Each one
    // says so rather than drawing a form for a step that happens elsewhere.
    expect(screen.getByText(checkout.payment.handoff.continues)).toBeInTheDocument()
    expect(screen.getByText(checkout.payment.netbanking.handoff)).toBeInTheDocument()
    expect(screen.queryByText(checkout.payment.card.faceMark)).toBeNull()
  })

  it('reports the chosen method upward, so the dialog can name it', async () => {
    const user = userEvent.setup()
    const onMethodChange = jest.fn()
    render(<MockPayment onMethodChange={onMethodChange} />)
    await user.click(screen.getByRole('radio', { name: /UPI/ }))
    expect(onMethodChange).toHaveBeenLastCalledWith('upi')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MockPayment />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations on a hand-off method either', async () => {
    const user = userEvent.setup()
    const { container } = render(<MockPayment />)
    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
