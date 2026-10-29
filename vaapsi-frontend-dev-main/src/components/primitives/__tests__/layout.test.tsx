import { render } from '@testing-library/react'
import { Col, Container, Grid, Row, Rule, Stack } from '../layout'

const classesOf = (container: HTMLElement) => container.firstElementChild?.className ?? ''

describe('Container', () => {
  it('caps width by default and drops the cap when wide', () => {
    const { container: def } = render(<Container>x</Container>)
    expect(classesOf(def)).toContain('max-w-container')

    const { container: wide } = render(<Container variant="wide">x</Container>)
    expect(classesOf(wide)).not.toContain('max-w-container')
  })

  it('always applies the gutter token', () => {
    const { container } = render(<Container variant="wide">x</Container>)
    expect(classesOf(container)).toContain('px-gutter')
  })
})

describe('Grid', () => {
  it('is 4 / 8 / 12 columns across the breakpoints', () => {
    const { container } = render(<Grid>x</Grid>)
    const className = classesOf(container)
    expect(className).toContain('grid-cols-4')
    expect(className).toContain('tablet:grid-cols-8')
    expect(className).toContain('desktop:grid-cols-12')
  })

  it('emits a static row-gap class rather than one built at runtime', () => {
    const { container } = render(<Grid rowGap="loose">x</Grid>)
    const className = classesOf(container)
    // A class assembled at runtime would produce no CSS, because Tailwind
    // scans source text. This asserts the spelled-out map is being used.
    expect(className).toContain('gap-y-6')
    expect(className).toContain('desktop:gap-y-10')
  })
})

describe('Col', () => {
  it('spans the full width on mobile by default', () => {
    const { container } = render(<Col>x</Col>)
    expect(classesOf(container)).toContain('col-span-4')
  })

  it('takes a span per breakpoint', () => {
    const { container } = render(
      <Col mobile={2} tablet={4} desktop={6}>
        x
      </Col>,
    )
    const className = classesOf(container)
    expect(className).toContain('col-span-2')
    expect(className).toContain('tablet:col-span-4')
    expect(className).toContain('desktop:col-span-6')
  })

  it('clamps a tablet span above 8 rather than emitting an invalid class', () => {
    const { container } = render(<Col tablet={12}>x</Col>)
    // Tablet is an 8-column grid. col-span-12 there would silently overflow.
    expect(classesOf(container)).toContain('tablet:col-span-8')
    expect(classesOf(container)).not.toContain('tablet:col-span-12')
  })

  it('offsets on desktop only', () => {
    const { container } = render(<Col startDesktop={5}>x</Col>)
    const className = classesOf(container)
    expect(className).toContain('desktop:col-start-5')
    expect(className).not.toMatch(/(^|\s)col-start-/)
  })
})

describe('Stack and Row', () => {
  it('only take gaps from the scale', () => {
    const { container } = render(<Stack gap={8}>x</Stack>)
    expect(classesOf(container)).toContain('gap-8')
  })

  it('stacks vertically and rows horizontally', () => {
    expect(classesOf(render(<Stack>x</Stack>).container)).toContain('flex-col')
    expect(classesOf(render(<Row>x</Row>).container)).not.toContain('flex-col')
  })

  it('wraps rows by default, because a row that cannot wrap breaks on a phone', () => {
    expect(classesOf(render(<Row>x</Row>).container)).toContain('flex-wrap')
    expect(classesOf(render(<Row wrap={false}>x</Row>).container)).toContain('flex-nowrap')
  })

  it('renders the requested semantic element', () => {
    const { container } = render(<Stack as="ul">x</Stack>)
    expect(container.firstElementChild?.tagName).toBe('UL')
  })
})

describe('Rule', () => {
  it('is a hairline from the line token', () => {
    const { container } = render(<Rule />)
    const rule = container.firstElementChild
    expect(rule?.tagName).toBe('HR')
    expect(rule?.className).toContain('border-line')
    expect(rule?.className).toContain('border-t')
  })
})
