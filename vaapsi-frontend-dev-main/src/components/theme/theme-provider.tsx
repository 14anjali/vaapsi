'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { THEME_QUERY_PARAM, decodeTheme, encodeTheme } from './encode'
import { DEFAULT_THEME } from './presets'
import { OVERRIDABLE_SLOTS } from './presets'
import type { ColorPreset, FontPreset, ThemeConfig, ThemeOverrides } from './presets'

/**
 * Holds the active theme and applies it to <html>.
 *
 * Application is two attributes and nothing else:
 *
 *   <html data-theme="inverse" data-font="didone">
 *
 * `styles/tokens.css` does the rest. There is no inline style, no injected
 * stylesheet, and no font loaded at runtime — all seven families are already in
 * the document courtesy of next/font in the root layout, so changing the font
 * preset only reassigns which one --font-display and --font-body point at.
 *
 * **Deliberately not persisted to localStorage.** The URL is the single source of
 * truth. If the config were also persisted locally, a stale value on Arpit's
 * machine would silently override the link he had just been sent — and the one
 * thing the studio panel has to get right is that a shared link opens exactly
 * what the sender saw.
 *
 * The theme is a presentation decision Vaapsi makes, not a shopper preference.
 * Once a direction is signed off, the default in `presets.ts` changes and all of
 * this becomes inert.
 */

type ThemeContextValue = ThemeConfig & {
  setColorPreset: (preset: ColorPreset) => void
  setFontPreset: (preset: FontPreset) => void
  setOverride: (slot: (typeof OVERRIDABLE_SLOTS)[number], value: string | null) => void
  clearOverrides: () => void
  setTheme: (config: ThemeConfig) => void
  reset: () => void
  /** The current config as a `?t=` token, for the share control in Phase 8. */
  token: string
  /** A full shareable URL for the current page. Empty during SSR. */
  shareUrl: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export type ThemeProviderProps = {
  children: React.ReactNode
  /**
   * Server-resolved initial config. Pass the decoded `?t=` value from a page or
   * layout when you have it, so the first paint is already correct.
   */
  initial?: ThemeConfig
}

export function ThemeProvider({ children, initial }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(initial ?? { ...DEFAULT_THEME })

  // Read the shared link on mount. This runs before paint via a layout-ish
  // effect ordering in practice, but the attributes are also set server-side
  // from `initial` when the caller passes it, which is the flash-free path.
  useEffect(() => {
    const fromUrl = decodeTheme(new URLSearchParams(window.location.search).get(THEME_QUERY_PARAM))
    if (fromUrl !== null) setConfig(fromUrl)
  }, [])

  /*
   * Apply to <html>: two attributes, plus any per-slot overrides as inline
   * custom properties.
   *
   * The overrides are set on the element rather than injected as a stylesheet
   * because an inline custom property beats a `[data-theme]` rule on
   * specificity without needing `!important`, and because clearing one is a
   * `removeProperty` call rather than a stylesheet rewrite.
   *
   * Only the three overridable slots are touched. Everything derived from them
   * — muted, subtle, the shadcn set — still resolves through the preset, so an
   * ink override carries through to every variant of ink for free.
   */
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', config.colorPreset)
    root.setAttribute('data-font', config.fontPreset)

    for (const slot of OVERRIDABLE_SLOTS) {
      const value = config.overrides?.[slot]
      if (value === undefined || value === '') root.style.removeProperty(`--${slot}`)
      else root.style.setProperty(`--${slot}`, value)
    }
  }, [config])

  const setColorPreset = useCallback((colorPreset: ColorPreset) => {
    setConfig((current) => ({ ...current, colorPreset }))
  }, [])

  const setFontPreset = useCallback((fontPreset: FontPreset) => {
    setConfig((current) => ({ ...current, fontPreset }))
  }, [])

  const setOverride = useCallback(
    (slot: (typeof OVERRIDABLE_SLOTS)[number], value: string | null) => {
      setConfig((current) => {
        const overrides: ThemeOverrides = { ...current.overrides }
        if (value === null) delete overrides[slot]
        else overrides[slot] = value
        return { ...current, overrides }
      })
    },
    [],
  )

  const clearOverrides = useCallback(
    () =>
      setConfig((current) => ({
        colorPreset: current.colorPreset,
        fontPreset: current.fontPreset,
      })),
    [],
  )

  const setTheme = useCallback((next: ThemeConfig) => setConfig(next), [])

  const reset = useCallback(() => setConfig({ ...DEFAULT_THEME }), [])

  const token = useMemo(() => encodeTheme(config), [config])

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(`${window.location.origin}${window.location.pathname}`)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...config,
      setColorPreset,
      setFontPreset,
      setOverride,
      clearOverrides,
      setTheme,
      reset,
      token,
      shareUrl: origin === '' ? '' : `${origin}?${THEME_QUERY_PARAM}=${token}`,
    }),
    [
      config,
      setColorPreset,
      setFontPreset,
      setOverride,
      clearOverrides,
      setTheme,
      reset,
      token,
      origin,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used inside a ThemeProvider.')
  }
  return context
}
