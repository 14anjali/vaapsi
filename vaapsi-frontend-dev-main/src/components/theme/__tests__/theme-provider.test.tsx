import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../theme-provider'
import { encodeTheme } from '../encode'
import { DEFAULT_THEME } from '../presets'

function Probe() {
  const { colorPreset, fontPreset, setColorPreset, setFontPreset, reset, token } = useTheme()
  return (
    <div>
      <p data-testid="color">{colorPreset}</p>
      <p data-testid="font">{fontPreset}</p>
      <p data-testid="token">{token}</p>
      <button onClick={() => setColorPreset('inverse')}>invert</button>
      <button onClick={() => setFontPreset('didone')}>didone</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}

function setSearch(search: string) {
  window.history.replaceState({}, '', `/${search}`)
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    setSearch('')
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-font')
  })

  it('starts at the default and writes both attributes to <html>', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('color')).toHaveTextContent(DEFAULT_THEME.colorPreset)
    expect(screen.getByTestId('font')).toHaveTextContent(DEFAULT_THEME.fontPreset)
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME.colorPreset)
    expect(document.documentElement.getAttribute('data-font')).toBe(DEFAULT_THEME.fontPreset)
  })

  it('applies a shared link on mount', () => {
    setSearch(`?t=${encodeTheme({ colorPreset: 'inverse', fontPreset: 'heritage' })}`)
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('inverse')
    expect(document.documentElement.getAttribute('data-font')).toBe('heritage')
  })

  it('ignores a malformed link instead of half-applying it', () => {
    setSearch('?t=not-a-real-token')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('color')).toHaveTextContent(DEFAULT_THEME.colorPreset)
    expect(screen.getByTestId('font')).toHaveTextContent(DEFAULT_THEME.fontPreset)
  })

  it('honours a server-resolved initial config', () => {
    render(
      <ThemeProvider initial={{ colorPreset: 'inverse', fontPreset: 'grotesk' }}>
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('inverse')
    expect(document.documentElement.getAttribute('data-font')).toBe('grotesk')
  })

  it('changes each axis independently and keeps the token in step', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'invert' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('inverse')
    expect(document.documentElement.getAttribute('data-font')).toBe(DEFAULT_THEME.fontPreset)

    await user.click(screen.getByRole('button', { name: 'didone' }))
    expect(document.documentElement.getAttribute('data-font')).toBe('didone')
    expect(screen.getByTestId('token')).toHaveTextContent(
      encodeTheme({ colorPreset: 'inverse', fontPreset: 'didone' }),
    )

    await user.click(screen.getByRole('button', { name: 'reset' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME.colorPreset)
  })

  it('refuses to be used outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/)
    spy.mockRestore()
  })
})
