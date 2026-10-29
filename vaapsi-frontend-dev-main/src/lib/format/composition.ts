/**
 * Composition, shortened for a grid card.
 *
 * ## The rule
 *
 * A card has one line for this, and "98% cotton, 2% elastane" spends most of it
 * on the 2%. So when one fibre dominates, only that one is named:
 *
 *   98% cotton, 2% elastane  →  98% cotton
 *   100% cotton              →  100% cotton
 *   60% cotton, 40% hemp     →  60% cotton, 40% hemp
 *
 * **The percentage is kept, not rounded away.** "98% cotton" is the honest
 * short form; "cotton" alone would imply 100% and quietly drop the stretch,
 * which is exactly the thing a shopper buying denim wants to know about. The
 * number is what makes the abbreviation truthful rather than lossy.
 *
 * Where the blend is genuinely mixed, every fibre is named — a 60/40 is not a
 * "60% cotton" garment in any useful sense, and hiding the 40% would be a real
 * misrepresentation rather than a tidy-up.
 *
 * The full string stays on the product page. This is a card-only shortening.
 */

/**
 * At or above this share, a fibre is treated as *the* material and the rest are
 * trace amounts. 80% is the line because it is comfortably past the point where
 * a blend reads as a blend — a 75/25 cotton-linen is a cotton-linen, while a
 * 98/2 cotton-elastane is cotton that stretches.
 */
const DOMINANT_THRESHOLD = 80

type Fibre = { percentage: number; name: string; raw: string }

/**
 * Parse "98% cotton, 2% elastane" into its parts.
 *
 * Tokens without a percentage — "leather trim" on the shoulder bag — are kept
 * aside rather than dropped or guessed at. They are trim, not composition, and
 * they never win the dominant test because they have no number to compare.
 */
function parse(composition: string): { fibres: Fibre[]; unmeasured: string[] } {
  const fibres: Fibre[] = []
  const unmeasured: string[] = []

  for (const part of composition.split(',')) {
    const token = part.trim()
    if (token === '') continue
    const match = /^(\d+(?:\.\d+)?)\s*%\s*(.+)$/.exec(token)
    if (match === null) {
      unmeasured.push(token)
      continue
    }
    fibres.push({ percentage: Number(match[1]), name: match[2]!.trim(), raw: token })
  }

  return { fibres, unmeasured }
}

/**
 * The card form. Returns the input unchanged when it cannot be parsed, so an
 * unexpected string degrades to "shown in full" rather than to empty.
 */
export function formatComposition(composition: string): string {
  const { fibres } = parse(composition)
  if (fibres.length === 0) return composition.trim()

  const dominant = fibres.reduce((best, fibre) =>
    fibre.percentage > best.percentage ? fibre : best,
  )

  if (dominant.percentage >= DOMINANT_THRESHOLD) return dominant.raw

  // A real blend. Name every measured fibre, heaviest first, and leave trim out
  // of a line that is already at its limit.
  return [...fibres]
    .sort((a, b) => b.percentage - a.percentage)
    .map((fibre) => fibre.raw)
    .join(', ')
}

/**
 * The dominant fibre, as a filter handle: `cotton`, `linen`, `wool`.
 *
 * Derived from the composition label rather than stored as its own field, so a
 * garment's filter facet cannot drift from what its care label says. A blend
 * answers to its heaviest fibre — a 60/40 cotton-hemp appears under cotton —
 * because a shopper filtering for cotton wants that garment in the results, and
 * the card still prints the full blend so nothing is hidden.
 *
 * Returns `null` for anything unparseable, and callers drop it from the facets
 * rather than inventing a bucket.
 */
export function primaryMaterial(composition: string): string | null {
  const { fibres } = parse(composition)
  if (fibres.length === 0) return null
  const dominant = fibres.reduce((best, fibre) =>
    fibre.percentage > best.percentage ? fibre : best,
  )
  return dominant.name.trim().toLowerCase()
}

/** Sentence case, for a filter row. */
export function materialLabel(material: string): string {
  return material.charAt(0).toUpperCase() + material.slice(1)
}
