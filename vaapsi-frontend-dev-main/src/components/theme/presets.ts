/**
 * The preset registry.
 *
 * These are the only two axes the theme has: a colour preset and a font
 * pairing. Both are applied as attributes on <html>, and every visual
 * consequence is already described in styles/tokens.css. Adding a preset means
 * adding a block there and an entry here — no component changes, ever.
 */

export const COLOR_PRESETS = ['mono', 'inverse'] as const
export type ColorPreset = (typeof COLOR_PRESETS)[number]

export const FONT_PRESETS = ['modernist', 'didone', 'grotesk', 'editorial', 'heritage'] as const
export type FontPreset = (typeof FONT_PRESETS)[number]

export const DEFAULT_THEME = {
  colorPreset: 'mono',
  fontPreset: 'modernist',
} as const satisfies ThemeConfig

/**
 * Per-slot colour overrides, as bare HSL triplets ("0 100% 28%").
 *
 * Only three slots are overridable, and that is a deliberate limit: background,
 * ink and accent are the three decisions a client actually has an opinion about.
 * Exposing all ten would let someone set --line to hot pink and then be unable
 * to explain to themselves what went wrong.
 *
 * Everything else in the preset still derives normally, so an override to `ink`
 * carries through to every muted and subtle variant.
 */
export type ThemeOverrides = {
  background?: string
  ink?: string
  accent?: string
}

export const OVERRIDABLE_SLOTS = ['background', 'ink', 'accent'] as const
export type OverridableSlot = (typeof OVERRIDABLE_SLOTS)[number]

export type ThemeConfig = {
  colorPreset: ColorPreset
  fontPreset: FontPreset
  /** Absent or empty means "use the preset as shipped". */
  overrides?: ThemeOverrides
}

/** Human labels for the Phase 8 panel. Kept beside the registry, not in it. */
export const COLOR_PRESET_LABELS: Record<ColorPreset, string> = {
  mono: 'Mono',
  inverse: 'Inverse',
}

export const FONT_PRESET_LABELS: Record<
  FontPreset,
  { name: string; display: string; body: string }
> = {
  modernist: { name: 'Modernist', display: 'Jost', body: 'Jost' },
  didone: { name: 'Didone', display: 'Bodoni Moda', body: 'Jost' },
  grotesk: { name: 'Grotesk', display: 'Archivo', body: 'Inter' },
  editorial: { name: 'Editorial', display: 'Instrument Serif', body: 'DM Sans' },
  heritage: { name: 'Heritage', display: 'EB Garamond', body: 'Inter' },
}

export function isColorPreset(value: unknown): value is ColorPreset {
  return typeof value === 'string' && (COLOR_PRESETS as readonly string[]).includes(value)
}

export function isFontPreset(value: unknown): value is FontPreset {
  return typeof value === 'string' && (FONT_PRESETS as readonly string[]).includes(value)
}
