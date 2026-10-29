import { render, screen } from '@testing-library/react'
import { Eyebrow, TYPE_SIZES, Type } from '../type'

describe('Type', () => {
  it('renders a paragraph by default', () => {
    render(<Type>Body copy</Type>)
    expect(screen.getByText('Body copy').tagName).toBe('P')
  })

  it('renders the requested element', () => {
    render(<Type as="h2">Heading</Type>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('resolves every size in the scale to a class', () => {
    for (const size of TYPE_SIZES) {
      const { container, unmount } = render(<Type size={size}>x</Type>)
      expect(container.firstElementChild?.className).toContain(`text-${size}`)
      unmount()
    }
  })

  it('applies family, weight and tone as token classes', () => {
    const { container } = render(
      <Type family="display" weight="heading" tone="accent">
        x
      </Type>,
    )
    const className = container.firstElementChild?.className ?? ''
    expect(className).toContain('font-display')
    expect(className).toContain('font-heading')
    expect(className).toContain('text-accent')
  })

  it('leaves colour alone when tone is inherit', () => {
    const { container } = render(<Type tone="inherit">x</Type>)
    expect(container.firstElementChild?.className).not.toMatch(/text-ink/)
  })

  it('constrains to a measure only when asked', () => {
    const { container: none } = render(<Type>x</Type>)
    expect(none.firstElementChild?.className).not.toContain('max-w-measure')

    const { container: narrow } = render(<Type measure="narrow">x</Type>)
    expect(narrow.firstElementChild?.className).toContain('max-w-measure-narrow')
  })

  it('sets tabular figures for numeric content', () => {
    const { container } = render(<Type numeric>₹1,20,000</Type>)
    expect(container.firstElementChild?.className).toContain('tabular-nums')
  })

  it('never emits a raw font-size or font-family style', () => {
    const { container } = render(<Type size="4xl">x</Type>)
    expect(container.firstElementChild?.getAttribute('style')).toBeNull()
  })
})

describe('Eyebrow', () => {
  it('is uppercase with caps tracking', () => {
    const { container } = render(<Eyebrow>New in</Eyebrow>)
    const className = container.firstElementChild?.className ?? ''
    expect(className).toContain('uppercase')
    expect(className).toContain('tracking-caps')
    expect(className).toContain('text-xs')
  })

  it('can be a heading when it labels a section', () => {
    render(<Eyebrow as="h2">Shop</Eyebrow>)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Shop')
  })
})
