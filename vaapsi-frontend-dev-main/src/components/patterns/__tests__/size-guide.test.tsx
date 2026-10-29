import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SizeGuide } from '../product/size-guide'
import { chartForCategory, sizeCharts, sizeGuide } from '@/content/size-guide'

expect.extend(toHaveNoViolations)

/**
 * The size guide.
 *
 * Two things here are worth protecting. The chart must be a real table, because
 * a screen reader reading a grid of divs gives a run of numbers with nothing to
 * attach them to. And the body-versus-garment distinction must stay visible,
 * because that is the difference between a guide that helps and one that gets
 * someone to order the wrong size.
 */

const bottoms = sizeCharts.find((chart) => chart.id === 'bottoms')!

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: sizeGuide.trigger }))
  return screen.getByRole('dialog')
}

describe('SizeGuide', () => {
  it('is closed until asked for', () => {
    render(<SizeGuide chartId="bottoms" />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: sizeGuide.trigger })).toBeInTheDocument()
  })

  it('renders the chart as a table with a header row per column', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId="bottoms" />)
    const dialog = await open(user)

    const table = within(dialog).getByRole('table')
    for (const column of bottoms.columns) {
      expect(within(table).getByRole('columnheader', { name: column })).toBeInTheDocument()
    }
    // Each size is a row header, so a measurement is announced with its size.
    for (const row of bottoms.rows) {
      expect(within(table).getByRole('rowheader', { name: row.size })).toBeInTheDocument()
    }
  })

  it('shows the chart the category calls for, not every chart on the site', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId={chartForCategory('bottoms')} />)
    const dialog = await open(user)
    // The waist ladder, not the bust/neck ones.
    expect(within(dialog).getByRole('columnheader', { name: 'Inseam' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('columnheader', { name: 'Neck' })).toBeNull()
  })

  it('separates body measurements from this garment measured flat', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId="bottoms" garmentPanel={<p>Flat measurements here</p>} />)
    const dialog = await open(user)

    expect(within(dialog).getByRole('tab', { name: sizeGuide.tabs.body })).toBeInTheDocument()
    expect(within(dialog).getByRole('tab', { name: sizeGuide.tabs.garment })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('tab', { name: sizeGuide.tabs.garment }))
    // The distinction is stated, not left to be inferred.
    expect(screen.getByText(sizeGuide.bodyVsGarment)).toBeInTheDocument()
    expect(screen.getByText('Flat measurements here')).toBeInTheDocument()
  })

  it('offers no garment tab when there are no flat measurements to show', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId="bottoms" />)
    const dialog = await open(user)
    expect(within(dialog).queryByRole('tab', { name: sizeGuide.tabs.garment })).toBeNull()
  })

  it('says where the numbers come from and that they are provisional', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId="bottoms" />)
    const dialog = await open(user)
    // Presenting another retailer's chart as measured Vaapsi spec would be the
    // actual problem. The provenance note is what makes it honest.
    expect(within(dialog).getByText(sizeGuide.source)).toBeInTheDocument()
    expect(within(dialog).getByText(sizeGuide.sourcePending)).toBeInTheDocument()
  })

  it('tells a pre-loved shopper the ladder is only a reference', async () => {
    const user = userEvent.setup()
    render(<SizeGuide chartId="bottoms" oneOfOne />)
    const dialog = await open(user)
    expect(within(dialog).getByText(sizeGuide.oneOfOneNote)).toBeInTheDocument()
  })

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <SizeGuide chartId="bottoms" garmentPanel={<p>Flat measurements</p>} />,
    )
    await open(user)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('size chart data', () => {
  it('gives every row a value for every column but the size', () => {
    for (const chart of sizeCharts) {
      for (const row of chart.rows) {
        expect(row.values).toHaveLength(chart.columns.length - 1)
      }
    }
  })

  it('routes bottoms to the waist ladder and everything else to a body chart', () => {
    expect(chartForCategory('bottoms')).toBe('bottoms')
    // Known gap: `Product` has no gender field, so non-bottoms fall back to one
    // chart. Asserted so the fallback is a recorded decision, not a surprise.
    expect(chartForCategory('tops')).toBe('womenswear')
    expect(chartForCategory('outerwear')).toBe('womenswear')
  })
})
