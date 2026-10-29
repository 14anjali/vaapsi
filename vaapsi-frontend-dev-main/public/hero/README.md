# public/hero/

The home page hero frames. Editorial photography — denim being worn, hung, dried
and remade — not product shots. The frames and their alt text are declared in
`hero.slides` in `src/content/home.ts`; the files here are what those paths point
at.

## Resolution and shape — read before replacing these

The files are **2048x2731 (3:4 portrait)**, and the aspect ratio is not
cosmetic.

`HeroTiles` renders each frame in a 3:4 portrait box with `object-cover`. These
were previously 2400x1500 landscape crops, which pixelated badly: `sizes` in
Next's `<Image>` is **width**-based, so a 33vw tile on a 1920px screen asked for
a 640px-wide file — only 400px tall at 1.6:1 — and `object-cover` then upscaled
it ~2x to fill an ~850px-tall box. The source was large enough; it was the wrong
shape.

So any replacement must be **3:4 portrait**, and at least ~2000px wide so the
largest variant Next serves (a 2x display on a 1920px viewport needs ~1280 device
px) is still a downscale. A landscape photograph dropped in here will look soft
again no matter how many megapixels it has.

These are cropped from the full-resolution Unsplash originals — same photographs
and same IDs as before, so the credits below are unchanged. The crops are
anchored to keep each subject and to leave the quieter part of the frame at the
bottom, where the tile's title sits.

## Credits

All four are from Unsplash, under the Unsplash Licence, which permits commercial
use without permission or attribution. Attribution is not required, so none is
rendered on the page, but the photographers are recorded here because a credit
nobody wrote down is a credit nobody can give later.

| File            | Photographer        | Unsplash ID |
| --------------- | ------------------- | ----------- |
| `1-hanger.jpg`  | Jason Leung         | EtOMMg1nSR8 |
| `2-jacket.jpg`  | Alora Griffiths     | KKZmUQjTO2E |
| `3-line.jpg`    | Ricardo Gomez Angel | rNXy6ngoyQ0 |
| `4-bag.jpg`     | Bryan Dijkhuizen    | MbktGM5IcsE |

## Format

JPEG, 2400×1500 (16:10), quality 82. That ratio is close to what the hero box
actually is at desktop width, so `object-cover` has little to throw away, and
`next/image` derives the responsive variants from here.

They are centre-cropped from much larger originals with one exception: the hanger
shot is portrait, and cropping it centrally turns it into a macro of a pocket, so
it is anchored near the top to keep the hanger and the waistband in frame. If a
frame is ever re-cropped, check it at desktop width — the caption block sits over
the lower-left, so anything important down there is covered.

## Replacing them

Drop a new file in and point `hero.slides` at it. Write the alt text as a
description of the picture, not of the brand: someone who cannot see it should
get the photograph, not the marketing.
