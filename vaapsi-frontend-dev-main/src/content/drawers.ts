/**
 * Copy for the product-page drawers.
 *
 * Two drawers, matching the pattern the client asked for: **Product details**
 * and **Delivery and returns**. Both slide in over the detail column, dim the
 * photograph behind them, and close on Escape or the X.
 *
 * What is *not* in a drawer, deliberately: **condition and flaws**. Prada uses
 * this pattern for specification — fabric, dimensions, product code — which is
 * reference material a shopper consults. On resale, condition is not reference
 * material, it is the purchase decision, and burying it behind a link would
 * undo the reason the rest of the page is trustworthy. It stays on the page.
 */
export const drawers = {
  close: 'Close',

  /**
   * Tab labels inside the Product details drawer. Four questions a shopper might
   * have, each answered in its own panel rather than stacked down the page.
   */
  tabs: {
    specification: 'Details',
    condition: 'Condition',
    passport: 'History',
    impact: 'What this saves',
  },

  details: {
    /** The trigger text in the detail column. */
    trigger: 'Product details',
    heading: 'Product details',
    /** Section headings inside the drawer. */
    sections: {
      /**
       * `about` is gone: it rendered `conditionNotes`, which the condition block
       * on the page already shows. One fact, one home.
       */
      specification: 'Specification',
      measurements: 'Measurements',
      materials: 'Made of',
      care: 'Care',
      origin: 'Origin',
      identifiers: 'Identifiers',
    },
    measurementsNote: 'Taken flat, in centimetres. Sizing varies by brand — go by these.',
    /**
     * Materials and care come off the passport, so a garment without one has
     * neither. Saying so is better than an empty heading.
     */
    materialsUnknown:
      'Composition is not recorded for this piece. It has no passport, so what we know is what the seller told us and what we could see.',
    careUnknown: 'No care instructions recorded. Treat it as the fabric suggests.',
    productCode: 'Product code',
    listed: 'Listed',
    seller: 'Listed by',
  },

  delivery: {
    trigger: 'Delivery and returns',
    heading: 'Delivery and returns',
    sections: {
      delivery: 'Delivery',
      returns: 'Returns',
      oneOfOne: 'One of one',
    },
    /**
     * PROVISIONAL, and it says so. The courier is not appointed (PRD Q8) and the
     * C2C returns position is unresolved (PRD Q7). Writing confident delivery
     * copy over an unappointed courier is how a storefront promises something
     * the business does not do.
     */
    deliveryBody:
      'Enter a PIN code on the product page for an estimate. Free delivery on orders above ₹2,000. The courier network is being finalised, so the window is an estimate rather than a promise.',
    returnsBody:
      'The returns position for pre-loved pieces is being finalised. What we can commit to now: every flaw is photographed and every measurement is taken by hand before a piece goes live, so what arrives is what you saw.',
    oneOfOneBody:
      'There is one of each piece here. Nothing is held for you until checkout completes, and once a piece sells we do not restock it — but its record stays online for whoever owns it next.',
  },
} as const
