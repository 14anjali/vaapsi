/**
 * Delivery, returns and seller copy.
 *
 * Everything here that describes a policy is marked as provisional, because the
 * policies genuinely are not settled (PRD open questions #6, #7 and #8). Writing
 * confident copy over an undecided policy is how a storefront ends up promising
 * something the business does not do.
 */
export const delivery = {
  pin: {
    label: 'Delivery',
    placeholder: '110001',
    action: 'Check',
    invalid: 'A PIN code is six digits and does not start with zero.',
    serviceable: (min: number, max: number) => `Estimated ${min}–${max} working days.`,
    /**
     * Says out loud that the estimate is an estimate and the courier is not
     * fixed. Honest, and it stops the number from becoming a promise.
     */
    estimateCaveat: 'An estimate. The courier is not yet confirmed for this route.',
    unserviceable: 'We cannot deliver here yet.',
    unserviceableHelp: 'Our courier network does not cover this PIN code. It is expanding.',
  },

  returns: {
    heading: 'Returns',
    /**
     * PROVISIONAL. The returns position on a C2C resale is unresolved — who
     * bears the cost, and whether a garment sold by an individual is returnable
     * at all, depends on the merchant-of-record model. Stated as provisional
     * rather than invented.
     */
    body: 'Returns policy for pre-loved pieces is being finalised. Every flaw is photographed before listing, so what you see is what arrives.',
    isProvisional: true,
  },

  seller: {
    heading: 'Listed by',
    vaapsi: 'Held and inspected at our own studio.',
    individual: 'Listed by an individual seller. Inspected by us before it went live.',
    memberSince: (date: string) => `On Vaapsi since ${date}`,
    verified: 'Identity verified',
    unverified: 'Identity not yet verified',
    listings: (count: number) => `${count} ${count === 1 ? 'listing' : 'listings'}`,
  },

  bag: {
    add: 'Add to bag',
    adding: 'Adding…',
    added: 'In your bag',
    reserved: 'Someone is checking out',
    reservedHelp: 'There is only one of these. It may become available again.',
    sold: 'Sold',
    soldHelp: 'There was only one, and it has gone. The record stays here.',
    oneOfOne: 'One of one. No second size, no restock.',
    viewBag: 'View bag',
  },
} as const
