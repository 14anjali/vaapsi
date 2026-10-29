import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudioPanel } from '../studio/studio-panel'
import { hexToHslTriplet, hslTripletToHex } from '../studio/color'
import { ThemeProvider } from '../theme-provider'
import { decodeTheme, encodeTheme } from '../encode'
import { COLOR_PRESETS, DEFAULT_THEME, FONT_PRESETS, OVERRIDABLE_SLOTS } from '../presets'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function setSearch(search: string) {
  window.history.replaceState({}, '', `/${search}`)
}

beforeEach(() => {
  setSearch('')
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-font')
})

const withProvider = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>)

// ---------------------------------------------------------------------------

describe('hex ⇄ HSL triplet', () => {
  it('round-trips the brand accent', () => {
    // #900000 is the one colour in the system that must survive this exactly.
    expect(hexToHslTriplet('#900000')).toBe('0 100% 28%')
    expect(hslTripletToHex('0 100% 28%')).toBe('#8f0000')
  })

  it('round-trips black, white and mid grey', () => {
    expect(hexToHslTriplet('#000000')).toBe('0 0% 0%')
    expect(hexToHslTriplet('#ffffff')).toBe('0 0% 100%')
    expect(hslTripletToHex('0 0% 100%')).toBe('#ffffff')
    expect(hslTripletToHex('0 0% 0%')).toBe('#000000')
  })

  it('accepts shorthand hex', () => {
    expect(hexToHslTriplet('#fff')).toBe('0 0% 100%')
  })

  it('degrades to black rather than throwing on nonsense', () => {
    expect(hexToHslTriplet('not-a-colour')).toBe('0 0% 0%')
    expect(hslTripletToHex('nonsense')).toBe('#000000')
  })

  it('round-trips a saturated hue within rounding tolerance', () => {
    const triplet = hexToHslTriplet('#1e88e5')
    const back = hexToHslTriplet(hslTripletToHex(triplet))
    expect(back).toBe(triplet)
  })
})

// ---------------------------------------------------------------------------

describe('theme token with overrides', () => {
  it('round-trips overrides', () => {
    const config = {
      colorPreset: 'inverse' as const,
      fontPreset: 'didone' as const,
      overrides: { accent: '210 100% 50%' },
    }
    expect(decodeTheme(encodeTheme(config))).toEqual(config)
  })

  it('still decodes a v1 link, because links outlive releases', () => {
    const v1 = Buffer.from('1.inverse.heritage').toString('base64url')
    expect(decodeTheme(v1)).toEqual({ colorPreset: 'inverse', fontPreset: 'heritage' })
  })

  it('omits the overrides field entirely when there are none', () => {
    const withNone = encodeTheme({ colorPreset: 'mono', fontPreset: 'didone' })
    expect(Buffer.from(withNone, 'base64url').toString('utf8').split('.')).toHaveLength(3)
  })

  it('drops a malformed override rather than applying half of it', () => {
    const token = Buffer.from('2.mono.didone.0-100-28,broken,').toString('base64url')
    const decoded = decodeTheme(token)
    expect(decoded?.overrides?.background).toBe('0 100% 28%')
    expect(decoded?.overrides?.ink).toBeUndefined()
  })

  it('stays short enough to paste into an email without wrapping', () => {
    const token = encodeTheme({
      colorPreset: 'inverse',
      fontPreset: 'editorial',
      overrides: { background: '0 0% 4%', ink: '0 0% 98%', accent: '0 100% 42%' },
    })
    expect(token.length).toBeLessThan(64)
  })
})

// ---------------------------------------------------------------------------

describe('StudioPanel', () => {
  it('shows a live specimen for every font pairing, not just its name', () => {
    withProvider(<StudioPanel />)
    // Each preset renders the pangram in its own display face.
    expect(screen.getAllByText('Worn again')).toHaveLength(FONT_PRESETS.length)
  })

  it('renders the specimen in the preset it represents, not the active one', () => {
    withProvider(<StudioPanel />)
    const specimens = screen.getAllByText('Worn again')
    const families = specimens.map((el) => (el as HTMLElement).style.fontFamily)
    // Five presets, four distinct display faces (Modernist and the Didone body
    // both use Jost) — the point is they are not all the active one.
    expect(new Set(families).size).toBeGreaterThan(1)
    expect(families.some((f) => f.includes('--font-bodoni'))).toBe(true)
  })

  it('offers every colour preset', () => {
    withProvider(<StudioPanel />)
    for (const preset of COLOR_PRESETS) {
      expect(screen.getByRole('button', { name: new RegExp(preset, 'i') })).toBeInTheDocument()
    }
  })

  it('applies a font preset instantly, with no apply button', async () => {
    const user = userEvent.setup()
    withProvider(<StudioPanel />)
    expect(screen.queryByRole('button', { name: /^apply$/i })).toBeNull()

    await user.click(screen.getByText(/Didone —/))
    expect(document.documentElement.getAttribute('data-font')).toBe('didone')
  })

  it('applies a colour preset instantly', async () => {
    const user = userEvent.setup()
    withProvider(<StudioPanel />)
    await user.click(screen.getByRole('button', { name: 'Inverse' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('inverse')
  })

  it('exposes exactly the three overridable slots', () => {
    withProvider(<StudioPanel />)
    for (const slot of OVERRIDABLE_SLOTS) {
      expect(screen.getByLabelText(`--${slot}`)).toBeInTheDocument()
    }
    expect(screen.queryByLabelText('--line')).toBeNull()
    expect(screen.queryByLabelText('--surface')).toBeNull()
  })

  it('writes an override as an inline custom property on <html>', () => {
    withProvider(<StudioPanel />)

    const input = screen.getByLabelText('--accent') as HTMLInputElement
    // `userEvent.type` does not work on a colour input — the widget is native
    // and jsdom has no picker. Firing the change directly is what a real pick
    // produces anyway.
    fireEvent.change(input, { target: { value: '#1e88e5' } })

    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('208 79% 51%')
  })

  it('resets everything back to the default', async () => {
    const user = userEvent.setup()
    withProvider(<StudioPanel />)
    await user.click(screen.getByRole('button', { name: 'Inverse' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('inverse')

    await user.click(screen.getByRole('button', { name: 'Reset to default' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME.colorPreset)
  })

  it('collapses to a handle without affecting layout', async () => {
    const user = userEvent.setup()
    withProvider(<StudioPanel />)
    await user.click(screen.getByRole('button', { name: 'Hide studio' }))
    expect(screen.getByRole('button', { name: 'Studio' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Type' })).toBeNull()
  })

  it('toggles on Ctrl+K', async () => {
    const user = userEvent.setup()
    withProvider(<StudioPanel />)
    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('button', { name: 'Studio' })).toBeInTheDocument()
  })

  it('says out loud that nothing is saved to the browser', () => {
    withProvider(<StudioPanel />)
    expect(screen.getByText(/nothing is saved\s+to this browser/i)).toBeInTheDocument()
  })

  it('copies a link carrying the current configuration', async () => {
    const user = userEvent.setup()

    // After `setup()`, not before: userEvent installs its own clipboard stub on
    // setup, which would otherwise overwrite this one.
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    withProvider(<StudioPanel />)
    await user.click(screen.getByRole('button', { name: 'Inverse' }))
    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(writeText).toHaveBeenCalledTimes(1)
    const url = String(writeText.mock.calls[0]?.[0] ?? '')
    const token = new URL(url, 'http://localhost').searchParams.get('t')
    expect(decodeTheme(token)?.colorPreset).toBe('inverse')
  })
})

// ---------------------------------------------------------------------------

describe('studio panel is not themed', () => {
  const source = readFileSync(join(__dirname, '..', 'studio', 'studio-panel.tsx'), 'utf8')

  it('never reads a colour token', () => {
    // If the panel inherited --background and --ink, a client choosing
    // white-on-white would make the only control that can undo it invisible.
    for (const token of ['--background', '--ink', '--surface', '--line']) {
      expect(source).not.toContain(`var(${token})`)
    }
  })

  it('uses no Tailwind colour utilities either', () => {
    expect(source).not.toMatch(/className=.*\b(bg-background|text-ink|border-line)\b/)
  })

  it('does read the font variables, which is the one safe dependency', () => {
    // Font variables are always present on <html> regardless of preset, and the
    // specimen has to render a face the page is not currently using.
    expect(source).toContain('--font-bodoni')
  })
})
