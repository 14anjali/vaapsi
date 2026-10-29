/** Listing page copy. */
export const shop = {
  title: 'Everything available',
  /** Live result count. Says "one of one" without saying it. */
  count: (total: number) => `${total} ${total === 1 ? 'piece' : 'pieces'}`,

  filters: {
    heading: 'Filter',
    open: 'Filter',
    close: 'Close filters',
    clearAll: 'Clear all',
    /** Mobile sheet CTA. Reflects the pending selection, before applying. */
    apply: (total: number) =>
      total === 0 ? 'No pieces match' : `Show ${total} ${total === 1 ? 'piece' : 'pieces'}`,
    applyPending: 'Counting…',
    groups: {
      brand: 'Brand',
      condition: 'Condition',
      gender: 'For',
      type: 'Type',
      material: 'Material',
      size: 'Size',
      price: 'Price',
    },
    /** "For" reads better than "Gender" on a shop filter and asks the same thing. */
    genderLabels: {
      women: 'Women',
      men: 'Men',
      unisex: 'Unisex',
    },
    /** Garment type, in shopper words rather than in catalogue words. */
    typeLabels: {
      tops: 'Shirts and tops',
      bottoms: 'Jeans and trousers',
      dresses: 'Dresses and jumpsuits',
      outerwear: 'Jackets',
      knitwear: 'Knitwear',
      ethnicwear: 'Ethnicwear',
      suiting: 'Blazers and suiting',
      accessories: 'Bags and accessories',
    },
    priceMin: 'From',
    priceMax: 'To',
    priceUnit: '₹',
    sizeSystem: 'Sizes shown in',
    activeCount: (count: number) => `${count} applied`,
  },

  sort: {
    label: 'Sort',
    options: {
      newest: 'Newest',
      /**
       * "Popular", not "Best selling". The ordering is curated until there is
       * order history to count, and the label must not out-claim the data.
       */
      popular: 'Popular',
      price_asc: 'Price, low to high',
      price_desc: 'Price, high to low',
    },
  },

  loadMore: {
    /**
     * A button, not infinite scroll. Infinite scroll makes the footer
     * unreachable and breaks back-navigation — you scroll through ninety
     * garments, open one, come back, and start again from the top.
     */
    label: 'Load more',
    remaining: (remaining: number) => `${remaining} more`,
    exhausted: 'That is everything',
  },

  empty: {
    title: 'Nothing matches all of that',
    /**
     * The empty state names which filter is too narrow and offers to clear
     * that one. "No results found. Try adjusting your filters." puts the work
     * back on the shopper without telling them where to start.
     */
    bodyWithCulprit: (label: string) => `${label} is the narrowest thing you have chosen.`,
    bodyGeneric: 'Try loosening one of your filters.',
    clearOne: (label: string) => `Clear ${label.toLowerCase()}`,
    clearAll: 'Clear everything',
  },

  /** Human labels for filter groups, for the empty state and the applied chips. */
  filterLabels: {
    brands: 'Brand',
    conditions: 'Condition',
    genders: 'For',
    materials: 'Material',
    types: 'Type',
    sizes: 'Size',
    price: 'Price',
    query: 'Search',
  },
} as const
