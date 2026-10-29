import { DEFAULT_THEME, isColorPreset, isFontPreset } from './presets'
import type { ThemeConfig, ThemeOverrides } from './presets'

/**
 * Theme config ⇄ shareable URL token.
 *
 * The studio panel needs a client to be able to send a link that opens the site
 * in the exact configuration they were looking at. There is no database behind
 * that and there does not need to be one: the whole config is two enum values
 * and at most three colours, so it fits in a query parameter.
 *
 * Encoded as compact base64url in `?t=`. Compact matters — a URL a client pastes
 * into an email should not wrap.
 *
 * ## Versioning
 *
 * The encoding is versioned, and **v1 links still decode**. Phase 1 shipped
 * `1.<colour>.<font>`; Phase 8 added per-slot overrides as
 * `2.<colour>.<font>.<overrides>`. A link Arpit sent before the panel existed
 * must still open correctly, because links live in inboxes far longer than
 * front-end versions live in a repo. When a fourth field arrives, bump to 3 and
 * add another reader — do not repurpose a field.
 */

export const THEME_QUERY_PARAM = 't'

const VERSION = 2
const SEPARATOR = '.'

/** Order is load-bearing: overrides are positional in the token. */
const OVERRIDE_SLOTS = ['background', 'ink', 'accent'] as const

function toBase64Url(input: string): string {
  const base64 =
    typeof globalThis.btoa === 'function'
      ? globalThis.btoa(input)
      : Buffer.from(input, 'utf8').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string | null {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  try {
    return typeof globalThis.atob === 'function'
      ? globalThis.atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8')
  } catch {
    return null
  }
}

/**
 * Overrides are encoded as an HSL triplet with spaces and percent signs
 * stripped: `0 100% 28%` becomes `0-100-28`. Shorter than the raw triplet and
 * base64url-safe before encoding, which keeps the token short.
 */
function packOverrides(overrides: ThemeOverrides): string {
  return OVERRIDE_SLOTS.map((slot) => {
    const value = overrides[slot]
    if (value === undefined) return ''
    return value.trim().replace(/%/g, '').split(/\s+/).join('-')
  }).join(',')
}

function unpackOverrides(packed: string): ThemeOverrides {
  const parts = packed.split(',')
  const overrides: Record<string, string> = {}

  OVERRIDE_SLOTS.forEach((slot, index) => {
    const raw = parts[index]
    if (raw === undefined || raw === '') return
    const [h, s, l] = raw.split('-')
    // Anything that is not three numbers is dropped rather than applied. A
    // half-parsed colour is worse than the preset default.
    if (h === undefined || s === undefined || l === undefined) return
    if ([h, s, l].some((n) => !/^\d+(\.\d+)?$/.test(n))) return
    overrides[slot] = `${h} ${s}% ${l}%`
  })

  return overrides
}

export function encodeTheme(config: ThemeConfig): string {
  const packed = packOverrides(config.overrides ?? {})
  const fields: (string | number)[] = [VERSION, config.colorPreset, config.fontPreset]
  // Omit the overrides field entirely when there are none, so a link with no
  // custom colours stays as short as it was before the panel existed.
  if (packed.replace(/,/g, '') !== '') fields.push(packed)
  return toBase64Url(fields.join(SEPARATOR))
}

/**
 * Read a token back.
 *
 * Never throws and never partially applies. A token that is malformed, from a
 * future version, or naming a preset that no longer exists returns null, and the
 * caller falls back to the default theme — a half-applied theme from a stale
 * link looks like a bug to whoever opened it.
 */
export function decodeTheme(token: string | null | undefined): ThemeConfig | null {
  if (token === null || token === undefined || token === '') return null

  const decoded = fromBase64Url(token)
  if (decoded === null) return null

  const parts = decoded.split(SEPARATOR)
  if (parts.length < 3 || parts.length > 4) return null

  const [version, colorPreset, fontPreset, packed] = parts
  const parsedVersion = Number(version)

  // v1 had no overrides field. Still decodes — links outlive releases.
  if (parsedVersion !== 1 && parsedVersion !== VERSION) return null
  if (parsedVersion === 1 && parts.length !== 3) return null
  if (!isColorPreset(colorPreset) || !isFontPreset(fontPreset)) return null

  const overrides = packed === undefined ? {} : unpackOverrides(packed)

  return Object.keys(overrides).length === 0
    ? { colorPreset, fontPreset }
    : { colorPreset, fontPreset, overrides }
}

/** Decode, falling back to the default. Convenient for render paths. */
export function decodeThemeOrDefault(token: string | null | undefined): ThemeConfig {
  return decodeTheme(token) ?? { ...DEFAULT_THEME }
}

/**
 * Read the theme token out of a URL or a query string. Accepts a full URL, a
 * search string, or a `URLSearchParams`.
 */
export function readThemeToken(source: string | URLSearchParams): string | null {
  if (source instanceof URLSearchParams) return source.get(THEME_QUERY_PARAM)
  const queryStart = source.indexOf('?')
  const search = queryStart === -1 ? source : source.slice(queryStart)
  return new URLSearchParams(search).get(THEME_QUERY_PARAM)
}

/** Add or replace `?t=` on a URL, preserving everything else about it. */
export function withThemeToken(url: string, config: ThemeConfig): string {
  const [base = '', query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  params.set(THEME_QUERY_PARAM, encodeTheme(config))
  return `${base}?${params.toString()}`
}
