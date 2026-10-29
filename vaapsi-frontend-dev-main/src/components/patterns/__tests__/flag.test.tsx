import { render } from '@testing-library/react'
import { Flag, countryCodeFor } from '../data/flag'

describe('countryCodeFor', () => {
  it('reads the country off the end of a place', () => {
    expect(countryCodeFor('India')).toBe('in')
    expect(countryCodeFor('Okayama, Japan')).toBe('jp')
    expect(countryCodeFor('Kaithal, Haryana, India')).toBe('in')
  })

  it('is not case or whitespace sensitive', () => {
    expect(countryCodeFor('  BANGLADESH ')).toBe('bd')
  })

  it('returns nothing rather than guessing', () => {
    // The first two are real values in the fixtures. Neither is a country, and
    // a flag beside either would be an invented fact.
    expect(countryCodeFor('Unknown — label removed before intake')).toBeNull()
    expect(countryCodeFor('Not recorded')).toBeNull()
    expect(countryCodeFor('Manifattura Rossi, Vicenza')).toBeNull()
    expect(countryCodeFor('')).toBeNull()
  })
})

describe('Flag', () => {
  it('renders the file for the country named', () => {
    const { container } = render(<Flag place="Tamil Nadu, India" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/flags/in.svg')
  })

  it('renders nothing for a place it does not know', () => {
    const { container } = render(<Flag place="Not recorded" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is decorative, because the country is written out beside it', () => {
    // "Flag of India, India" is noise, not information.
    const { container } = render(<Flag place="India" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden')
  })

  it('carries a border, or the white-field flags have no edge', () => {
    // Japan on a white page is otherwise a red dot floating beside a word.
    const { container } = render(<Flag place="Japan" />)
    expect(container.querySelector('img')?.className).toContain('border')
  })
})
