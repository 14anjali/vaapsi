import { PASSPORT_NAME } from './passport'

/**
 * Copy for the /pre-loved route — the seller-side entry point.
 *
 * Two audiences read this page and they want opposite things. Someone with a
 * wardrobe to clear wants to know what they get and how much work it is.
 * Someone who followed the nav item out of curiosity wants to know why a resale
 * page exists on a brand's own site. The order below answers the first, because
 * the second is answered by the whole rest of the site.
 *
 * On the claims: nothing here quantifies the environmental case. "Keeps clothes
 * out of landfill for longer" is defensible; a percentage or a litres-of-water
 * figure is not, without a methodology behind it, and this is the kind of number
 * a regulator asks about. See PRD open questions — no LCA data exists yet.
 */
export const preLoved = {
  eyebrow: 'Pre-loved',
  title: 'Sell the Vaapsi you no longer wear',
  standfirst:
    'Send back a piece you have stopped reaching for. We check it, price it, and list it with its history attached — and someone else wears it instead of it sitting in a wardrobe.',

  /**
   * Why the brand runs resale itself rather than leaving it to a third-party
   * platform. Stated plainly, because a shopper's first assumption is that this
   * is a discount channel.
   */
  why: {
    eyebrow: 'Why we do this',
    title: 'A garment should outlast one owner',
    body: [
      'Clothes are made to last far longer than the time any one person wears them. Most of that life gets spent in a wardrobe, unworn, and then in a bin.',
      'Selling a piece back through us puts it in front of people who already want it, at a price that reflects its condition rather than its age. The garment stays in use, and the next owner pays less than they would new.',
    ],
  },

  /**
   * The seller sequence. Deliberately the same shape and vocabulary as the
   * buyer-facing passport steps on the home page — declared, inspected,
   * verified, relisted — because it is the same process seen from the other end.
   * A seller who reads this and later opens their garment's record sees their own
   * words in the first step.
   */
  how: {
    eyebrow: 'How selling works',
    title: 'Four steps, and you do one of them',
    steps: [
      {
        verb: 'You tell us',
        body: `What it is, where it came from, and anything that has happened to it. This becomes the first entry in the garment's ${PASSPORT_NAME.singular} and is kept exactly as you wrote it.`,
      },
      {
        verb: 'We inspect',
        body: 'It comes to our studio. Two people check it against what you told us, measure it, photograph every flaw and grade the condition.',
      },
      {
        verb: 'We price and list',
        body: 'Condition sets the price, not sentiment. You see it before it goes live, and nothing is listed without your agreement.',
      },
      {
        verb: 'You are paid',
        body: 'When it sells, your share is transferred. If it does not sell, you choose whether to lower the price or have it sent back.',
      },
    ],
  },

  /** What we take and what we do not. The question every seller asks second. */
  accepts: {
    eyebrow: 'What we take',
    title: 'Vaapsi pieces, in wearable condition',
    yes: [
      'Anything originally bought from Vaapsi, at any age.',
      'Worn, washed and visibly used — condition is graded, not a barrier.',
      'Repaired pieces. A repair is part of the record, not a mark against it.',
    ],
    no: [
      'Other brands. Not yet — authentication is per-brand work and we would rather do it properly than broadly.',
      'Pieces beyond wearing or repair. We will tell you how to recycle them instead.',
    ],
  },

  /**
   * The grid of what is actually here.
   *
   * The page argued for resale for three sections; this is the part that lets
   * someone act on it. It sits above the "what we take" section because a
   * shopper who is browsing rather than selling should not have to read the
   * intake rules to reach the stock.
   *
   * **This is where condition grades live.** They are off the general shop grid
   * now — new stock has no grade to show — so the pre-loved grid is the surface
   * that states them.
   */
  grid: {
    eyebrow: 'Available now',
    title: 'Pre-loved, in stock',
    lede: 'Every piece here is one of one, graded by hand, and sold with its record attached.',
    cta: 'See everything pre-loved',
    ctaHref: '/shop',
    /** When the adapter returns nothing. Honest, not a dead grid. */
    empty: 'Nothing pre-loved is in stock right now.',
  },

  /**
   * The CTA.
   *
   * **Not a fake sign-in form.** Auth does not exist in this codebase (see
   * docs/integration.md) and seller accounts are a later batch. A stubbed login
   * that goes nowhere reads as broken; worse, it makes everyone believe the
   * seller flow is finished and the phase that builds it stops being taken
   * seriously. So the button says what it is and the page says when it opens.
   */
  cta: {
    action: 'Sell your Vaapsi',
    /** Shown in place of the live flow until seller accounts exist. */
    notBuiltTitle: 'Seller accounts are not open yet',
    notBuiltBody:
      'Selling needs an account, and accounts are the next thing we are building. Until then, browse what other people have already sent back.',
    notBuiltAction: 'Shop pre-loved',
    notBuiltHref: '/shop',
    /** Named so the phase that replaces this is unambiguous. */
    phase: 'Phase 7 — auth and seller accounts',
  },
} as const
