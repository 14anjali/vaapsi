import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen, within } from '@testing-library/react'
import PreLovedPage from '../pre-loved/page'
import { preLoved } from '@/content/pre-loved'
import { primaryNav } from '@/content/navigation'
import { conditionCopy } from '@/content/product'

expect.extend(toHaveNoViolations)

/**
 * The listing is an async server component with its own tests, and React's test
 * renderer cannot render one synchronously — it takes the worker down rather
 * than failing. Stubbed so these tests stay about the page's own argument: the
 * pitch, the four steps, the intake rules and the honest CTA.
 */
jest.mock('@/components/patterns/shop/shop-view', () => ({
  ShopView: ({ title }: { title: string }) => <h2>{title}</h2>,
}))

/**
 * The seller entry point.
 *
 * The assertions worth having here are not "the copy is on the page" — they are
 * the two things that would quietly go wrong. First, that the page keeps saying
 * seller accounts do not exist yet, because the failure mode is someone
 * replacing the honest note with a disabled form and shipping a page that looks
 * finished. Second, that the nav item and the route stay pointed at each other.
 */

describe('PreLovedPage', () => {
  /**
   * An async server component, so it is awaited and the resulting element is
   * rendered. `renderPage` exists so the await is in one place — six tests each
   * doing it by hand is six chances to forget.
   */
  async function renderPage() {
    // The page is synchronous now; the listing inside it is a separate async
    // component that these tests do not render. What is asserted here is the
    // page's own argument — the pitch, the steps, the honest CTA.
    return render(PreLovedPage({ searchParams: {} }))
  }

  it('is reachable from the primary nav', () => {
    const item = primaryNav.find((entry) => entry.href === '/pre-loved')
    expect(item).toBeDefined()
    expect(item?.label).toBe(preLoved.eyebrow)
  })

  it('leads with what the page is for, as the h1', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(preLoved.title)
  })

  it('says plainly that selling is not open yet, and never fakes a sign-in', async () => {
    await renderPage()
    expect(screen.getByText(preLoved.cta.notBuiltTitle)).toBeInTheDocument()
    expect(screen.getByText(preLoved.cta.phase)).toBeInTheDocument()
    // No credential fields anywhere. The grid below has bag buttons, so this
    // checks for the shape of a sign-in form rather than for buttons in general.
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByLabelText(/email|password|phone/i)).toBeNull()
    expect(document.querySelector('form')).toBeNull()
    expect(document.querySelector('input')).toBeNull()
  })

  it('sends a would-be seller somewhere real instead of a dead end', async () => {
    await renderPage()
    const link = screen.getByRole('link', { name: preLoved.cta.notBuiltAction })
    expect(link).toHaveAttribute('href', preLoved.cta.notBuiltHref)
  })

  it('numbers the selling steps in order, as an ordered list', async () => {
    await renderPage()
    // An <ol>, because the order carries meaning — this is a sequence.
    const ordered = document.querySelector('ol')
    expect(ordered).not.toBeNull()
    expect(within(ordered as HTMLElement).getAllByRole('listitem')).toHaveLength(
      preLoved.how.steps.length,
    )
    for (const step of preLoved.how.steps) {
      expect(screen.getByRole('heading', { name: step.verb })).toBeInTheDocument()
    }
  })

  it('gives a reason beside everything it declines', async () => {
    await renderPage()
    for (const clause of preLoved.accepts.no) {
      expect(screen.getByText(clause)).toBeInTheDocument()
    }
  })

  it('gives the pre-loved listing a heading of its own', async () => {
    await renderPage()
    // Which garments appear, and that condition filters live here rather than
    // on the New listing, are `ShopView`'s and the adapter's tests.
    expect(screen.getByRole('heading', { name: preLoved.grid.title })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<main>{PreLovedPage({ searchParams: {} })}</main>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
