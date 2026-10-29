import { render, screen, within } from '@testing-library/react'
import { PassportStory } from '../passport/story'
import { JourneyLine } from '../passport/journey-line'
import { ProvenanceDot, ProvenanceLegend, SourcedValue } from '../passport/provenance-dot'
import { Seal } from '../passport/seal'
import { passportCopy } from '@/content/passport'
import { passports } from '@/lib/data/fixtures/passports'
import type { Provenance } from '@/lib/types'

const ALL: Provenance[] = ['verified', 'supplier', 'self_declared', 'ai_extracted', 'ai_suggested']

const levis = passports.find((p) => p.id === 'psp_levis_501_indigo')
const nicobar = passports.find((p) => p.id === 'psp_nicobar_chambray_shirtdress')
const cos = passports.find((p) => p.id === 'psp_acne_denim_maxi_skirt')

describe('ProvenanceDot', () => {
  it('gives every provenance a distinct mark', () => {
    const shapes = ALL.map((provenance) => {
      const { container } = render(<ProvenanceDot provenance={provenance} />)
      return container.querySelector('svg')?.innerHTML ?? ''
    })
    expect(new Set(shapes).size).toBe(ALL.length)
  })

  it('encodes by fill and stroke only — never by colour', () => {
    for (const provenance of ALL) {
      const { container } = render(<ProvenanceDot provenance={provenance} />)
      const svg = container.querySelector('svg')
      // Everything paints with currentColor, so the mark survives greyscale,
      // the inverse theme, and being photocopied onto a care label.
      expect(svg?.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i)
      expect(svg?.innerHTML).not.toMatch(/rgb|hsl/i)
      expect(svg?.innerHTML).toContain('currentColor')
    }
  })

  it('distinguishes the two AI marks from each other and from self-declared', () => {
    const html = (provenance: Provenance) =>
      render(<ProvenanceDot provenance={provenance} />).container.innerHTML

    expect(html('ai_extracted')).toContain('stroke-dasharray')
    expect(html('ai_suggested')).toContain('stroke-dasharray')
    expect(html('ai_extracted')).not.toBe(html('ai_suggested'))
    expect(html('self_declared')).not.toContain('stroke-dasharray')
  })

  it('is labelled for a screen reader', () => {
    render(<ProvenanceDot provenance="verified" />)
    expect(screen.getByRole('img', { name: passportCopy.provenance.verified })).toBeInTheDocument()
  })
})

describe('SourcedValue', () => {
  it('puts the value before the mark, so the fact reads first', () => {
    const { container } = render(<SourcedValue value="India" provenance="supplier" />)
    const text = container.textContent ?? ''
    expect(text.startsWith('India')).toBe(true)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('ProvenanceLegend', () => {
  it('explains all five marks', () => {
    render(<ProvenanceLegend />)
    for (const provenance of ALL) {
      expect(screen.getByText(passportCopy.provenance[provenance])).toBeInTheDocument()
    }
  })
})

describe('Seal', () => {
  it('is present with no animation when motion is reduced', () => {
    // useReducedMotion starts at true, so the first render is the settled state.
    const { container } = render(<Seal label="Verified by Vaapsi Studio" />)
    expect(screen.getByText('Verified by Vaapsi Studio')).toBeInTheDocument()
    expect(container.querySelector('.bg-accent')).not.toBeNull()
  })
})

describe('JourneyLine', () => {
  it('renders every event, in order, in both layouts', () => {
    expect(levis).toBeDefined()
    const { container } = render(<JourneyLine chain={levis!.chain} />)
    // Two lists: the vertical mobile one and the horizontal desktop one.
    const lists = container.querySelectorAll('ol')
    expect(lists).toHaveLength(2)
    for (const list of Array.from(lists)) {
      expect(list.querySelectorAll('li')).toHaveLength(levis!.chain.length)
    }
  })

  it('still attributes every event, collected once instead of repeated inline', () => {
    render(<JourneyLine chain={levis!.chain} />)
    // The verification sentences moved out of each event and into one
    // disclosure. Every event is still accounted for — the honesty is intact,
    // the repetition is not. "Stated by the owner at intake" appeared three
    // times on one passport before this.
    for (const event of levis!.chain) {
      expect(screen.getAllByText(event.verification.value).length).toBeGreaterThan(0)
    }
    expect(screen.getByText('How each step was verified')).toBeInTheDocument()
  })

  it('carries the confidence on the rail, not as a sentence per event', () => {
    const { container } = render(<JourneyLine chain={levis!.chain} />)
    // One provenance mark per event per layout, plus one per row in the
    // disclosure. What matters is that the marks are there and the inline
    // italic sentences are gone.
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(levis!.chain.length)
    expect(container.querySelectorAll('.italic')).toHaveLength(0)
  })

  it('renders nothing for an empty chain', () => {
    const { container } = render(<JourneyLine chain={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('PassportStory', () => {
  it('leads with a summary strip a reader can take instead of the timeline', () => {
    render(<PassportStory passport={levis!} />)
    // Owners, authentication and the voluntary status were sentences scattered
    // across three sections. They are now one scannable line.
    expect(screen.getByText('Owners')).toBeInTheDocument()
    expect(screen.getByText('Inspected in house')).toBeInTheDocument()
    expect(screen.getByText('Published by choice')).toBeInTheDocument()
  })

  it('states the owner count in words as well as in a chip', () => {
    render(<PassportStory passport={levis!} />)
    expect(screen.getByText('One owner before you')).toBeInTheDocument()
  })

  it('counts repairs and returns as chips when there are any', () => {
    const bag = passports.find((p) => p.id === 'psp_diesel_denim_shoulder_bag')!
    render(<PassportStory passport={bag} />)
    expect(screen.getByText('Repairs')).toBeInTheDocument()
    // "Returns", not "Came back" — the timeline uses that phrase for the event.
    expect(screen.getByText('Returns')).toBeInTheDocument()
  })

  it('marks a passport nobody has authenticated', () => {
    render(<PassportStory passport={nicobar!} />)
    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })

  it('never shows an impact number without its basis', () => {
    render(<PassportStory passport={levis!} />)
    expect(screen.getByText(levis!.impact!.basis)).toBeInTheDocument()
  })

  it('renders a passport with no impact block at all, without a gap', () => {
    expect(nicobar?.impact).toBeUndefined()
    render(<PassportStory passport={nicobar!} />)
    expect(screen.queryByText(/litres of water/)).toBeNull()
    expect(screen.queryByText(/kg of CO/)).toBeNull()
  })

  it('omits the seal when nothing has been authenticated', () => {
    expect(nicobar?.authentication.method).toBe('none')
    render(<PassportStory passport={nicobar!} />)
    expect(screen.queryByText(/Verified by/)).toBeNull()
  })

  it('shows the seal, naming who verified it', () => {
    render(<PassportStory passport={cos!} />)
    expect(screen.getByText(cos!.authentication.verifiedBy as string)).toBeInTheDocument()
  })

  it('no longer renders composition or care, which live once in the drawer', () => {
    // These were rendered here AND in the Product details drawer. Duplicated
    // facts were most of why the page below the photographs ran to four
    // screens. See material-ring and care-symbol tests for their behaviour.
    render(<PassportStory passport={cos!} />)
    expect(screen.queryByText('recycled')).toBeNull()
    expect(screen.queryByText(cos!.careInstructions[0]!.label)).toBeNull()
  })
})
