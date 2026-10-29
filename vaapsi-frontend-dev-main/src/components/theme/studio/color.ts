/**
 * Hex ⇄ HSL-triplet conversion, for the studio panel's colour inputs.
 *
 * The tokens are bare HSL triplets ("0 100% 28%") because that is the shadcn
 * convention and it lets Tailwind add an alpha channel. `<input type="color">`
 * only speaks hex. This file is the translation layer, and it is the only place
 * in the repo that needs to know both.
 *
 * Kept out of `lib/format` deliberately: it exists for one internal tool and has
 * no business being available to the storefront.
 */

/** `"0 100% 28%"` → `"#900000"`. Returns black for anything unparseable. */
export function hslTripletToHex(triplet: string): string {
  const parts = triplet.trim().split(/\s+/)
  const h = Number.parseFloat(parts[0] ?? '')
  const s = Number.parseFloat((parts[1] ?? '').replace('%', ''))
  const l = Number.parseFloat((parts[2] ?? '').replace('%', ''))
  if ([h, s, l].some((n) => !Number.isFinite(n))) return '#000000'

  const sat = s / 100
  const light = l / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let [r, g, b] = [0, 0, 0]
  if (hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const m = light - c / 2
  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** `"#900000"` → `"0 100% 28%"`. Rounded to whole numbers, as the tokens are. */
export function hexToHslTriplet(hex: string): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '0 0% 0%'

  const r = Number.parseInt(full.slice(0, 2), 16) / 255
  const g = Number.parseInt(full.slice(2, 4), 16) / 255
  const b = Number.parseInt(full.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min

  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * What a token is *currently* resolving to on `<html>`.
 *
 * Used so a swatch with no override still shows the real preset colour rather
 * than a guess. A swatch that lies about the current value is worse than no
 * swatch, because the client adjusts from what they think they see.
 */
export function readComputedSlot(slot: string): string | null {
  if (typeof window === 'undefined') return null
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(`--${slot}`)
    .trim()
  return value === '' ? null : value
}
