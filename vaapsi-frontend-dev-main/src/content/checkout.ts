/**
 * Checkout copy.
 *
 * ## What this route is, and what it deliberately still is not
 *
 * The details step is real: contact, address, a delivery choice, and — as of the
 * demo build — a **mock payment step that is labelled as a mock on every screen
 * it appears on**. See the long note on `payment` below for exactly how it is
 * kept impossible to mistake for a live checkout, and why that exception was
 * made deliberately rather than by drift.
 *
 * Nothing here is submitted anywhere. There is no network call in the whole
 * flow, no card is accepted except one test number, and no field is persisted.
 */
export const checkout = {
  title: 'Checkout',
  eyebrow: 'Almost there',

  steps: {
    contact: 'Contact',
    address: 'Delivery address',
    delivery: 'How it gets to you',
    payment: 'Payment',
  },

  contact: {
    email: 'Email',
    emailHelp: 'For the order confirmation and the tracking link.',
    phone: 'Phone',
    phoneHelp: 'The courier will use this. Ten digits.',
  },

  address: {
    name: 'Full name',
    line1: 'Flat, house number, building',
    line2: 'Street, area',
    landmark: 'Landmark (optional)',
    city: 'City',
    state: 'State',
    pin: 'PIN code',
  },

  /**
   * ============================================================================
   * DELIVERY
   * ============================================================================
   *
   * Two groups, and the split is the whole design.
   *
   * **Get it soon** — Standard, included. **Wait, and pay less** — two tiers of
   * the same trade, banded together so they read as one choice with a dial
   * rather than as two unrelated options competing with Standard. 10% for 30
   * days, 15% for 40.
   *
   * ## Why the discount tiers are grouped
   *
   * Three flat radio rows make a shopper compare three things. A default plus a
   * banded pair makes them answer one question first — do I want it soon, or
   * cheaper — and then a smaller one inside the answer. It is the same
   * information arranged so the decision is smaller.
   *
   * ## Express is gone
   *
   * It was the only paid tier, and it pointed the wrong way. Everything else on
   * this page — one-of-one stock, consolidated dispatch, a discount for waiting
   * — says the same thing: this is not a next-day business. Selling a ₹250
   * upgrade to 1–2 working days on a resale marketplace promises a courier
   * commitment nobody has signed (PRD open question #8), and it made the page
   * argue with itself, offering to charge for speed on one row and to pay for
   * patience two rows down.
   *
   * `feeInr` stays on the shape. Not one option uses it today, but a paid tier
   * is a live possibility once the courier contract exists, and the summary
   * arithmetic already handles it correctly.
   *
   * ## What the copy does not do
   *
   * It does not call the slow option "unhurried" or dress the wait up as a
   * lifestyle. The offer is plain: wait this long, pay this much less. A shopper
   * choosing a 40-day window is making a real sacrifice and the interface should
   * treat it as a transaction, not a virtue.
   *
   * ⚠️ **NEEDS SIGN-OFF, AND THE WINDOWS ARE THE RISK.** 30 and 40 days are very
   * long for apparel — long enough that cancellations and "where is my order"
   * contacts become the dominant cost, which can exceed the margin the discount
   * was meant to buy. The percentages and the windows both need finance and the
   * courier contract behind them (PRD open question #8) before this is live.
   */
  delivery: {
    heading: 'Delivery',
    soonHeading: 'Get it soon',
    waitHeading: 'Wait longer, pay less',
    /** Sits under the discount group and states the trade in one line. */
    waitNote: 'We hold your order and send it with others going the same way.',

    /** Shown on the selected discount tier. */
    applied: 'Applied',
    /** A paid tier's differential, e.g. "+₹250". Unused while none exists. */
    extra: (amount: string) => `+${amount}`,
    /** The saving on a discount tier, in rupees. Rendered in `--positive`. */
    saves: (amount: string) => `You save ${amount}`,

    isProvisional: true,
    provisionalNote: 'Dates and rates are estimates until the courier confirms.',

    /** Prefixes the estimated date wherever one is shown. */
    arrives: (window: string) => `Arrives ${window}`,
    /** The summary column's own arrival line. */
    arrivingLabel: 'Arriving',

    /**
     * ## The fee is a real number now
     *
     * Delivery used to read "Included", which was defensible when it was
     * genuinely free and is a lie the moment it is not. A flat ₹99 is charged on
     * every tier and stated as an amount, because a shopper adding up an order
     * should be able to see every rupee in it — a hidden shipping cost folded
     * into garment prices is the single most complained-about pattern in Indian
     * ecommerce.
     *
     * It is flat across all three tiers on purpose. The consolidated tiers give
     * their benefit as a discount on the garments, so putting a *second*
     * variable in the delivery line would mean two numbers moving at once for
     * one choice.
     *
     * ⚠️ **₹99 NEEDS SIGN-OFF.** It is a plausible flat rate for apparel in
     * India, not a quoted one, and it does not vary by weight or distance the
     * way a real courier contract will (PRD open question #8). A free-over-a-
     * threshold rule is the other obvious shape and would change this line.
     *
     * ## Lead times, not window strings
     *
     * `lead` is structured so the interface can state a date. `workingDays`
     * matters: Standard's 4–6 skips weekends, while the consolidated tiers count
     * calendar days, because "about 30 days" is understood as a month rather
     * than as six weeks. See `lib/format/arrival`.
     */
    options: [
      {
        id: 'standard',
        group: 'soon',
        label: 'Standard',
        /** Integer paise added to the order. */
        feeInr: 9_900,
        discountPercent: 0,
        lead: { minDays: 4, maxDays: 6, workingDays: true },
      },
      {
        id: 'save10',
        group: 'wait',
        label: '10% off',
        feeInr: 9_900,
        discountPercent: 10,
        lead: { minDays: 28, maxDays: 32, workingDays: false },
      },
      {
        id: 'save15',
        group: 'wait',
        label: '15% off',
        feeInr: 9_900,
        discountPercent: 15,
        lead: { minDays: 38, maxDays: 42, workingDays: false },
      },
    ],
  },

  /**
   * ============================================================================
   * PAYMENT — A DEMO MOCK, LABELLED AS ONE
   * ============================================================================
   *
   * This repo held the line for a long time that `/checkout` must not contain a
   * fake payment screen, on the grounds that a stub gets believed and the phase
   * that builds it stops being estimated honestly. That reasoning still stands,
   * and this is a deliberate, scoped exception for a demo — not a reversal.
   *
   * So the mock is built to be **impossible to mistake for the real thing**:
   *
   * - A persistent banner on the payment step saying it is a demo and that no
   *   payment is taken. It is not dismissible and it is not small print.
   * - **No real card capture.** The card field accepts only the one test number
   *   below and rejects anything else, so a real card cannot be typed in even by
   *   accident. Nothing is transmitted; there is no network call at all.
   * - No card details are persisted, logged, or put in component state beyond
   *   the render that shows them.
   * - The route stays `noindex`.
   *
   * When real payment lands, this whole object and `MockPayment` are deleted
   * together. Do not evolve this into the real integration — start again against
   * the provider's SDK, because the shape below is designed to look right rather
   * than to be right.
   *
   * ## The method chooser is four tiles, not four stacked rows
   *
   * Payment method is one of the few genuinely *iconic* choices in a checkout:
   * a card, a phone, a bank, cash. Every shopper already holds a mental picture
   * of each, so a tile with a mark on it is recognised before it is read, while
   * a column of identical radio rows has to be read line by line. The icon is
   * doing recognition work here, not decoration — which is the only reason it
   * is allowed on a page this restrained.
   *
   * ## Card is the one method that gets a picture of itself
   *
   * Selecting Card renders a card *face*, and the fields sit where the embossing
   * is on the physical object: the number across the middle, the name bottom
   * left, the expiry bottom right, the CVV on the back. Nobody has to work out
   * which box wants which group of digits, because the layout is one they have
   * held in their hand.
   *
   * The other three methods get no such treatment, and that asymmetry is the
   * point. UPI, net banking and cash on delivery do not *happen* here — they
   * hand off to an app, a bank page, or to the courier at the door. Drawing an
   * elaborate form for a step that occurs somewhere else would be inventing an
   * interface for a screen we do not own. So each one states plainly where it
   * continues and stops.
   */
  payment: {
    heading: 'Payment',

    methodLabel: 'How you would like to pay',

    /**
     * `icon` names a mark in `PAYMENT_ICONS` in `MockPayment`. It is a key, not
     * a component, so this file stays copy and imports nothing.
     */
    methods: [
      { id: 'card', label: 'Card', note: 'Visa, Mastercard, RuPay', icon: 'card' },
      { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm', icon: 'upi' },
      { id: 'netbanking', label: 'Net banking', note: 'All major banks', icon: 'bank' },
      { id: 'cod', label: 'Cash on delivery', note: 'Pay the courier', icon: 'cash' },
    ],

    card: {
      number: 'Card number',
      /**
       * The only values the field accepts. A real card cannot be entered.
       *
       * Two of them now rather than one, because the card face shows the
       * network it detects and a single Visa PAN meant the Mastercard mark was
       * unreachable. Both are the publicly published test numbers every payment
       * provider documents — they are not anybody's card, and they fail a real
       * authorisation by design.
       */
      testNumbers: ['4111 1111 1111 1111', '5555 5555 5555 4444'],
      testHint: 'Demo cards: 4111 1111 1111 1111 (Visa) or 5555 5555 5555 4444 (Mastercard)',
      rejected: 'Only the demo card numbers are accepted here.',
      expiry: 'Expiry',
      expiryPlaceholder: 'MM/YY',
      cvv: 'CVV',
      cvvHint: 'Three digits on the back.',
      name: 'Name on card',
      namePlaceholder: 'As printed on the card',
      /** Stands in for the embossed number before anything is typed. */
      numberBlank: '•••• •••• •••• ••••',
      nameBlank: 'YOUR NAME',
      expiryBlank: 'MM/YY',
      /**
       * Engraved on the card face.
       *
       * This is now the *only* place the screen says the payment step is a mock,
       * since the banner above it was removed as stating the obvious. It stays,
       * and it stays on the object: a screenshot cropped to the card is still
       * labelled, which is exactly the case a banner outside the frame missed.
       */
      faceMark: 'Demo card',

      /**
       * Card networks, matched by the number's leading digits (its IIN range).
       *
       * Detected live as the shopper types, so the mark on the card changes on
       * the first digit rather than waiting for a valid number — which is the
       * behaviour that makes it feel like a real card rather than a validation
       * result.
       *
       * The marks are drawn in the house monochrome rather than reproduced in
       * brand colours. Naming the network of the card you just typed is ordinary
       * nominative use, but a pixel-copy of somebody's trademark on a demo
       * screen is not something this repo should carry — and a red-and-yellow
       * roundel would be the only colour on the page besides the accent.
       */
      networks: [
        { id: 'visa', label: 'Visa', pattern: '^4' },
        { id: 'mastercard', label: 'Mastercard', pattern: '^(5[1-5]|2[2-7])' },
        { id: 'rupay', label: 'RuPay', pattern: '^(60|65|81|82|508)' },
        { id: 'amex', label: 'Amex', pattern: '^3[47]' },
      ],
      /** Spoken label for the flip control; the card turns to show the CVV. */
      flipToBack: 'Show the back of the card',
      flipToFront: 'Show the front of the card',
    },

    /**
     * The three hand-off methods. Each says where it continues, and none of
     * them pretends the step happens on this page.
     */
    handoff: {
      /** Sits on every hand-off panel, above the specifics. */
      continues: 'This carries on outside Vaapsi',
    },

    upi: {
      id: 'UPI ID',
      placeholder: 'yourname@bank',
      hint: 'Nothing is sent. Any value is fine in the demo.',
      handoff:
        'On a live order this opens your UPI app — GPay, PhonePe or Paytm — and you approve the payment there. Enter an ID here if you want to see the flow.',
    },

    netbanking: {
      label: 'Bank',
      banks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'],
      handoff:
        'On a live order you would be taken to your bank to sign in and authorise the payment, then returned here.',
    },

    /**
     * ⚠️ **NOT SIGNED OFF.** Added so the client has something to react to, and
     * it is a real commercial decision rather than a UI one: COD on one-of-one
     * resale means a refused parcel comes back as unsold stock after a
     * fortnight in transit, and the return leg is on us. It also cannot be
     * offered with the 30- and 40-day discount tiers without holding a garment
     * for six weeks against a promise to maybe pay. Needs a call before launch
     * (PRD open question #8, alongside the courier contract).
     */
    cod: {
      handoff:
        'You pay the courier when the parcel reaches you. Card and UPI are accepted at the door; keep the exact amount if you are paying cash.',
      /** Shown on the tile and in the summary. Nothing is charged in the demo. */
      dueOnDelivery: 'Due on delivery',
      pendingNote: 'Cash on delivery is provisional and still to be confirmed.',
    },
  },

  /**
   * The confirmation gate.
   *
   * The last thing between a filled-in form and a placed order, and it exists
   * because "Pay" as a bare button is the most consequential control on the site
   * with the least ceremony around it. It restates what is being bought, what it
   * costs, and when it arrives — the three things someone regrets getting wrong
   * — and requires a second, explicit action.
   *
   * It is a **centred modal** rather than a side drawer or an inline expander,
   * and that is not a styling preference. A drawer is a place you slide open and
   * browse — the bag, the filters, the nav all live at an edge and go back
   * there. This has no home to return to: it is one question, asked once, and it
   * should arrive in front of the shopper rather than beside them. Sliding it in
   * from the right made the most consequential moment in the flow read like
   * another panel to skim.
   *
   * ## It summarises; it does not re-list
   *
   * The right-hand column of the page already itemises the order with a
   * photograph, colour, size and composition per line. Repeating all of that
   * inside the dialog gave the shopper the same table twice and buried the four
   * facts that actually gate the decision: how many garments, what arrives when,
   * what is saved, what is charged. So the dialog shows the garments as a strip
   * of thumbnails — enough to recognise the order at a glance — and then those
   * four numbers.
   */
  confirm: {
    trigger: 'Review and pay',
    title: 'Are you sure you want to buy?',
    body: 'Once confirmed, a pre-loved garment is gone from the catalogue — there is only one of each.',
    itemsLabel: 'What you are buying',
    /** The thumbnail strip's count, e.g. "3 garments". */
    itemCount: (count: number) => `${count} ${count === 1 ? 'garment' : 'garments'}`,
    /** Sits on the strip when more lines exist than thumbnails shown. */
    more: (count: number) => `+${count}`,
    subtotalLabel: 'Subtotal',
    savedLabel: 'You save',
    totalLabel: 'You will pay',
    deliveryLabel: 'Arriving',
    payingLabel: 'Paying by',
    cancel: 'Not yet',
    confirm: 'Yes, place the order',
    /** Shown while the mock "processes". */
    placing: 'Placing your order…',
  },

  /** The result. A demo order, and it says so. */
  placed: {
    eyebrow: 'Order placed',
    title: 'Thank you',
    body: 'This is a demo order, so nothing has actually been charged or dispatched.',
    reference: 'Reference',
    continueAction: 'Keep shopping',
  },

  summary: {
    heading: 'Your order',
    /** The line items. A checkout that does not show what is being bought is
        asking for a card number on trust. */
    itemsHeading: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
    empty: 'Your bag is empty.',
    emptyAction: 'Back to the shop',
    subtotal: 'Subtotal',
    discount: 'Delivery discount',

    /**
     * One delivery line, labelled just "Delivery".
     *
     * It used to be "Delivery · 15% off — Included", which was two mistakes in
     * one row: it repeated the tier name the green discount line above already
     * carries, and "Included" described a charge that now exists. The tier is
     * named once, on the line that states what it saved.
     */
    deliveryLabel: 'Delivery',

    /**
     * GST, shown as the component of the total that it is.
     *
     * Not added on top. Every price on this site is GST-inclusive, which is what
     * a displayed price means in India, so the total does not move when this row
     * appears — it tells a shopper how much of what they are already paying is
     * tax. See the long note in `lib/format/gst`, including the rate split and
     * the resale question that is still open.
     *
     * The old "tax shown at payment, GST treatment being finalised" note is
     * gone. A checkout that will not commit to the tax on the order is asking
     * for a card number against an incomplete number.
     */
    gst: 'GST',
    gstIncluded: 'included',

    total: 'Total',
  },
} as const

export type DeliveryOptionId = (typeof checkout.delivery.options)[number]['id']
export type DeliveryOption = (typeof checkout.delivery.options)[number]
