import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Colour contrast, checked **at every preset**.
 *
 * This is the check the theme switcher makes non-optional. Mono passing tells you
 * nothing about Inverse, and once a client can flip presets on a shared link,
 * "we checked the default" is not a claim about the site — it is a claim about
 * one of its states.
 *
 * Computed from `tokens.css` directly rather than from a rendered page, for two
 * reasons: it covers presets nobody has built a page in yet, and it fails at the
 * moment a token changes rather than the moment someone happens to screenshot
 * the affected component.
 *
 * WCAG 2.1 AA is the floor this project proposed: 4.5:1 for body text, 3:1 for
 * large text (18.66px bold or 24px regular) and for UI component boundaries.
 */

const TOKENS = readFileSync(join(__dirname, '..', 'tokens.css'), 'utf8')

/**
 * Parse the token declarations inside one selector block.
 *
 * `nesting` skips that many opening braces before reading declarations, which is
 * what the print block needs — it lives inside `@media print`, and without the
 * skip this silently returned nothing and the print column of this suite tested
 * the mono values instead. A test that passes for the wrong reason is worse than
 * no test.
 */
function parseBlock(selector: string, nesting = 1): Record<string, string> {
  // Matched whitespace-insensitively. A multi-selector block is wrapped across
  // lines by Prettier, and the exact line breaks are not something this test
  // should be coupled to.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, (ch) => `\\${ch}`)
  const pattern = new RegExp(escaped.replace(/\s+/g, '\\s*'))
  const match = pattern.exec(TOKENS)
  if (match === null) throw new Error(`No block for ${selector} in tokens.css`)
  const body = TOKENS.slice(match.index).split('{').slice(nesting)[0]?.split('}')[0] ?? ''
  const slots: Record<string, string> = {}
  for (const line of body.split('\n')) {
    const match = /--([\w-]+):\s*([^;]+);/.exec(line)
    if (match === null) continue
    const [, name, value] = match
    if (name === undefined || value === undefined) continue
    slots[name] = value.trim()
  }
  return slots
}

/** Relative luminance of an HSL triplet, per WCAG. */
function luminance(triplet: string): number {
  const [h, s, l] = triplet
    .replace(/%/g, '')
    .split(/\s+/)
    .map((part) => Number.parseFloat(part))
  if (h === undefined || s === undefined || l === undefined) {
    throw new Error(`Not an HSL triplet: "${triplet}"`)
  }

  const sat = s / 100
  const light = l / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let rgb: [number, number, number]
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  const m = light - c / 2
  const [r, g, b] = rgb.map((channel) => {
    const v = channel + m
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * Resolve a preset into concrete triplets. A preset block only redefines what it
 * changes, so the base `:root` values fill in the rest — exactly as the cascade
 * does at runtime.
 */
function resolve(preset: 'mono' | 'inverse' | 'print'): Record<string, string> {
  const base = parseBlock(":root,\n[data-theme='mono']")
  if (preset === 'mono') return base
  if (preset === 'print') return { ...base, ...parseBlock('@media print', 2) }
  return { ...base, ...parseBlock("[data-theme='inverse']") }
}

const PRESETS = ['mono', 'inverse', 'print'] as const

/** Body-text pairings that must clear 4.5:1. */
const BODY_PAIRS: readonly [string, string][] = [
  ['ink', 'background'],
  ['ink', 'surface'],
  ['ink', 'surface-raised'],
  ['ink-muted', 'background'],
  ['ink-muted', 'surface'],
  ['accent-ink', 'accent'],
  // `positive` is always a small numeral — "You save ₹1,230", "− ₹1,845" — so
  // it is held to the body threshold rather than the 3:1 UI one. It appears on
  // the page ground and inside the tinted delivery band, hence both.
  ['positive', 'background'],
  ['positive', 'surface'],
]

/**
 * Pairings that only need 3:1.
 *
 * `ink-subtle` is documented as AA at 14px and above, which is large-text
 * territory once you account for it being used for captions and timestamps
 * rather than for reading copy. `line-strong` is a component boundary.
 */
const LARGE_OR_UI_PAIRS: readonly [string, string][] = [
  ['ink-subtle', 'background'],
  ['ink-subtle', 'surface'],
  ['line-strong', 'background'],
  ['accent', 'background'],
]

describe.each(PRESETS)('contrast — %s preset', (preset) => {
  const slots = resolve(preset)

  it.each(BODY_PAIRS)('%s on %s clears 4.5:1', (fg, bg) => {
    const foreground = slots[fg]
    const background = slots[bg]
    expect(foreground).toBeDefined()
    expect(background).toBeDefined()
    expect(ratio(foreground as string, background as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(LARGE_OR_UI_PAIRS)('%s on %s clears 3:1', (fg, bg) => {
    const foreground = slots[fg]
    const background = slots[bg]
    expect(foreground).toBeDefined()
    expect(background).toBeDefined()
    expect(ratio(foreground as string, background as string)).toBeGreaterThanOrEqual(3)
  })
})

describe('the accent survives every preset', () => {
  it('stays visible against its own ground everywhere', () => {
    // #900000 on near-black fails, which is exactly why the inverse preset lifts
    // it. This test is the reason that lift is not a matter of taste.
    for (const preset of PRESETS) {
      const slots = resolve(preset)
      expect(ratio(slots.accent as string, slots.background as string)).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps its text legible on the accent itself', () => {
    for (const preset of PRESETS) {
      const slots = resolve(preset)
      expect(ratio(slots['accent-ink'] as string, slots.accent as string)).toBeGreaterThanOrEqual(
        4.5,
      )
    }
  })
})
