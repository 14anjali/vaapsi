# public/products/

Real product photography goes here. Until a folder exists for a garment, the
fixtures fall back to `picsum.photos` placeholders.

## Convention

```
public/products/<product-slug>/
  1-primary.jpg      garment alone, light grey ground
  2-worn.jpg         model, full length, front
  3-detail.jpg       worn close-up, upper body
  4-detail.jpg       hardware or construction crop
  5-worn.jpg         model, full length, back
  6-label.jpg        macro on collar, waistband or brand mark
  flaw-1.jpg         each documented flaw, close
  flaw-2.jpg
```

The slug is `Product.slug` from `src/lib/data/fixtures/products.ts` — for example
`public/products/levis-501-original-straight-jeans-mid-indigo/1-primary.jpg`.

The full shot list, with the frame each one should be, is `SHOT_LIST` in that
same file. It is written as a photography brief so it can be handed to whoever
is shooting without them reading TypeScript.

## Switching a product over

Add its slug to `LOCAL_PHOTOGRAPHY` in `fixtures/products.ts`, mapped to the file
extension its frames were saved as. One line per garment, and the extension is
per-garment so a set shot as JPEG and a set shot as PNG can sit side by side.
Then pass the slug and the frame index to each `image()` call for that product —
the index is what turns into the `1-`, `2-`, `3-` prefix.

## Format

JPEG or WebP, 4:5, **2000px on the short edge**, saved at quality 90 or above
(roughly 250 KB per megapixel for a JPEG). `next/image` handles the responsive
variants, so one high-quality original per frame is enough — but it will only
ever downscale, never invent detail, so the original sets the ceiling for every
surface.

2000px is not a round number picked for comfort. The PDP hero frame is declared
`50vw` on desktop, so on a wide retina display the browser asks for ~1600–1900
device pixels of width. Above the original's width the optimizer stops and hands
back the original, which the browser then stretches to fill the slot — that is
what soft product photography on a Mac or a modern phone actually is. The hero
shots in `public/hero/` are 2048px for the same reason.

The quality floor matters as much as the pixel count. Every frame here gets one
more lossy pass from the optimizer on the way out (see `PHOTO_QUALITY` in
`src/lib/image.ts`), so an original that is already over-compressed loses its
weave twice. Denim is the worst subject for that: twill, topstitching and wash
streaks are the first thing both passes discard.

**The current set does not meet this.** Every garment except
`tapti-straight-leg-jean` is 638–1107px wide, and several sit at 65–100 KB per
megapixel — a third of the density of the hero shots. They need re-exporting
from the originals, not upscaling; nothing downstream can recover detail that is
not in the file.

## Rights

Only photography Vaapsi owns or is licensed to use. Product shots lifted from
another brand's site are that brand's copyright, and a demo is not an exemption —
if it ends up in a deck or a shared link it is a real exposure, and it will not
survive to launch anyway.
