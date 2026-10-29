import {
  THEME_QUERY_PARAM,
  decodeTheme,
  decodeThemeOrDefault,
  encodeTheme,
  readThemeToken,
  withThemeToken,
} from '../encode'
import { COLOR_PRESETS, DEFAULT_THEME, FONT_PRESETS } from '../presets'
import type { ThemeConfig } from '../presets'

describe('encodeTheme / decodeTheme', () => {
  it('round-trips every combination of presets', () => {
    for (const colorPreset of COLOR_PRESETS) {
      for (const fontPreset of FONT_PRESETS) {
        const config: ThemeConfig = { colorPreset, fontPreset }
        expect(decodeTheme(encodeTheme(config))).toEqual(config)
      }
    }
  })

  it('produces a compact, URL-safe token', () => {
    const token = encodeTheme({ colorPreset: 'inverse', fontPreset: 'editorial' })
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(token.length).toBeLessThan(40)
  })

  it('returns null rather than partially applying a broken token', () => {
    expect(decodeTheme(null)).toBeNull()
    expect(decodeTheme(undefined)).toBeNull()
    expect(decodeTheme('')).toBeNull()
    expect(decodeTheme('!!!not base64!!!')).toBeNull()
    // Right shape, wrong version.
    expect(decodeTheme(Buffer.from('9.mono.modernist').toString('base64url'))).toBeNull()
    // Right version, preset that does not exist.
    expect(decodeTheme(Buffer.from('1.neon.modernist').toString('base64url'))).toBeNull()
    expect(decodeTheme(Buffer.from('1.mono.brutalist').toString('base64url'))).toBeNull()
    // Too few parts.
    expect(decodeTheme(Buffer.from('1.mono').toString('base64url'))).toBeNull()
  })
})

describe('decodeThemeOrDefault', () => {
  it('falls back to the default rather than to nothing', () => {
    expect(decodeThemeOrDefault('garbage')).toEqual(DEFAULT_THEME)
    expect(decodeThemeOrDefault(null)).toEqual(DEFAULT_THEME)
  })

  it('returns a fresh object, so a caller cannot mutate the default', () => {
    const first = decodeThemeOrDefault(null)
    first.colorPreset = 'inverse'
    expect(decodeThemeOrDefault(null).colorPreset).toBe(DEFAULT_THEME.colorPreset)
  })
})

describe('readThemeToken', () => {
  const token = encodeTheme({ colorPreset: 'inverse', fontPreset: 'didone' })

  it('reads from a full URL, a search string and URLSearchParams', () => {
    expect(readThemeToken(`https://vaapsi.example/pdp?${THEME_QUERY_PARAM}=${token}`)).toBe(token)
    expect(readThemeToken(`?${THEME_QUERY_PARAM}=${token}`)).toBe(token)
    expect(readThemeToken(new URLSearchParams({ [THEME_QUERY_PARAM]: token }))).toBe(token)
  })

  it('returns null when there is no token', () => {
    expect(readThemeToken('https://vaapsi.example/pdp')).toBeNull()
    expect(readThemeToken('?utm_source=email')).toBeNull()
  })
})

describe('withThemeToken', () => {
  it('adds the token and preserves other params', () => {
    const url = withThemeToken('https://vaapsi.example/plp?category=knitwear', {
      colorPreset: 'inverse',
      fontPreset: 'heritage',
    })
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('category')).toBe('knitwear')
    expect(decodeTheme(params.get(THEME_QUERY_PARAM))).toEqual({
      colorPreset: 'inverse',
      fontPreset: 'heritage',
    })
  })

  it('replaces an existing token rather than appending a second one', () => {
    const once = withThemeToken('/pdp', { colorPreset: 'mono', fontPreset: 'didone' })
    const twice = withThemeToken(once, { colorPreset: 'inverse', fontPreset: 'grotesk' })
    expect(twice.match(new RegExp(`${THEME_QUERY_PARAM}=`, 'g'))).toHaveLength(1)
    expect(decodeTheme(readThemeToken(twice))).toEqual({
      colorPreset: 'inverse',
      fontPreset: 'grotesk',
    })
  })
})
