import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Customiser } from '../product/customiser'
import { customise, placementsFor, trinkets } from '@/content/customise'

expect.extend(toHaveNoViolations)

/**
 * The customiser.
 *
 * Three things here are load-bearing and everything else is presentation: a
 * placement can hold one addition, the lead time is the longest addition rather
 * than the sum, and the four consequences appear as soon as anything is added.
 * The last one matters most — a shopper who is not told a customised garment
 * cannot be returned has a complaint no copy fixes afterwards.
 */

const SASHIKO = trinkets.find((t) => t.id === 'sashiko')!
const CHARM = trinkets.find((t) => t.id === 'charm')!

async function add(
  user: ReturnType<typeof userEvent.setup>,
  trinketLabel: string,
  placementLabel: string,
) {
  await user.click(screen.getByRole('button', { name: new RegExp(trinketLabel) }))
  await user.click(screen.getByRole('button', { name: placementLabel }))
  await user.click(screen.getByRole('button', { name: customise.addAction }))
}

describe('Customiser', () => {
  it('offers only placements the garment actually has', () => {
    render(<Customiser category="accessories" hasPassport />)
    // A bag has a strap and a front panel; it does not have a back yoke.
    expect(placementsFor('accessories').map((p) => p.label)).toContain('Strap')
    expect(placementsFor('accessories').map((p) => p.label)).not.toContain('Back yoke')
  })

  it('asks where it goes only once something is chosen', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    expect(screen.queryByRole('button', { name: 'Left hip' })).toBeNull()

    await user.click(screen.getByRole('button', { name: new RegExp(SASHIKO.label) }))
    expect(screen.getByRole('button', { name: 'Left hip' })).toBeInTheDocument()
  })

  it('starts with nothing on the garment, and says so', () => {
    render(<Customiser category="bottoms" hasPassport />)
    expect(screen.getByText(customise.empty)).toBeInTheDocument()
    // No consequences until there is something to have consequences.
    expect(screen.queryByText(customise.consequences.returns)).toBeNull()
  })

  it('adds an addition at a placement and lists it', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')

    // The "On this garment" list, not the placement button of the same name.
    expect(
      screen.getByRole('button', { name: customise.removeAction(SASHIKO.label, 'Left hip') }),
    ).toBeInTheDocument()
    expect(screen.queryByText(customise.empty)).toBeNull()
  })

  it('lets one placement hold only one addition', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')

    // The taken placement is disabled and announced as taken — two patches
    // cannot be sewn in the same spot.
    await user.click(screen.getByRole('button', { name: new RegExp(CHARM.label) }))
    const taken = screen.getByRole('button', {
      name: customise.placementTakenOption('Left hip', SASHIKO.label),
    })
    expect(taken).toBeDisabled()
  })

  it('states all four consequences once something is added', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')

    expect(screen.getByText(customise.consequences.cost('₹900'))).toBeInTheDocument()
    expect(screen.getByText(customise.consequences.lead(SASHIKO.leadDays))).toBeInTheDocument()
    expect(screen.getByText(customise.consequences.returns)).toBeInTheDocument()
    expect(screen.getByText(customise.consequences.passport)).toBeInTheDocument()
  })

  it('takes the longest lead time, not the sum', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')
    await add(user, CHARM.label, 'Back pocket')

    // Sashiko is 6 days, the charm 1. The work happens in one pass, so 6 — not 7.
    expect(screen.getByText(customise.consequences.lead(SASHIKO.leadDays))).toBeInTheDocument()
    expect(
      screen.queryByText(customise.consequences.lead(SASHIKO.leadDays + CHARM.leadDays)),
    ).toBeNull()
  })

  it('sums the price across additions', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')
    await add(user, CHARM.label, 'Back pocket')
    // ₹900 + ₹280.
    expect(screen.getByText(customise.consequences.cost('₹1,180'))).toBeInTheDocument()
  })

  it('removes an addition and frees its placement again', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport />)
    await add(user, SASHIKO.label, 'Left hip')

    await user.click(
      screen.getByRole('button', { name: customise.removeAction(SASHIKO.label, 'Left hip') }),
    )
    expect(screen.getByText(customise.empty)).toBeInTheDocument()
    // Selectable again, not still struck through.
    await user.click(screen.getByRole('button', { name: new RegExp(SASHIKO.label) }))
    expect(screen.getByRole('button', { name: 'Left hip' })).toBeEnabled()
  })

  it('reports the running state upward', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Customiser category="bottoms" hasPassport onChange={onChange} />)
    await add(user, CHARM.label, 'Left hip')

    expect(onChange).toHaveBeenLastCalledWith({
      items: [{ placementId: 'hip', trinketId: 'charm' }],
      priceInr: CHARM.priceInr,
      leadDays: CHARM.leadDays,
    })
  })

  it('says the addition is still recorded when a garment has no passport yet', async () => {
    const user = userEvent.setup()
    render(<Customiser category="bottoms" hasPassport={false} />)
    await add(user, CHARM.label, 'Left hip')

    expect(screen.getByText(customise.noPassportNote)).toBeInTheDocument()
    expect(screen.queryByText(customise.consequences.passport)).toBeNull()
  })

  it('has no accessibility violations, before and after adding', async () => {
    const user = userEvent.setup()
    const { container } = render(<Customiser category="bottoms" hasPassport />)
    expect(await axe(container)).toHaveNoViolations()

    await add(user, SASHIKO.label, 'Left hip')
    expect(await axe(container)).toHaveNoViolations()
  })
})
