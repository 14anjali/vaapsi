import { render, screen } from '@testing-library/react'
import { Price } from '../price'
import { ProductCard } from '../product-card'
import { conditionCopy } from '@/content/product'
import type { ProductImage, ProductSummary } from '@/lib/types'

const primary: ProductImage = {
  id: 'img_1',
  url: 'https://picsum.photos/seed/a/1200/1600',
  alt: 'A navy sweater, flat',
  kind: 'primary',
  aspectRatio: 0.75,
}

const detail: ProductImage = {
  id: 'img_2',
  url: 'https://picsum.photos/seed/b/1200/1600',
  alt: 'Ribbed cuff',
  kind: 'detail',
  aspectRatio: 0.75,
}

function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'prd_1',
    slug: 'a-navy-sweater',
    title: 'Merino Crewneck',
    brand: 'Uniqlo',
    category: 'knitwear',
    subcategory: 'Crewneck',
    listingType: 'pre_loved',
    gender: 'unisex',
    condition: 'very_good',
    color: { slug: 'navy', name: 'Navy', hex: '#25314f' },
    colorVariants: [],
    composition: '100% merino wool',
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: 69_000,
    originalRetailInr: 299_000,
    currency: 'INR',
    availability: 'available',
    passportId: 'psp_1',
    primaryImage: primary,
    ...overrides,
  }
}

describe('ProductCard', () => {
  it('links to the product, and names it for a screen reader', () => {
    render(<ProductCard product={product()} />)
    // The card link is a stretched overlay with no visible text of its own, so
    // its accessible name has to carry the facts a shopper is choosing between.
    const link = screen.getByRole('link', {
      name: /Merino Crewneck, Crewneck, size M, Navy/,
    })
    expect(link).toHaveAttribute('href', '/product/a-navy-sweater')
  })

  it('states the facts a shopper chooses on: size, composition and price', () => {
    render(<ProductCard product={product()} />)
    expect(screen.getByText('₹690')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('100% merino wool')).toBeInTheDocument()
  })

  it('does not name a colour, since the swatches show what is available', () => {
    render(<ProductCard product={product()} />)
    // Naming one colour described a default rather than the offer, and on a
    // catalogue of blue denim it duplicated the swatch row beside it.
    expect(screen.queryByText('Navy')).toBeNull()
  })

  it('shows a size span for stock that has several, not a default size', () => {
    const size = (label: string, normalized: string) => ({
      label,
      system: 'IN' as const,
      normalized,
    })
    render(
      <ProductCard
        product={product({
          listingType: 'new',
          condition: null,
          size: size('W30', 'w30'),
          colorVariants: [
            {
              color: { slug: 'raw', name: 'Raw indigo', hex: '#2b3a55' },
              sizes: [size('W28', 'w28'), size('W30', 'w30'), size('W32', 'w32')],
              availability: 'available',
              priceInr: null,
              images: [],
            },
          ],
        })}
      />,
    )
    expect(screen.getByText('W28–W32')).toBeInTheDocument()
    // W30 alone was whichever size happened to be the product's default.
    expect(screen.queryByText('W30', { exact: true })).toBeNull()
  })

  it('keeps the single size on a one-of-one garment', () => {
    render(<ProductCard product={product()} />)
    // Not a default — the only one there is.
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it("shows the garment's name once, and nothing that repeats it", () => {
    render(<ProductCard product={product()} />)
    // Every listing is Vaapsi, so a brand heading distinguishes nothing — and
    // "Crewneck" under "Merino Crewneck" is the name again with a word removed.
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Merino Crewneck')
    expect(screen.queryByText('Uniqlo')).toBeNull()
    expect(screen.queryByText('Crewneck', { exact: true })).toBeNull()
  })

  it('states what it is made of', () => {
    render(<ProductCard product={product()} />)
    // A fact a shopper cannot infer from the photograph, and one they choose on.
    expect(screen.getByText('100% merino wool')).toBeInTheDocument()
  })

  it('grades a pre-loved garment', () => {
    render(<ProductCard product={product()} />)
    expect(screen.getByText(conditionCopy.very_good.label)).toBeInTheDocument()
  })

  it('shows no grade on new stock, which has no wear to grade', () => {
    render(<ProductCard product={product({ listingType: 'new', condition: null })} />)
    for (const grade of Object.values(conditionCopy)) {
      expect(screen.queryByText(grade.label)).toBeNull()
    }
  })

  it('shows the price with original retail struck through', () => {
    const { container } = render(<ProductCard product={product()} />)
    expect(screen.getByText('₹690')).toBeInTheDocument()
    const struck = container.querySelector('s')
    expect(struck).toHaveTextContent('₹2,990')
  })

  it('shows no strike-through when original retail is unknown', () => {
    const { container } = render(<ProductCard product={product({ originalRetailInr: null })} />)
    expect(container.querySelector('s')).toBeNull()
  })

  it('keeps a sold garment visible, desaturated, with Sold in place of the price', () => {
    const { container } = render(<ProductCard product={product({ availability: 'sold' })} />)
    // Still a link — a sold garment still has a passport worth reading.
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByText('Sold')).toBeInTheDocument()
    expect(screen.queryByText('₹690')).toBeNull()
    expect(container.querySelector('img')?.className).toContain('saturate-0')
  })

  it('does not mark a reserved garment on the card', () => {
    render(<ProductCard product={product({ availability: 'reserved' })} />)
    // Still purchasable if the other shopper abandons. Flagging it here would be
    // wrong within the minute, or read as a scarcity trick.
    expect(screen.queryByText(/reserved/i)).toBeNull()
    expect(screen.getByText('₹690')).toBeInTheDocument()
  })

  it('renders a second image for the hover cross-fade only when given one', () => {
    const { container: without } = render(<ProductCard product={product()} />)
    expect(without.querySelectorAll('img')).toHaveLength(1)

    const { container: withDetail } = render(
      <ProductCard product={product()} detailImage={detail} />,
    )
    expect(withDetail.querySelectorAll('img')).toHaveLength(2)
    // The hover image is decorative — the primary already describes the garment.
    expect(withDetail.querySelectorAll('img')[1]).toHaveAttribute('alt', '')
  })

  it('never adds a shadow or a lift on hover', () => {
    const { container } = render(<ProductCard product={product()} detailImage={detail} />)
    const html = container.innerHTML
    expect(html).not.toMatch(/hover:shadow/)
    expect(html).not.toMatch(/hover:-translate-y/)
    expect(html).not.toMatch(/hover:scale/)
  })
})

describe('Price', () => {
  it('floors the saving and only shows it when asked', () => {
    render(
      <Price priceInr={6_700} originalRetailInr={10_000} availability="available" showSaving />,
    )
    expect(screen.getByText('33% less')).toBeInTheDocument()
  })

  it('never invents a saving without an original price', () => {
    render(<Price priceInr={6_700} originalRetailInr={null} availability="available" showSaving />)
    expect(screen.queryByText(/less/)).toBeNull()
  })

  it('replaces the whole price with Sold, not a struck-through price', () => {
    const { container } = render(
      <Price priceInr={6_700} originalRetailInr={10_000} availability="sold" />,
    )
    expect(screen.getByText('Sold')).toBeInTheDocument()
    expect(container.querySelector('s')).toBeNull()
  })
})
