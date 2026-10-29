import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders as render } from '@/test-utils'
import { ConditionBlock } from '../product/condition-block'
import { ProductDrawers } from '../product/product-drawer'
import { ProductSpecification } from '../product/specification'
import { PassportImpact } from '../passport/impact'
import { PassportStory } from '../passport/story'
import type { TabItem } from '@/components/primitives/tabs'
import { drawers } from '@/content/drawers'
import { passports } from '@/lib/data/fixtures/passports'
import { products } from '@/lib/data/fixtures/products'
import { sellers } from '@/lib/data/fixtures/sellers'
import type { Product } from '@/lib/types'

const withPassport = products.find((p) => p.id === 'prd_levis_501_indigo') as Product
const withoutPassport = products.find((p) => p.passportId === null) as Product
const passport = passports.find((p) => p.id === 'psp_levis_501_indigo')!
const seller = sellers[0]!

/** The tab set the PDP builds, so tests exercise the real shape. */
function tabsFor(product: Product, passportOrNull: typeof passport | null): TabItem[] {
  const items: TabItem[] = [
    {
      id: 'specification',
      label: drawers.tabs.specification,
      panel: <ProductSpecification product={product} passport={passportOrNull} seller={seller} />,
    },
    {
      id: 'condition',
      label: drawers.tabs.condition,
      panel: <ConditionBlock product={product} headless />,
    },
  ]
  if (passportOrNull !== null) {
    items.push({
      id: 'passport',
      label: drawers.tabs.passport,
      panel: <PassportStory passport={passportOrNull} showImpact={false} />,
    })
    items.push({
      id: 'impact',
      label: drawers.tabs.impact,
      panel: <PassportImpact passport={passportOrNull} />,
    })
  }
  return items
}

const openDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
  return screen.getByRole('dialog', { name: drawers.details.heading })
}

// ---------------------------------------------------------------------------

describe('ProductDrawers', () => {
  it('shows both triggers, with no panel content until one is clicked', () => {
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    expect(screen.getByRole('button', { name: drawers.details.trigger })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: drawers.delivery.trigger })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('opens with four tabs when there is a passport', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    expect(within(panel).getAllByRole('tab')).toHaveLength(4)
    for (const label of Object.values(drawers.tabs)) {
      expect(within(panel).getByRole('tab', { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it('drops the passport and impact tabs when there is no passport', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withoutPassport, null)} />)
    const panel = await openDetails(user)

    // Two tabs, not four with empty panels. An absence that is drawn is still a
    // claim, and there is nothing to claim about a garment with no passport.
    expect(within(panel).getAllByRole('tab')).toHaveLength(2)
    expect(within(panel).queryByRole('tab', { name: new RegExp(drawers.tabs.passport) })).toBeNull()
  })

  it('opens on the specification and renders only that panel', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    expect(within(panel).getByText(drawers.details.sections.measurements)).toBeInTheDocument()
    // Inactive panels are unmounted, not hidden — four panels of hidden content
    // in the DOM on every product page would be the wrong trade here.
    expect(within(panel).queryAllByRole('tabpanel')).toHaveLength(1)
    expect(within(panel).queryByText('Owners')).toBeNull()
  })

  it('switches panels on click', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    await user.click(within(panel).getByRole('tab', { name: new RegExp(drawers.tabs.passport) }))
    expect(within(panel).getByText('Owners')).toBeInTheDocument()
    expect(within(panel).queryByText(drawers.details.sections.measurements)).toBeNull()
  })

  it('moves between tabs with the arrow keys, and keeps only one in the tab order', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    const tabs = within(panel).getAllByRole('tab')
    // Only the selected tab is reachable by Tab, so a keyboard user does not
    // have to press it four times to get past the set.
    expect(tabs.filter((tab) => tab.getAttribute('tabindex') === '0')).toHaveLength(1)

    tabs[0]?.focus()
    await user.keyboard('{ArrowRight}')
    expect(tabs[1]).toHaveFocus()
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{End}')
    expect(tabs[tabs.length - 1]).toHaveFocus()

    await user.keyboard('{Home}')
    expect(tabs[0]).toHaveFocus()
  })

  it('wraps around at the ends', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)
    const tabs = within(panel).getAllByRole('tab')

    tabs[0]?.focus()
    await user.keyboard('{ArrowLeft}')
    expect(tabs[tabs.length - 1]).toHaveFocus()
  })

  it('wires each tab to its panel in both directions', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    const selected = within(panel)
      .getAllByRole('tab')
      .find((tab) => tab.getAttribute('aria-selected') === 'true')
    const tabpanel = within(panel).getByRole('tabpanel')
    expect(selected?.getAttribute('aria-controls')).toBe(tabpanel.id)
    expect(tabpanel.getAttribute('aria-labelledby')).toBe(selected?.id)
  })

  it('closes on Escape and on the X', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)

    let panel = await openDetails(user)
    await user.keyboard('{Escape}')
    expect(panel.closest('[aria-hidden="true"]')).not.toBeNull()

    panel = await openDetails(user)
    await user.click(within(panel).getByRole('button', { name: drawers.close }))
    expect(panel.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('opens only one drawer at a time', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)

    const panel = await openDetails(user)
    await user.click(within(panel).getByRole('button', { name: drawers.close }))
    await user.click(screen.getByRole('button', { name: drawers.delivery.trigger }))

    expect(
      screen
        .getByRole('dialog', { name: drawers.delivery.heading })
        .closest('[aria-hidden="false"]'),
    ).not.toBeNull()
    expect(panel.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------

describe('specification panel', () => {
  it('carries measurements, product code, composition and origin', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    expect(within(panel).getByText('centimetres, taken flat')).toBeInTheDocument()
    expect(within(panel).getByText('78')).toBeInTheDocument()
    expect(within(panel).getByText(withPassport.sku)).toBeInTheDocument()
    expect(within(panel).getByText('Cotton')).toBeInTheDocument()
    expect(within(panel).getByText('99%')).toBeInTheDocument()
    expect(within(panel).getByText(drawers.details.sections.origin)).toBeInTheDocument()
  })

  it('draws the composition as a ring and says when it widened a slice', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    expect(panel.querySelector('svg circle')).not.toBeNull()
    // A 1% slice is 3.6 degrees and invisible, so it is widened and the chart
    // says so. The legend carries the real number.
    expect(within(panel).getByText('1%')).toBeInTheDocument()
    expect(within(panel).getByText(/Smallest shares widened/)).toBeInTheDocument()
  })

  it('draws care as symbols but keeps the words', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    // An unlabelled care symbol is unreadable to most people, which is a large
    // part of why garments get ruined. The glyph buys the scan; the text keeps
    // the meaning. What it saves is the vertical stack.
    for (const instruction of passport.careInstructions) {
      expect(within(panel).getByText(instruction.label)).toBeInTheDocument()
    }
  })

  it('says composition and care are unknown rather than showing blank sections', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withoutPassport, null)} />)
    const panel = await openDetails(user)

    expect(within(panel).getByText(drawers.details.materialsUnknown)).toBeInTheDocument()
    expect(within(panel).getByText(drawers.details.careUnknown)).toBeInTheDocument()
  })

  it('does not repeat the inspector prose that the condition tab shows', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    expect(within(panel).queryByText(withPassport.conditionNotes ?? '')).toBeNull()
  })
})

describe('condition and impact panels', () => {
  it('puts the flaw disclosure in the condition tab, with its photographs', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    await user.click(within(panel).getByRole('tab', { name: new RegExp(drawers.tabs.condition) }))
    for (const flaw of withPassport.flaws) {
      expect(within(panel).getByText(flaw.description)).toBeInTheDocument()
      expect(within(panel).getByText(flaw.location)).toBeInTheDocument()
    }
  })

  it('never shows an impact figure without its source', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    const panel = await openDetails(user)

    await user.click(within(panel).getByRole('tab', { name: new RegExp(drawers.tabs.impact) }))
    expect(within(panel).getByText('litres of water')).toBeInTheDocument()
    // The study and year are on the face of it; the full methodology is behind
    // the disclosure.
    expect(within(panel).getByText(/how this is calculated/)).toBeInTheDocument()
  })

  it('explains an absent impact figure rather than showing an empty panel', async () => {
    const nicobar = passports.find((p) => p.impact === undefined)!
    const user = userEvent.setup()
    render(
      <ProductDrawers
        tabs={[
          {
            id: 'impact',
            label: drawers.tabs.impact,
            panel: <PassportImpact passport={nicobar} />,
          },
        ]}
      />,
    )
    const panel = await openDetails(user)
    expect(within(panel).getByText(/no defensible basis/)).toBeInTheDocument()
  })
})

describe('delivery drawer', () => {
  it('keeps its copy provisional rather than promising a courier', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers tabs={tabsFor(withPassport, passport)} />)
    await user.click(screen.getByRole('button', { name: drawers.delivery.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.delivery.heading })

    expect(within(panel).getByText(drawers.delivery.deliveryBody)).toBeInTheDocument()
    expect(panel.textContent).not.toMatch(/guaranteed|delivered by \w+day/i)
  })
})
