import { products } from './products'
import { rupees } from '@/lib/format/currency'
import type { Account, Order, OrderLine, ResaleShot } from '@/lib/types'
import type { Product, ProductSummary } from '@/lib/types'

/**
 * The demo account, and its purchase history.
 *
 * ## Why these particular orders
 *
 * The resale flow can only start from a purchase, so the fixture history has to
 * contain the cases the flow needs to demonstrate:
 *
 * - **A new-stock line bought in a specific colourway** (the Indus jean in raw
 *   indigo, W30), so the listing can be pre-filled with a variant rather than
 *   with a product's default.
 * - **An old line**, bought fourteen months ago, so depreciation by age has
 *   something to bite on and the quote is visibly lower than the price paid.
 * - **A recent line**, so the opposite case shows too.
 * - **A line already sent back**, so the UI has to show a resale in progress
 *   rather than offering to sell the same garment twice.
 * - **A pre-loved line**, because someone who bought second-hand can resell it
 *   again — that is the whole point of the model, and it is the case a
 *   "only new purchases" shortcut would quietly break.
 *
 * Real auth is the stack's job (`docs/integration.md`). When it lands, the only
 * change is where the account id comes from.
 */

function summary(product: Product): ProductSummary {
  const primary = product.images.find((image) => image.kind === 'primary') ?? product.images[0]!
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    listingType: product.listingType,
    gender: product.gender,
    condition: product.condition,
    color: product.color,
    composition: product.composition,
    colorVariants: product.colorVariants,
    size: product.size,
    priceInr: product.priceInr,
    originalRetailInr: product.originalRetailInr,
    currency: product.currency,
    availability: product.availability,
    passportId: product.passportId,
    primaryImage: primary,
  }
}

function bySlug(slug: string): Product {
  const found = products.find((product) => product.slug === slug)
  if (found === undefined) {
    // A fixture pointing at a garment that no longer exists is a bug worth
    // failing loudly on, not one worth rendering an empty order for.
    throw new Error(`account fixture: no product with slug "${slug}"`)
  }
  return found
}

function line(
  id: string,
  slug: string,
  options: {
    colorName?: string
    sizeLabel?: string
    pricePaidInr?: number
    resaleRequestId?: string
  } = {},
): OrderLine {
  const product = bySlug(slug)
  return {
    id,
    product: summary(product),
    selection:
      options.colorName === undefined
        ? null
        : { colorName: options.colorName, sizeLabel: options.sizeLabel ?? product.size.label },
    size: product.size,
    // Historical. Never refreshed from the live price — the depreciation in a
    // resale quote is measured against what this person actually paid.
    pricePaidInr: options.pricePaidInr ?? product.priceInr,
    resaleRequestId: options.resaleRequestId ?? null,
  }
}

export const account: Account = {
  name: 'Meher Kapoor',
  email: 'meher.k@example.in',
  phone: '+91 98200 41155',
  addresses: [
    {
      id: 'adr_home',
      label: 'Home',
      line1: '14, Sunder Nagar',
      line2: 'Near Lodhi Gardens',
      city: 'New Delhi',
      state: 'Delhi',
      pin: '110003',
      isDefault: true,
    },
    {
      id: 'adr_work',
      label: 'Work',
      line1: 'Cyber Hub, Tower B, 6th floor',
      line2: null,
      city: 'Gurugram',
      state: 'Haryana',
      pin: '122002',
      isDefault: false,
    },
  ],
  // Last four and a brand. Never a full number — there is no reason for a
  // storefront to hold one, demo or otherwise.
  cards: [
    { id: 'crd_1', brand: 'Visa', last4: '4242', expiry: '04/29', isDefault: true },
    { id: 'crd_2', brand: 'Mastercard', last4: '8210', expiry: '11/27', isDefault: false },
  ],
}

export const orders: readonly Order[] = [
  {
    id: 'ord_2607_0041',
    reference: 'VP-2607-0041',
    // Fourteen months ago, so depreciation by age is visible in the quote.
    placedAt: '2025-07-04T10:24:00.000Z',
    status: 'delivered',
    lines: [
      line('orl_1', 'indus-straight-jean', {
        colorName: 'Raw indigo',
        sizeLabel: 'W30',
        pricePaidInr: rupees(3_900),
      }),
      line('orl_2', 'kaveri-trucker-jacket', {
        colorName: 'Ecru',
        sizeLabel: 'M',
        pricePaidInr: rupees(5_200),
      }),
    ],
    totalPaidInr: rupees(9_100),
    deliveredTo: 'Home · New Delhi',
  },
  {
    id: 'ord_2610_0388',
    reference: 'VP-2610-0388',
    placedAt: '2025-10-19T06:12:00.000Z',
    status: 'delivered',
    lines: [
      // Bought second-hand, and resellable again. The case a "new purchases
      // only" shortcut would silently break.
      line('orl_3', 'gomti-waistcoat', { pricePaidInr: rupees(1_450) }),
      line('orl_4', 'yamuna-chambray-shirt', {
        colorName: 'Indigo',
        sizeLabel: 'M',
        pricePaidInr: rupees(2_600),
      }),
    ],
    totalPaidInr: rupees(4_050),
    deliveredTo: 'Home · New Delhi',
  },
  {
    id: 'ord_2702_0917',
    reference: 'VP-2702-0917',
    placedAt: '2026-02-11T13:40:00.000Z',
    status: 'delivered',
    lines: [
      // Already on its way back, so the UI shows progress instead of offering
      // to sell the same garment twice.
      line('orl_5', 'chandra-denim-blazer', {
        colorName: 'Mid indigo',
        sizeLabel: 'M',
        pricePaidInr: rupees(6_200),
        resaleRequestId: 'rsl_existing_1',
      }),
    ],
    totalPaidInr: rupees(6_200),
    deliveredTo: 'Work · Gurugram',
  },
  {
    id: 'ord_2708_1204',
    reference: 'VP-2708-1204',
    // Recent, so the quote sits close to what was paid.
    placedAt: '2026-08-26T09:05:00.000Z',
    status: 'dispatched',
    lines: [
      line('orl_6', 'sindhu-denim-overshirt', {
        colorName: 'Mid wash',
        sizeLabel: 'L',
        pricePaidInr: rupees(3_100),
      }),
    ],
    totalPaidInr: rupees(3_100),
    deliveredTo: 'Home · New Delhi',
  },
]

/**
 * The shot list a seller is walked through.
 *
 * Prescribed, not "upload some photos". Each frame answers one question the
 * assessment has to answer, and naming them is what makes an automated read
 * possible — a folder of arbitrary pictures is not something you can grade.
 *
 * The tag shot is the provenance claim and the only one that cannot be skipped:
 * it is what stands in for a login. The others are gradeable but optional,
 * because a seller who cannot photograph a hem should still get a quote, with
 * the assessment saying it was working from less.
 */
export const RESALE_SHOTS: readonly ResaleShot[] = [
  {
    id: 'tag',
    label: 'The label',
    instruction: 'Photograph the inside label so the brand and size are readable.',
    purpose: 'Confirms the piece is ours, and which piece. This is what replaces a login.',
    required: true,
  },
  {
    id: 'front',
    label: 'Front, laid flat',
    instruction: 'Lay it flat on a plain surface in daylight and shoot straight down.',
    purpose: 'Matches the shape and wash against the garment you bought.',
    required: true,
  },
  {
    id: 'back',
    label: 'Back, laid flat',
    instruction: 'Turn it over, same surface, same light.',
    purpose: 'Seat and knee wear on trousers, yoke and elbows on a jacket.',
    required: false,
  },
  {
    id: 'wear',
    label: 'Anywhere it is worn',
    instruction: 'Close up on any fading, mark or repair — including ones you like.',
    purpose: 'Priced honestly either way. A repair is history, not damage.',
    required: false,
  },
  {
    id: 'extras',
    label: 'Anything you added',
    instruction: 'Embroidery, patches, charms — whatever you had done to it.',
    purpose: 'Additions raise the price rather than lowering it.',
    required: false,
  },
]
