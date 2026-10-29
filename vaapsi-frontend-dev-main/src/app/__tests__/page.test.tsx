import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudienceTiles } from '@/components/patterns/home/audience-tiles'
import { CategoryGrid } from '@/components/patterns/home/category-grid'
import { HeroTiles } from '@/components/patterns/home/hero-tiles'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { home } from '@/content/home'
import { listProducts } from '@/lib/data'

/**
 * The three tiles that replaced the hero carousel.
 *
 * What matters here is that the set stays a real choice and stays reachable: one
 * link per tile pointing where the copy says, a heading for the document, and an
 * alt text on every photograph. The old carousel's tests covered rotation,
 * pausing and frame announcement — none of which exists any more, by design.
 */
describe('HeroTiles', () => {
  it('gives the page an h1 even though the tiles carry the visible type', () => {
    render(<HeroTiles />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(home.heroTiles.heading)
    expect(heading.className).toContain('sr-only')
  })

  it('renders exactly three tiles, each a link to where its copy says', () => {
    render(<HeroTiles />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    for (const tile of home.heroTiles.tiles) {
      expect(screen.getByRole('link', { name: new RegExp(tile.title) })).toHaveAttribute(
        'href',
        tile.href,
      )
    }
  })

  it('titles each tile as an h2 under the page heading', () => {
    render(<HeroTiles />)
    for (const tile of home.heroTiles.tiles) {
      expect(screen.getByRole('heading', { level: 2, name: tile.title })).toBeInTheDocument()
    }
  })

  it('describes every photograph', () => {
    render(<HeroTiles />)
    for (const tile of home.heroTiles.tiles) {
      expect(screen.getByAltText(tile.image.alt)).toBeInTheDocument()
    }
  })
})

/**
 * The audience split, between the rail and the category grid.
 *
 * The two things worth guarding: the links have to actually resolve — they
 * point at `/shop/women` and `/shop/men`, which 404'd for most of this
 * project's life — and there must be no third tile, because `unisex` means
 * "appears under both" rather than "a third department".
 */
describe('AudienceTiles', () => {
  it('splits the catalogue in two, and only two', () => {
    render(<AudienceTiles />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.queryByRole('link', { name: /unisex/i })).toBeNull()
  })

  it('points each half where its copy says', () => {
    render(<AudienceTiles />)
    for (const item of home.audience.items) {
      expect(screen.getByRole('link', { name: new RegExp(item.label) })).toHaveAttribute(
        'href',
        item.href,
      )
    }
  })

  it('says out loud that the two halves overlap', () => {
    // A straight-cut garment is in both listings. Letting a shopper discover
    // that by seeing the same jacket twice is worse than one line of copy.
    render(<AudienceTiles />)
    expect(screen.getByText(home.audience.note)).toBeInTheDocument()
  })

  it('titles each half under the section heading, not as another h2', () => {
    render(<AudienceTiles />)
    for (const item of home.audience.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.label })).toBeInTheDocument()
    }
  })

  it('describes both photographs', () => {
    render(<AudienceTiles />)
    for (const item of home.audience.items) {
      expect(screen.getByAltText(item.image.alt)).toBeInTheDocument()
    }
  })
})

/**
 * The category grid.
 *
 * These images used to be `picsum.photos` landscapes — a Scottish hillside
 * under "Jackets". The test that matters is that every cell now carries a real
 * file from this repo, because the failure mode of the old version was a page
 * that looked finished and said nothing.
 */
describe('CategoryGrid', () => {
  it('uses photography from this repo, not a placeholder service', () => {
    render(<CategoryGrid />)
    for (const item of home.categories.items) {
      expect(item.image.startsWith('/')).toBe(true)
      expect(item.image).not.toContain('picsum')
    }
  })

  it('leaves the photographs decorative, so a tile is not read twice', () => {
    // The link already announces "Jackets, truckers and chore coats".
    const { container } = render(<CategoryGrid />)
    for (const img of Array.from(container.querySelectorAll('img'))) {
      expect(img).toHaveAttribute('alt', '')
    }
  })

  it('links every category where its copy says', () => {
    render(<CategoryGrid />)
    for (const item of home.categories.items) {
      expect(screen.getByRole('link', { name: new RegExp(item.label) })).toHaveAttribute(
        'href',
        item.href,
      )
    }
  })
})

describe('NewInRail', () => {
  async function recent() {
    return (await listProducts({ sort: 'newest', limit: 6 })).items
  }

  it('gives the rail arrows as well as a scrollbar', async () => {
    // Shift-scroll is not something most people know, and a scrollbar under a
    // row of images is not an inviting control.
    render(<NewInRail products={await recent()} />)
    expect(screen.getByRole('button', { name: home.newIn.previous })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: home.newIn.next })).toBeInTheDocument()
  })

  it('leaves the rail to the arrows alone', async () => {
    // No "See everything" beside them. The footer and the header both reach the
    // shop, and a third route out sitting next to the two controls that move
    // the rail made it ambiguous which one advanced it.
    render(<NewInRail products={await recent()} />)
    expect(screen.queryByRole('link', { name: new RegExp(home.newIn.cta, 'i') })).toBeNull()
  })

  it('holds the arrows against the right edge even when the header wraps', async () => {
    // `justify-between` alone puts a lone wrapped item at the start of its
    // line, which silently turns a right-aligned control into a left-aligned
    // one at exactly the widths where the heading and lede are longest.
    render(<NewInRail products={await recent()} />)
    const controls = screen.getByRole('button', { name: home.newIn.next }).parentElement!
    expect(controls.parentElement?.className).toContain('ml-auto')
  })

  it('ends the arrows on the rail edge, not the container edge', async () => {
    // The rail bleeds a gutter past the container, so controls sitting inside
    // the container stop short of the images they steer. Both edges have to
    // come off the same token or they drift apart at some breakpoint.
    render(<NewInRail products={await recent()} />)
    const controls = screen.getByRole('button', { name: home.newIn.next }).parentElement!
    const rail = screen.getByRole('list', { name: home.newIn.railLabel })
    expect(controls.className).toContain('-mr-gutter')
    expect(rail.className).toContain('-mx-gutter')
  })

  it('disables back at the start rather than wrapping', async () => {
    // This is a scroll position, not a carousel. A rail that silently jumps to
    // the start loses the reader's place.
    render(<NewInRail products={await recent()} />)
    expect(screen.getByRole('button', { name: home.newIn.previous })).toBeDisabled()
  })

  it('scrolls the rail rather than reimplementing it', async () => {
    const products = await recent()
    render(<NewInRail products={products} />)
    const rail = screen.getByRole('list', { name: home.newIn.railLabel })
    const scrollBy = jest.fn()
    rail.scrollBy = scrollBy
    // jsdom lays nothing out, so clientWidth is 0 and the rail reports itself
    // fully scrolled — forcing a width is what makes the button live.
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 800 })
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 3000 })
    rail.dispatchEvent(new Event('scroll', { bubbles: true }))
    await userEvent.click(screen.getByRole('button', { name: home.newIn.next }))
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    expect(scrollBy.mock.calls[0]![0].left).toBeGreaterThan(0)
  })

  it('renders nothing rather than an empty rail', () => {
    const { container } = render(<NewInRail products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
