# public/brand/

The real brand assets. Drop them here and flip one flag.

## Files

| File | What it is |
|---|---|
| `wordmark.svg` | The full lockup — "Vaapsi" with the red dot |
| `mark.svg` | The dot and stem alone, for tight spaces (favicon, app icon, a collapsed header) |

**SVG, not PNG.** The wordmark is drawn at every size from a 20px header to a
printed passport, and it has to stay crisp at all of them. Export with text
converted to outlines so it does not depend on a font being installed.

## Switching over

Set `USE_BRAND_ASSET = true` in `src/components/patterns/logo.tsx`. That is the
whole change — sizing, the accessible label and the mark variant already work.

## What the fallback does until then

The component sets the wordmark as live text in a didone serif, with the accent
dot placed as the tittle of a dotless final letter. It is a faithful stand-in,
not the asset: the letterforms are a typeface approximation and the dot position
is hand-tuned rather than drawn.

## Colour

The letterforms use `currentColor`, so the mark inverts with the theme for free.
**In the SVG, keep the letterforms `currentColor` and the dot a literal
`#900000`** — the dot is the one fixed point in the colour system and must not
invert. If the export hardcodes black letterforms, the logo will disappear on the
inverse preset.
