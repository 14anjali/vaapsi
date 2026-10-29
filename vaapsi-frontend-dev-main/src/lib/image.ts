/**
 * Encode quality for photography.
 *
 * Next's default is 75, which is tuned for photographs coming off a camera —
 * plenty of headroom in the source, one lossy pass, nothing to compound. Our
 * product frames are not that. They arrive already compressed (most of
 * `public/products/` sits at 65–130 KB/megapixel, against 200–350 for the hero
 * shots), so the optimizer's pass is a *second* lossy generation over an image
 * that has already lost its fine detail. Denim is the worst possible subject
 * for that: twill weave, topstitching and wash streaks are exactly the
 * high-frequency texture both passes throw away first, and the result reads as
 * soft or blocky rather than as a photograph.
 *
 * 90 costs bandwidth and buys back the weave. It is deliberately applied to
 * garment photography and the editorial bands only — icons, flags and the logo
 * are not photographs and gain nothing from it.
 *
 * This is a mitigation, not a fix. No encode quality invents resolution that
 * was never in the file: the product sources are 638–1200 px wide, and the PDP
 * hero frame asks for up to ~1900 device pixels on a retina screen. Above the
 * source width the optimizer stops and the browser stretches what it gets. The
 * real fix is re-exported photography at 2000 px on the long edge — see
 * `public/products/README.md`.
 */
export const PHOTO_QUALITY = 90
