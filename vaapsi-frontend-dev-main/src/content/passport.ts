/**
 * ============================================================================
 * THE PASSPORT'S NAME
 * ============================================================================
 *
 * Undecided. "Digital Product Passport" is compliance language, and there is
 * almost certainly a better name in the brand — this is the single most
 * shopper-facing noun on the site.
 *
 * Every surface references the constants below and nothing hardcodes the word.
 * Renaming it is an edit to these five lines, not a find-and-replace across
 * fifty components. Do not break that.
 *
 * OPEN: name to be decided with Kanu. `PASSPORT_NAME` is a working title.
 */
export const PASSPORT_NAME = {
  /** Sentence-case, mid-sentence: "see the passport". */
  singular: 'passport',
  /** Plural, mid-sentence. */
  plural: 'passports',
  /** Title-case, standalone: a nav item, a section heading, a page title. */
  title: 'The Passport',
  /**
   * The formal/regulatory name. Used once, in the small print on the record
   * side, where the compliance term is the correct term.
   */
  formal: 'Digital Product Passport',
  /** Article + singular, for flowing copy: "this garment has a passport". */
  withArticle: 'a passport',
} as const

export const passportCopy = {
  /** One line, wherever the passport needs explaining in passing. */
  oneLiner: 'A record of where a garment has been, kept with the garment.',

  /** For the explainer route at /passport. */
  explainer: {
    eyebrow: 'How it works',
    title: `${PASSPORT_NAME.title}`,
    standfirst:
      'Every garment we can trace, we do. Where it was made, what it is made of, who has owned it, what was mended and by whom. It stays with the garment when the garment changes hands.',
  },

  /** Section headings on the passport itself. */
  sections: {
    front: 'The story',
    back: 'The record',
    origin: 'Origin',
    materials: 'Made of',
    care: 'Care',
    journey: 'Journey',
    impact: 'What this saves',
    declaration: 'As originally declared',
    corrections: 'Corrections',
    identifiers: 'Identifiers',
    scan: 'Scan',
  },

  /**
   * The voluntary statement. Stated plainly, as a credibility asset rather than
   * a disclaimer — claiming regulatory backing you do not have is the fastest
   * way to lose the trust the passport exists to build.
   */
  voluntary:
    'Published by choice. This passport is not issued under EU regulation — we keep it because a garment with a history is worth more than one without.',

  regulated: 'Issued under EU regulation by the brand, before this garment reached us.',

  /** Provenance legend. Encoded by fill, not colour, so it survives greyscale. */
  provenance: {
    legendTitle: 'Where this came from',
    verified: 'Checked by us, or by a party we name',
    supplier: 'From the brand or manufacturer',
    self_declared: 'Told to us by the seller, unchecked',
    ai_extracted: 'Read off a label or invoice by software',
    ai_suggested: 'Inferred by software, not read off anything',
  },
} as const
