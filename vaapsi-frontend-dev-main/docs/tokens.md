# Tokens

Everything visual in this app is a CSS custom property in
`src/styles/tokens.css`. That file is the **only** one allowed to contain a
colour literal or a `font-family` declaration, and a test
(`src/styles/__tests__/token-hygiene.test.ts`) fails the build if that stops
being true.

Two documented exemptions: the QR code (needs literal black-on-white to scan) and
the studio panel (deliberately unthemed — see `decisions.md` §11).

---

## How it fits together

```
tokens.css              defines --background, --ink, --text-xl, --space-4, …
   ↓
tailwind.config.ts      maps them to utilities: bg-background, text-ink, text-xl
   ↓
components              only ever use the utilities
```

A component never learns what colour it is. That is what makes the studio panel a
config change instead of a rewrite.

Colour is stored as **bare HSL triplets** (`0 0% 100%`), not `hsl(...)` strings,
so Tailwind can wrap them with an alpha channel: `bg-accent/20` works.

---

## Colour

### Vaapsi slots

Semantic, never literal. There is no `--grey-400`.

| Token              | Job                                                      |
| ------------------ | -------------------------------------------------------- |
| `--background`     | The page itself                                          |
| `--surface`        | A panel on the page — filter rails, separated cards      |
| `--surface-raised` | A panel above that — dialogs, popovers, sheets           |
| `--ink`            | Primary text                                             |
| `--ink-muted`      | Secondary — supporting copy, metadata, measurements      |
| `--ink-subtle`     | Tertiary — timestamps, captions                          |
| `--line`           | Hairline rules. Decoration                               |
| `--line-strong`    | A boundary that identifies a control. **Must clear 3:1** |
| `--accent`         | The dot. The entire colour story                         |
| `--accent-ink`     | Text on the accent                                       |

### The shadcn set

`--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`,
`--destructive`, `--border`, `--input`, `--ring` and their `-foreground` pairs.

**These are mapped onto the Vaapsi slots and never given values of their own**
(`--card: var(--surface-raised)`). A shadcn primitive dropped in unmodified
therefore already looks like Vaapsi.

### Presets

Three: `mono` (default), `inverse`, and print.

`mono` lives on `:root` so it is also the fallback. `inverse` is a
`[data-theme='inverse']` block that redefines only what changes — the cascade
fills in the rest. Print is a `@media print` block doing the same thing.

**Adding a fourth is about twelve lines:**

```css
[data-theme='sepia'] {
  --background: 40 30% 96%;
  --surface: 40 25% 93%;
  --surface-raised: 40 30% 98%;
  --ink: 30 20% 12%;
  --ink-muted: 30 12% 38%;
  --ink-subtle: 30 10% 52%;
  --line: 40 18% 86%;
  --line-strong: 35 15% 55%;
  --accent: 0 100% 28%;
  --accent-ink: 40 30% 98%;
}
```

Then add `'sepia'` to `COLOR_PRESETS` in `src/components/theme/presets.ts` and a
label in `COLOR_PRESET_LABELS`. The studio panel picks it up automatically.

**Before you commit it, run `pnpm test src/styles`.** The contrast suite checks
every preset, so a new one is checked the moment it exists. That is the whole
reason the switcher is safe to hand to a client.

---

## Type

### The load-everything-once strategy

Seven families are loaded at build time by `next/font/google`
(`src/components/theme/fonts.ts`), each into its own variable. Two **semantic
slots** then point at them:

```css
--font-display: var(--font-jost), ui-sans-serif, system-ui, sans-serif;
--font-body: var(--font-jost), ui-sans-serif, system-ui, sans-serif;
```

Switching a preset reassigns those two properties and loads nothing. No flash, no
layout shift, instant on a client call.

**When a direction is signed off, delete the unused six families from
`fonts.ts`.** That deletion is the intended end state.

### Pairings

| Preset                  | Display          | Body    | Weight shift                         |
| ----------------------- | ---------------- | ------- | ------------------------------------ |
| `modernist` _(default)_ | Jost             | Jost    | —                                    |
| `didone`                | Bodoni Moda      | Jost    | display → 500                        |
| `grotesk`               | Archivo          | Inter   | emphasis → 500                       |
| `editorial`             | Instrument Serif | DM Sans | display → 400 (single weight family) |
| `heritage`              | EB Garamond      | Inter   | display → 500                        |

The weight shifts matter: Bodoni at 400 and Jost at 400 do not carry the same
visual weight, and a preset that cannot compensate looks broken in one of its
states.

### Scale

`--text-xs` (12px) through `--text-6xl` (84px), modular, base 15px for body.

**Tracking tightens as size increases** — `--tracking-xs: 0.03em` down to
`--tracking-6xl: -0.036em`. Display type set at body tracking looks loose; body
type set at display tracking is unreadable.

Each Tailwind size ships with its own tracking and leading, so `text-4xl` is a
complete typographic decision rather than a size that still needs two more
classes.

`--tracking-caps: 0.09em` for uppercase eyebrows, which need the opposite
treatment.

### Weights

Semantic, so a preset can shift them: `--weight-body`, `--weight-emphasis`,
`--weight-display`.

Tailwind exposes them as `font-regular`, `font-emphasis`, `font-heading` —
**deliberately not** `font-body`/`font-display`, which are the _families_.
Tailwind generates both as `font-*`, so they cannot share names, and `cn()` is
extended to tell them apart (see `decisions.md` and `src/lib/utils/cn.ts`).

### Adding a pairing

1. Load the family in `fonts.ts` into a new variable.
2. Add it to `fontVariables`.
3. Add a `[data-font='name']` block in `tokens.css` setting both slots and any
   weight shift.
4. Add the name to `FONT_PRESETS` and an entry to `FONT_PRESET_LABELS`.
5. Add it to `FONT_VARIABLE` in `studio-panel.tsx` so the live specimen renders.

---

## Space, radius, motion

| Group     | Tokens                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Space     | `--space-0` … `--space-48`. 4px base. Plus `--gutter`, responsive                                    |
| Radius    | `--radius-none` … `--radius-xl`, `--radius-full`. Default `--radius: var(--radius-sm)` — near-square |
| Motion    | `--duration-instant` … `--duration-slower`, `--ease`, `--ease-exit`                                  |
| Elevation | `--elevation-none`, `-overlay`, `-sheet`. No decorative shadow in this direction                     |
| Layout    | `--measure` (68ch), `--measure-narrow` (46ch), `--container-max`                                     |

**Radius is near-square on purpose, and it is a token so it can be tested rather
than being an assumption baked into fifty components.**

**Vertical rhythm is `--space-section`, consumed through the `Section`
primitive** (`components/primitives/section.tsx`). Do not pick a `py-` value for
a page section — use `Section`, or `py-section` / `py-section-tight` if you need
the raw utility. Those two tokens are the density dial for the whole site.

The JS side of motion lives in `src/lib/motion/index.ts` and mirrors the duration
tokens in seconds. Keep the two in step — everything animated reads from there,
and no component defines a duration inline.

---

## Checking your work

```bash
pnpm test src/styles     # token hygiene + contrast at every preset
pnpm dev                 # then visit /tokens
```

`/tokens` renders a full specimen sheet from tokens only — colour swatches, the
type scale, weights, space, radius, motion and elevation. Set
`data-theme="inverse"` or `data-font="didone"` on `<html>` in devtools and the
whole sheet restyles. If something does not change there, it is hardcoded
somewhere.
