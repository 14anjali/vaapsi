/**
 * ============================================================================
 * ACCOUNT, PURCHASES AND RESALE — COPY
 * ============================================================================
 *
 * The through-line: **you can only sell back something you bought here.** Every
 * string in this file either states that, follows from it, or gets out of its
 * way.
 *
 * That rule is why the resale flow has no sign-up and no listing form. The
 * seller photographs the garment, and the photographs do two jobs at once —
 * they prove it is ours, and they are what the condition and the price are read
 * from. So the copy never asks anyone to "create a listing"; it asks them to
 * show us the thing.
 *
 * ⚠️ **The assessment is a demonstration, not a valuation.** There is no model
 * behind it (see `lib/data/resale`). The copy says so where a seller could
 * otherwise reasonably believe a number is a promise, and it never says
 * "AI-powered" as though that were a disclosure.
 */

export const accountCopy = {
  menu: {
    trigger: 'Your account',
    greeting: 'Your account',
    /**
     * Typed as one shape rather than left to inference, so `note` exists on
     * every member and a consumer can read it without narrowing five variants.
     */
    items: [
      {
        label: 'Your purchases',
        href: '/account/purchases',
        // Says the connection out loud rather than leaving a "Sell something"
        // action orphaned elsewhere with no route into it.
        note: 'Track an order, or sell one back',
      },
      { label: 'Saved pieces', href: '/wishlist', note: undefined },
      { label: 'Addresses', href: '/account/addresses', note: undefined },
      { label: 'Payment methods', href: '/account/payment', note: undefined },
      { label: 'Your details', href: '/account/details', note: undefined },
    ],
  },

  hub: {
    eyebrow: 'Your account',
    title: 'Your account',
    /**
     * Sign-in is real now, so this no longer claims the whole account is a
     * fixture — it narrows the claim to the parts that still are. Saying
     * "demo account" when the name and email are genuinely the shopper's would
     * be the same mistake in reverse.
     */
    demoTitle: 'Some of this is still demo data',
    demoBody:
      'Your name, email and phone are your own. Saved addresses, cards and the purchases below are still fixture data — those endpoints are not built yet. The resale flow they lead into works end to end.',
  },

  purchases: {
    eyebrow: 'Your account',
    title: 'Your purchases',
    lede: 'Everything you have bought from us. Each piece can be sent back to be sold on.',
    empty: 'You have not bought anything yet.',
    emptyAction: 'Have a look at what is new',

    orderRef: (reference: string) => `Order ${reference}`,
    placedOn: (date: string) => `Placed ${date}`,
    deliveredTo: (where: string) => `Delivered to ${where}`,
    paid: 'Paid',
    /** The action on each line. The whole point of this page. */
    sellAction: 'Sell this back',
    /** When it has already been sent back. */
    resaleInProgress: 'Being sold',
    resaleInProgressNote: 'With us for inspection. We will confirm the listing price.',
    statuses: {
      placed: 'Placed',
      dispatched: 'On its way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
  },

  /**
   * ============================================================================
   * THE RESALE FLOW
   * ============================================================================
   *
   * Four steps, and the order matters. Photographs come *first*, because they
   * are the authorisation — everything after them is conditional on the garment
   * being ours. Asking for a price before we know what the thing is would be
   * asking a stranger to name a number for an unidentified object.
   */
  sell: {
    eyebrow: 'Sell it back',
    title: (name: string) => `Sell your ${name}`,
    /** States the provenance rule in the first line a seller reads. */
    lede: 'You bought this from us, so we already know what it is, what you paid and when. Show us its condition and we will tell you what it is worth.',

    /** The honest framing of what the read actually is. */
    disclosure:
      'The read below is a demonstration built on your order — its age, its fabric and what you tell us. There is no valuation model behind it yet, and nothing is charged or committed until the garment reaches our studio.',

    steps: {
      photos: 'Show us the piece',
      declare: 'Anything we should know',
      quote: 'What it is worth',
      price: 'Your price',
    },

    photos: {
      heading: 'Show us the piece',
      lede: 'Five frames. The first two are what let us list it without an account — the label proves it is ours, the flat shot proves it is this one.',
      required: 'Needed',
      optional: 'Optional',
      add: 'Add photo',
      added: 'Added',
      remove: 'Remove',
      /** The demo shortcut. Named as one. */
      simulate: 'Use a sample photo',
      simulateNote:
        'File upload is not wired up in the demo. Adding a frame here stands in for photographing it.',
    },

    declare: {
      heading: 'Anything we should know',
      lede: 'Marks, repairs, a hem taken up. Telling us costs you nothing extra — a flaw you declare is priced exactly the same as one we find, and declaring it is what makes the listing believable to a buyer.',
      placeholder: 'A small ink mark on the back pocket',
      add: 'Add',
      none: 'Nothing to declare',
      customisationsLabel: 'I had something added to it',
      customisationsNote:
        'Embroidery, patches, a charm. Additions raise the price here rather than lowering it — a piece nobody else has is worth more, not less.',
    },

    quote: {
      heading: 'What it is worth',
      verified: 'Confirmed as yours',
      uncertain: 'We need a closer look',
      noMatch: 'We could not confirm this',
      conditionLabel: 'Our read of the condition',
      flawsLabel: 'What we found',
      flawsNote: 'Each one is priced separately, so you can see exactly what it costs.',
      declaredByYou: 'You told us',
      foundByUs: 'We spotted this',
      additionsLabel: 'What you added',
      factorsLabel: 'How we got there',
      rangeLabel: 'Pieces like this sell for',
      /** Emphasises that the range is the market, not our offer. */
      rangeNote:
        'That is what comparable pieces have gone for, not an offer from us. You set the price.',
    },

    price: {
      heading: 'Your price',
      label: 'Ask for',
      useSuggested: 'Use the middle of the range',
      /** The out-of-bounds flag. A warning, never a block. */
      flagTitle: 'Worth a second look',
      payoutLabel: 'You would receive',
      payoutNote: (percent: number) => `After our ${percent}% share of the sale.`,
      submit: 'Send it in',
      submitNote:
        'We will email a prepaid label. Nothing is listed until the piece reaches the studio and a person has checked it.',
    },

    done: {
      eyebrow: 'On its way',
      title: 'We will look out for it',
      body: 'Post it with the label we email you. Once it arrives, two people check it against these photographs and confirm the price with you before it goes live.',
      reference: 'Reference',
      backAction: 'Back to your purchases',
    },

    blocked: {
      title: 'We need to see the label',
      body: 'Without a readable Vaapsi label we cannot confirm the piece is one of ours, and the label is what stands in for signing in. Add that frame and we will take another look.',
    },
  },

  addresses: {
    eyebrow: 'Your account',
    title: 'Addresses',
    lede: 'Where your orders go, and where a prepaid resale label is sent.',
    default: 'Default',
    addAction: 'Add an address',
  },

  payment: {
    eyebrow: 'Your account',
    title: 'Payment methods',
    lede: 'Cards we hold for checkout, and where a resale payout lands.',
    default: 'Default',
    expires: (expiry: string) => `Expires ${expiry}`,
    addAction: 'Add a card',
    /** Said plainly, because a demo holding card data would be a real problem. */
    demoNote:
      'Demo data. Only a brand and the last four digits are ever held here — never a full card number.',
  },

  details: {
    eyebrow: 'Your account',
    title: 'Your details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    /**
     * These are the shopper's real details now. Still read-only, because the
     * API has no update endpoint — so the note says "read-only", not "demo".
     */
    demoNote: 'Read-only for now. Editing needs an update endpoint on the account service.',
  },
} as const

/** Our cut of a resale, as a percentage. Provisional — needs sign-off. */
export const RESALE_COMMISSION_PERCENT = 20
