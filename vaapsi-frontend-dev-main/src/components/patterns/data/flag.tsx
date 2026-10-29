import { cn } from '@/lib/utils'

/**
 * A national flag, beside a place.
 *
 * ## Why these are files and not markup
 *
 * A flag is the one graphic on this site whose colours are not ours to choose.
 * They cannot be tokens, they must not shift with the colour preset, and they
 * must not be tinted to fit the palette — a recoloured flag is a wrong flag. So
 * they live in `public/flags/` as SVG and are loaded as images, which keeps the
 * literals out of every component and out of the token hygiene rule for the
 * right reason rather than by exemption.
 *
 * This is a deliberate crack in the "spend colour only on the accent dot" rule.
 * It is narrow: five small marks, in one block of the product drawer, against a
 * page that is otherwise monochrome. Adding a sixth country is a file and a line
 * in `FLAGS` below.
 *
 * ## The hairline
 *
 * Japan and Italy are mostly white, and on a white page a flag with a white
 * field has no edge at all — it reads as a red dot floating next to the word
 * "Japan". Every flag gets the same hairline so the set stays consistent rather
 * than two of them looking like a special case.
 *
 * The `translate-y` sets it against the cap height of the first line rather
 * than the top of the line box, which is where an inline image would otherwise
 * sit.
 *
 * ## Matching
 *
 * Places arrive as free text: `India`, `Okayama, Japan`, `Kaithal, Haryana,
 * India`. The country is the last comma-separated part, so that is what gets
 * matched, and anything unrecognised renders nothing at all rather than a guess.
 * `Unknown — label removed before intake` is a real value in this data and it
 * must not acquire a flag.
 */

/**
 * Country name to ISO 3166-1 alpha-2, which is the filename.
 *
 * Deliberately not a full country list. Every entry here is a flag that exists
 * in `public/flags/`, so the map and the assets cannot drift apart — a country
 * with no file simply is not in it.
 */
const FLAGS: Readonly<Record<string, string>> = {
  india: 'in',
  bangladesh: 'bd',
  italy: 'it',
  japan: 'jp',
  china: 'cn',
}

/** The last comma-separated part of a place, lowercased. */
export function countryCodeFor(place: string): string | null {
  const last = place.split(',').at(-1)?.trim().toLowerCase()
  if (last === undefined || last === '') return null
  return FLAGS[last] ?? null
}

export function Flag({ place, className }: { place: string; className?: string }) {
  const code = countryCodeFor(place)
  if (code === null) return null

  return (
    // Plain <img>: these are a few hundred bytes of SVG each, so there is
    // nothing for the image pipeline to optimise, and `fill` would need a sized
    // wrapper at every call site.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.svg`}
      // Decorative. The country is written out immediately beside it, and a
      // screen reader announcing "flag of India, India" is noise.
      alt=""
      aria-hidden
      className={cn(
        'inline-block h-[0.85em] w-auto shrink-0 translate-y-[0.32em] border border-line',
        className,
      )}
    />
  )
}
