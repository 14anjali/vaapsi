import { PASSPORT_NAME } from './passport'

/**
 * Home page copy.
 *
 * Written to plain rules: sentence case, real verbs, specific over clever, and
 * nothing that could appear on any other retailer's site. "Every piece has a
 * record of where it has been" is a claim only this business can make.
 * "Sustainable fashion for a better tomorrow" is a claim nobody can check.
 *
 * Where a number appears, it comes from the data, not from here.
 */
export const home = {
  /**
   * The three doors off the home page.
   *
   * This replaced a rotating full-bleed carousel. The carousel was better
   * photography and a worse front door: it said what the business is about but
   * gave a shopper arriving with an intention nowhere to put it, and the one
   * link it carried was buried under a four-second rotation. Three equal tiles
   * make the choice the page's whole content — the shopper picks a route in one
   * look, and no frame is more important than another, which is why they are
   * equal thirds rather than a feature plus two thumbnails.
   *
   * Titles are short because they are set large. "New Arrivals" at display size
   * over a photograph is legible at a glance; a sentence is not.
   */
  heroTiles: {
    /** Read by screen readers as the page heading; the tiles carry no h1 each. */
    heading: 'Shop Vaapsi',
    /** Announced as the set's accessible name. */
    label: 'Where to start',
    tiles: [
      {
        title: 'New Arrivals',
        /** One line under the title. Says what is behind the door. */
        note: 'The latest in, newest first',
        href: '/shop?sort=newest',
        image: {
          src: '/hero/1-hanger.jpg',
          alt: 'A pair of pale, well-worn jeans on a wooden hanger in afternoon light',
        },
      },
      {
        title: 'Best Sellers',
        note: 'What people keep choosing',
        href: '/shop?sort=popular',
        image: {
          src: '/hero/2-jacket.jpg',
          alt: 'Someone in a faded denim trucker jacket over a white t-shirt, standing against a tree',
        },
      },
      {
        title: 'Pre-loved',
        note: 'Second-hand, graded and recorded',
        href: '/pre-loved',
        image: {
          src: '/hero/3-line.jpg',
          alt: 'Five pairs of jeans pegged out to dry on a line against a yellow wall',
        },
      },
    ],
  },

  newIn: {
    eyebrow: 'New in',
    title: 'Just arrived',
    /** Says out loud what one-of-one means for browsing behaviour. */
    note: 'Each of these is the only one. What is here today may not be tomorrow.',
    cta: 'See everything',
    /** Screen-reader instruction for the horizontal rail. */
    railLabel: 'Recent arrivals',
    /** The rail's scroll controls. Named for what they do, not which way they point. */
    previous: 'Scroll back through recent arrivals',
    next: 'Scroll forward through recent arrivals',
  },

  /**
   * The passport sequence. Numbered markers are right *here specifically*,
   * because this genuinely is an ordered process. Nothing else on the site is
   * numbered.
   *
   * The verbs are the real vocabulary from the data model — declared, inspected,
   * verified, relisted — so the interface and the record use the same words.
   */
  howItWorks: {
    eyebrow: 'How it works',
    title: `${PASSPORT_NAME.title}`,
    lede: 'Four steps, and you can see all of them on every garment that has one.',
    steps: [
      {
        verb: 'Declared',
        body: 'Whoever owned it tells us what they know — where it came from, what it is made of, what has happened to it. That first version is kept exactly as written, permanently.',
      },
      {
        verb: 'Inspected',
        body: 'It arrives at our studio. Two people check it against the declaration, take the measurements, photograph every flaw, and grade the condition.',
      },
      {
        verb: 'Verified',
        body: 'Anything we could confirm is marked as confirmed, and anything we could not is marked as told to us. If we got the first version wrong, the correction is added — the original stays.',
      },
      {
        verb: 'Relisted',
        body: 'It goes back up with its whole history attached. When you buy it, the record comes with it, and it is there for whoever has it after you.',
      },
    ],
  },

  /**
   * ==========================================================================
   * WHO IT IS CUT FOR
   * ==========================================================================
   *
   * The split above the category grid, and the two are answering different
   * questions on purpose. "Who is it for" narrows the catalogue by half in one
   * click; "what kind of garment" narrows it by type. A shopper almost always
   * knows the first before the second, which is why it sits first.
   *
   * ## Why not "gender"
   *
   * Because the word is wrong for what the control actually does. This is not
   * asking who the shopper is — it is filtering by how a garment is *cut*, and
   * `Gender` in the product contract is documented in exactly those terms:
   * "who a garment is cut for". Using the data model's own words keeps the
   * interface and the record speaking the same language, and it sidesteps a
   * label that reads as a question about the person rather than the trousers.
   *
   * It also happens to be the honest description of the behaviour. A unisex
   * garment answers to **both** halves rather than to neither, so neither
   * listing is a closed set — see the filter in `lib/data/mock`. "Gender" would
   * imply a partition that the data deliberately does not make.
   *
   * ## Two tiles, and no third
   *
   * There is no "unisex" tile, even though `unisex` is a real value. It is not
   * a third audience a shopper shops from; it is a property of the garment that
   * puts it in both lists. A third tile would read as a separate department and
   * would be the smallest of the three, which is the opposite of what it means.
   *
   * `/shop/unisex` does resolve — the listing route accepts any gender segment —
   * but nothing links to it, here or in the nav. That is the right split: the URL
   * being valid costs nothing, while advertising it would make the two halves
   * above look like closed sets.
   */
  audience: {
    eyebrow: 'Browse',
    title: 'Who it is cut for',
    /** Says out loud that the two lists overlap, rather than letting it surprise. */
    note: 'Pieces cut straight show up in both.',
    items: [
      {
        label: 'Women',
        note: 'Dresses, skirts, jeans and jackets',
        href: '/shop/women',
        image: {
          src: '/products/beas-denim-skirt/4-worn.jpg',
          alt: 'A woman in a dark indigo denim corset top and wide-leg jeans, carrying a straw basket',
        },
      },
      {
        label: 'Men',
        note: 'Truckers, chore coats and straight jeans',
        href: '/shop/men',
        image: {
          src: '/products/kaveri-trucker-jacket/2-worn.jpg',
          alt: 'A man in a mid-wash denim tailored jacket over an open white shirt',
        },
      },
    ],
  },

  categories: {
    eyebrow: 'Browse',
    title: 'By category',
    /**
     * Every href points at a category that actually has stock. A dead category
     * link on the home page is worse than a shorter list — and because the
     * category route validates against the live facets, an empty one 404s.
     *
     * ## The photographs
     *
     * Real garment photography, chosen frame by frame, replacing the
     * `picsum.photos` placeholders that were here — five unrelated landscapes on
     * a denim shop's home page, which said nothing about what is behind each
     * link and made the section read as unfinished.
     *
     * Each cell crops to 4:3, so the frame is picked for what survives a
     * landscape crop rather than for being the best photograph of the garment:
     * a flat-laid jacket and a shoulder bag are wide subjects, a worn full-length
     * shot crops to the middle of the body, and a construction close-up crops
     * anywhere. Frames whose subject sits at the top or bottom of the portrait
     * original are not usable here however good they are.
     *
     * The images are decorative — `alt=""`. The link already announces
     * "Jackets, truckers and chore coats", and describing the photograph on top
     * of that makes a screen reader read the same tile twice.
     */
    items: [
      {
        label: 'Jackets',
        href: '/shop/outerwear',
        note: 'Truckers and chore coats',
        image: '/products/chenab-trucker-jacket/1-primary.jpg',
      },
      {
        label: 'Jeans and skirts',
        href: '/shop/bottoms',
        note: 'Broken in already',
        image: '/products/ravi-straight-jean/2-worn.jpg',
      },
      {
        label: 'Dresses',
        href: '/shop/dresses',
        note: 'Shirt dresses and jumpsuits',
        image: '/products/sutlej-shirt-dress/2-worn.jpg',
      },
      {
        label: 'Shirts and waistcoats',
        href: '/shop/tops',
        image: '/products/yamuna-chambray-shirt/3-detail.jpg',
      },
      {
        label: 'Bags',
        href: '/shop/accessories',
        // The one high-resolution frame in the set — 2048px, and a Vaapsi
        // patchwork tote rather than a stock photograph.
        image: '/hero/4-bag.jpg',
      },
    ],
  },

  condition: {
    eyebrow: 'Condition',
    title: 'What the grades mean',
    /**
     * This section exists to remove the single biggest objection in resale, so
     * it gets real space rather than a line in an FAQ. The promise is the copy.
     */
    lede: 'Five grades, applied by hand at our studio, and the same five every time. We would rather you knew exactly what you are getting than be pleasantly surprised once and disappointed twice.',
    note: 'Every flaw is photographed and shown on the garment page. Nothing is left for you to find.',
    cta: 'How we grade',
  },

  editorial: {
    /** The breathing room in the page. One image, one statement. */
    statement: 'The most sustainable garment is the one that already exists.',
    imageAlt: 'A rail of pre-loved denim in a studio, photographed in daylight',
  },
} as const
