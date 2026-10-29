import {
  Archivo,
  Bodoni_Moda,
  DM_Sans,
  EB_Garamond,
  Instrument_Serif,
  Inter,
  Jost,
} from 'next/font/google'

/**
 * All seven families, loaded at BUILD TIME by next/font/google, each into its
 * own CSS variable.
 *
 * This is the load-everything-once strategy, and it is a deliberate trade. The
 * cost is more font payload than any single preset needs. What it buys:
 *
 * - next/font keeps its build-time subsetting, self-hosting and preloading.
 *   Nothing is fetched from Google at runtime.
 * - Switching a preset reassigns two custom properties. No font loads, so no
 *   flash of fallback text and no layout shift mid-review.
 * - A client clicking through five directions on a call sees each one land
 *   instantly, which is the entire point of the studio panel.
 *
 * When a direction is signed off, delete the six unused families from this file
 * and the payload problem goes away with them. That deletion is the intended
 * end state, not a cleanup someone forgot.
 *
 * Weights are narrow on purpose — this is a near-monochrome, restrained
 * direction and it does not use eight weights of anything.
 */

// `subsets` and `display` are repeated on every call rather than hoisted into a
// shared object. next/font is a build-time transform and requires explicitly
// written literals — a shared constant fails the loader, not just the types.

export const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-jost',
})

export const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-bodoni',
})

export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-archivo',
})

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-inter',
})

// Instrument Serif ships a single weight. That is the family, not an oversight.
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-instrument',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-dm-sans',
})

export const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-garamond',
})

/** Every font variable, for the <html> className. */
export const fontVariables = [
  jost.variable,
  bodoniModa.variable,
  archivo.variable,
  inter.variable,
  instrumentSerif.variable,
  dmSans.variable,
  ebGaramond.variable,
].join(' ')
