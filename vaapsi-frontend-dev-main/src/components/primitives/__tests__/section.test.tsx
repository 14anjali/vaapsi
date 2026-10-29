import { render, screen } from '@testing-library/react'
import { Section } from '../section'

const classesOf = (container: HTMLElement) => container.firstElementChild?.className ?? ''

describe('Section', () => {
  it('takes its vertical rhythm from the token, never a literal', () => {
    // The whole point of this primitive: density is one token, not eight
    // hardcoded values that drift apart.
    expect(classesOf(render(<Section>x</Section>).container)).toContain('py-section')
    expect(classesOf(render(<Section space="tight">x</Section>).container)).toContain(
      'py-section-tight',
    )
  })

  it('adds no padding at all when flush', () => {
    const className = classesOf(render(<Section space="flush">x</Section>).container)
    expect(className).not.toMatch(/py-/)
  })

  it('renders a section landmark labelled by its own heading', () => {
    render(<Section heading="New in">x</Section>)
    const heading = screen.getByRole('heading', { level: 2, name: 'New in' })
    const section = heading.closest('section')
    expect(section).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.id).not.toBe('')
  })

  it('has no accessible name when it has no heading', () => {
    // A section labelled by nothing should not claim to be labelled.
    const { container } = render(<Section>x</Section>)
    expect(container.firstElementChild).not.toHaveAttribute('aria-labelledby')
  })

  it('accepts an explicit id, so a caller can point at it', () => {
    render(
      <Section heading="Condition" id="condition-block">
        x
      </Section>,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'condition-block')
  })

  it('renders the eyebrow, heading, lede and action together', () => {
    render(
      <Section
        eyebrow="Browse"
        heading="By category"
        lede="Six things"
        action={<a href="/shop">All</a>}
      >
        body
      </Section>,
    )
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'By category' })).toBeInTheDocument()
    expect(screen.getByText('Six things')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('can be an h3 for a subsection, so heading levels never skip', () => {
    render(
      <Section heading="Identifiers" headingAs="h3">
        x
      </Section>,
    )
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('groups with a fill or a rule instead of with space', () => {
    expect(classesOf(render(<Section tone="surface">x</Section>).container)).toContain('bg-surface')
    expect(classesOf(render(<Section divider>x</Section>).container)).toContain('border-t')
  })

  it('wraps in a container by default and skips it when bleeding', () => {
    const { container: contained } = render(<Section>x</Section>)
    expect(contained.querySelector('.max-w-container')).not.toBeNull()

    const { container: bleeding } = render(<Section bleed>x</Section>)
    expect(bleeding.querySelector('.max-w-container')).toBeNull()
  })
})
