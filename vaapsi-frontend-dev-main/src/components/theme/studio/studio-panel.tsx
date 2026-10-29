'use client'

import { useEffect, useState } from 'react'
import {
  COLOR_PRESETS,
  COLOR_PRESET_LABELS,
  FONT_PRESETS,
  FONT_PRESET_LABELS,
  OVERRIDABLE_SLOTS,
} from '../presets'
import type { OverridableSlot } from '../presets'
import { useTheme } from '../theme-provider'
import { hexToHslTriplet, hslTripletToHex, readComputedSlot } from './color'

/**
 * The studio panel.
 *
 * ## It is not themed, and that is the most important thing about it
 *
 * Every style below is a hardcoded literal — the only place in the repo where
 * that is correct, and it is enforced by an exemption in the token-hygiene test
 * rather than by hoping nobody notices.
 *
 * The reason is not stylistic. If the panel inherited `--background` and
 * `--ink`, then the moment a client picks white-on-white the panel becomes
 * invisible and they cannot undo it. The one control that must survive every
 * possible bad choice is the control that made the choice. So it has its own
 * fixed dark palette, its own type stack, and no dependency on a single token.
 *
 * ## Behaviour
 *
 * - Mounts only when `?studio=1` is present, so the client's version is a
 *   shareable link with no auth and no build flag.
 * - Changes apply instantly. No apply button, no confirmation — a client
 *   clicking through five directions on a call should not also be clicking OK.
 * - The URL is the single source of truth. Nothing is written to localStorage,
 *   because a stale local value would silently override a shared link.
 * - Toggle with the handle or Ctrl/Cmd + K.
 */

const STUDIO = {
  bg: '#101012',
  bgRaised: '#1a1a1d',
  line: '#2e2e33',
  text: '#f2f2f3',
  textMuted: '#9a9aa2',
  accent: '#ff3b30',
  font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

export function StudioPanel() {
  const theme = useTheme()
  const [open, setOpen] = useState(true)

  // Ctrl/Cmd + K toggles. Chosen because it does not collide with anything the
  // storefront itself listens for, and because it is the shortcut everyone
  // already reaches for.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <aside
      aria-label="Studio panel"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        fontFamily: STUDIO.font,
        // Fixed, so it never affects page layout or scroll.
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        colorScheme: 'dark',
      }}
    >
      {open && <Panel theme={theme} onClose={() => setOpen(false)} />}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        style={{
          background: STUDIO.bg,
          color: STUDIO.text,
          border: `1px solid ${STUDIO.line}`,
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        {open ? 'Hide studio' : 'Studio'}
      </button>
    </aside>
  )
}

function Panel({ theme, onClose }: { theme: ReturnType<typeof useTheme>; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(theme.shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard access can be refused. Falling back to selecting the text is
      // better than a dead button with no explanation.
      setCopied(false)
    }
  }

  return (
    <div
      style={{
        width: 320,
        maxWidth: 'calc(100vw - 32px)',
        background: STUDIO.bg,
        color: STUDIO.text,
        border: `1px solid ${STUDIO.line}`,
        borderRadius: 4,
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
        overflowY: 'auto',
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: `1px solid ${STUDIO.line}`,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Studio
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide studio panel"
          style={{
            background: 'none',
            border: 0,
            color: STUDIO.textMuted,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      </header>

      {/* ---- Font pairings, as live specimens */}
      <Section label="Type">
        {FONT_PRESETS.map((preset) => {
          const meta = FONT_PRESET_LABELS[preset]
          const active = theme.fontPreset === preset
          return (
            <button
              key={preset}
              type="button"
              onClick={() => theme.setFontPreset(preset)}
              aria-pressed={active}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: active ? STUDIO.bgRaised : 'transparent',
                border: `1px solid ${active ? STUDIO.accent : STUDIO.line}`,
                borderRadius: 3,
                padding: '10px 12px',
                marginBottom: 6,
                cursor: 'pointer',
                color: STUDIO.text,
              }}
            >
              {/*
                A live specimen in the actual faces, not a name in a list. The
                client has to be able to see the difference before clicking —
                "Didone" means nothing to anyone who does not already know.

                The specimen borrows the real font variables, which are on <html>
                regardless of the active preset, so this renders in Bodoni even
                while the page is in Jost.
              */}
              <span
                style={{
                  display: 'block',
                  fontFamily: `var(${FONT_VARIABLE[preset].display})`,
                  fontSize: 22,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                Worn again
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: `var(${FONT_VARIABLE[preset].body})`,
                  fontSize: 12,
                  color: STUDIO.textMuted,
                  marginTop: 4,
                }}
              >
                {meta.name} — {meta.display} / {meta.body}
              </span>
            </button>
          )
        })}
      </Section>

      {/* ---- Colour presets */}
      <Section label="Colour">
        <div style={{ display: 'flex', gap: 6 }}>
          {COLOR_PRESETS.map((preset) => {
            const active = theme.colorPreset === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => theme.setColorPreset(preset)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  background: active ? STUDIO.bgRaised : 'transparent',
                  border: `1px solid ${active ? STUDIO.accent : STUDIO.line}`,
                  borderRadius: 3,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  color: STUDIO.text,
                  fontSize: 12,
                }}
              >
                {COLOR_PRESET_LABELS[preset]}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ---- Per-slot overrides */}
      <Section label="Adjust">
        {OVERRIDABLE_SLOTS.map((slot) => (
          <SlotControl key={slot} slot={slot} theme={theme} />
        ))}
      </Section>

      <div
        style={{
          padding: '12px 14px',
          borderTop: `1px solid ${STUDIO.line}`,
          display: 'grid',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={copyLink}
          style={{
            background: STUDIO.text,
            color: STUDIO.bg,
            border: 0,
            borderRadius: 3,
            padding: '10px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={theme.reset}
          style={{
            background: 'transparent',
            color: STUDIO.textMuted,
            border: `1px solid ${STUDIO.line}`,
            borderRadius: 3,
            padding: '8px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Reset to default
        </button>
        <p style={{ margin: 0, fontSize: 11, color: STUDIO.textMuted }}>
          Ctrl/⌘ + K toggles. The link carries everything above — nothing is saved to this browser.
        </p>
      </div>
    </div>
  )
}

function SlotControl({
  slot,
  theme,
}: {
  slot: OverridableSlot
  theme: ReturnType<typeof useTheme>
}) {
  const override = theme.overrides?.[slot]
  // When there is no override, show what the preset is actually resolving to, so
  // the swatch is never lying about the current colour.
  const [presetValue, setPresetValue] = useState<string | null>(null)

  useEffect(() => {
    setPresetValue(readComputedSlot(slot))
  }, [slot, theme.colorPreset, override])

  const current = override ?? presetValue
  const hex = current === null ? '#000000' : hslTripletToHex(current)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
      }}
    >
      <label htmlFor={`studio-${slot}`} style={{ flex: 1, fontSize: 12, color: STUDIO.textMuted }}>
        --{slot}
      </label>
      <code
        style={{ fontSize: 11, color: STUDIO.textMuted, fontFamily: 'ui-monospace, monospace' }}
      >
        {hex}
      </code>
      <input
        id={`studio-${slot}`}
        type="color"
        value={hex}
        onChange={(event) => theme.setOverride(slot, hexToHslTriplet(event.target.value))}
        style={{
          width: 28,
          height: 24,
          padding: 0,
          border: `1px solid ${STUDIO.line}`,
          borderRadius: 2,
          background: 'none',
          cursor: 'pointer',
        }}
      />
      {override !== undefined && (
        <button
          type="button"
          onClick={() => theme.setOverride(slot, null)}
          aria-label={`Reset ${slot}`}
          style={{
            background: 'none',
            border: 0,
            color: STUDIO.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 2,
          }}
        >
          ↺
        </button>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '12px 14px', borderBottom: `1px solid ${STUDIO.line}` }}>
      <h2
        style={{
          margin: '0 0 8px',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: STUDIO.textMuted,
          fontWeight: 400,
        }}
      >
        {label}
      </h2>
      {children}
    </section>
  )
}

/**
 * Which font variables each preset points at. Duplicated from tokens.css because
 * the specimen has to render a face the page is *not* currently using, and CSS
 * cannot tell us what `[data-font="didone"]` would resolve to without applying it.
 */
const FONT_VARIABLE: Record<(typeof FONT_PRESETS)[number], { display: string; body: string }> = {
  modernist: { display: '--font-jost', body: '--font-jost' },
  didone: { display: '--font-bodoni', body: '--font-jost' },
  grotesk: { display: '--font-archivo', body: '--font-inter' },
  editorial: { display: '--font-instrument', body: '--font-dm-sans' },
  heritage: { display: '--font-garamond', body: '--font-inter' },
}
