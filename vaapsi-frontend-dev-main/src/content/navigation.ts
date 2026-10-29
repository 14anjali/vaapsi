/**
 * Header and footer structure. Routes live beside their labels so a nav item
 * cannot drift out of sync with where it points.
 */

export type NavItem = {
  label: string
  href: string
  /** Match the pathname exactly rather than by prefix. For "/" only. */
  exact?: boolean
}

export const primaryNav: readonly NavItem[] = [
  { label: 'New', href: '/shop?sort=newest' },
  { label: 'Women', href: '/shop/women' },
  { label: 'Men', href: '/shop/men' },
  { label: 'Pre-loved', href: '/pre-loved' },
]

export const navLabels = {
  skipToContent: 'Skip to content',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  search: 'Search',
  searchPlaceholder: 'Brand, garment, size',
  wishlist: 'Wishlist',
  cart: 'Bag',
  /** Screen-reader text for the cart count. */
  cartCount: (count: number) => `${count} ${count === 1 ? 'item' : 'items'} in your bag`,
  cartEmpty: 'Your bag is empty',
  home: 'Vaapsi home',
  mainNav: 'Main',
  footerNav: 'Footer',
} as const

export const footerNav: readonly { heading: string; items: readonly NavItem[] }[] = [
  {
    heading: 'Shop',
    items: [
      { label: 'New', href: '/shop?sort=newest' },
      { label: 'Women', href: '/shop/women' },
      { label: 'Men', href: '/shop/men' },
      { label: 'Everything', href: '/shop' },
    ],
  },
  {
    heading: 'Circularity',
    items: [
      { label: 'How condition is graded', href: '/condition' },
      { label: 'Sell with us', href: '/pre-loved' },
      { label: 'Repairs', href: '/repairs' },
      { label: 'End of life', href: '/end-of-life' },
    ],
  },
  {
    heading: 'About',
    items: [
      { label: 'What Vaapsi is', href: '/about' },
      { label: 'How we authenticate', href: '/authentication' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Contact us', href: '/support' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Size guide', href: '/size-guide' },
      { label: 'Track an order', href: '/orders' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Grievance officer', href: '/grievance' },
    ],
  },
]

/**
 * India-specific footer marks.
 *
 * The GST line is a placeholder: who invoices, and therefore what the price
 * includes, depends on the merchant-of-record model (PRD open question #6). It
 * is stated here so the space exists and the omission is visible, rather than
 * being discovered at checkout.
 */
export const footerMeta = {
  country: 'India',
  currency: 'INR ₹',
  currencyNote: 'All prices in Indian rupees',
  gstNote: 'Prices include GST where applicable. Tax invoice issued with every order.',
  gstNoteIsPlaceholder: true,
  paymentMarks: ['UPI', 'Razorpay', 'PayU', 'Net banking', 'Cards'],
  copyright: (year: number) => `© ${year} Vaapsi. A BTR Global brand.`,
} as const
