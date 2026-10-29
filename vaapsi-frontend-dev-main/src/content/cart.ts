/**
 * Cart copy.
 *
 * The governing rule: **no manufactured urgency.** No countdowns, no "3 people
 * are viewing this", no "hurry". The brand's whole thesis is honest disclosure,
 * and a fake timer contradicts it in the one place a shopper is most alert.
 *
 * The scarcity here is real, which is why stating it plainly is stronger than
 * dressing it up: there is one of these, and when it goes it is gone. That
 * sentence does more work than any timer, and it is true.
 */
export const cart = {
  title: 'Your bag',
  drawerTitle: 'Your bag',
  close: 'Close bag',
  count: (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,

  line: {
    remove: 'Remove',
    removeLabel: (title: string) => `Remove ${title} from your bag`,
    moveToWishlist: 'Save for later',
    movedToWishlist: 'Saved',
    /** Shown on a line whose garment sold while it was sitting here. */
    soldOut: 'Sold while it was in your bag',
    soldOutHelp: 'There was only one. Remove it to carry on.',
    reserved: 'Someone else is checking out',
    reservedHelp: 'Not yours yet. It may come back if they do not finish.',
  },

  summary: {
    heading: 'Summary',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    deliveryUnknown: 'Calculated at checkout',
    /**
     * India: prices are shown inclusive. Which is provisional, because who
     * invoices depends on the merchant-of-record model (PRD Q6) — so the note
     * says what it can stand behind and no more.
     */
    gstNote: 'Prices include GST where applicable.',
    total: 'Total',
    excludedNote: (n: number) =>
      `${n === 1 ? 'One piece is' : `${n} pieces are`} unavailable and not included.`,
  },

  checkout: {
    action: 'Checkout',
    /**
     * The blocking reason goes **on the button**, not in a toast. A toast that
     * explains why checkout failed and then disappears is the same as no
     * explanation — the shopper is left clicking a dead control.
     */
    blockedUnavailable: 'Remove unavailable pieces to continue',
    blockedEmpty: 'Nothing to check out',
    /** Checkout is out of v1 scope and the placeholder says so honestly. */
    notBuiltTitle: 'Checkout is not built yet',
    notBuiltBody:
      'This storefront is a design build. Payment, addresses and order confirmation are the next phase of work, and none of them are wired up — so there is deliberately nothing here that looks like a real payment screen.',
    notBuiltAction: 'Back to your bag',
  },

  empty: {
    title: 'Your bag is empty',
    /** Names what to do next. An empty screen is an invitation to act. */
    body: 'Everything on Vaapsi is one of one, so what is here today may not be tomorrow. Newest first is the useful way to browse.',
    action: 'See what just arrived',
    browseAll: 'Browse everything',
  },

  /** One-of-one, said once, in the summary. Not repeated on every line. */
  oneOfOne: 'Every piece is one of one. Nothing here is held for you until checkout.',
} as const
