import type { Metadata } from 'next'
import type { Passport, Product, Seller } from '@/lib/types'
import { conditionCopy } from '@/content/product'

/**
 * SEO helpers.
 *
 * Two things here are worth stating out loud, because they are the ones a
 * generic e-commerce setup gets wrong for a resale marketplace:
 *
 * 1. **Availability is a real signal, not a formality.** `ItemAvailability` on a
 *    one-of-one garment is load-bearing: a sold garment marked `InStock` in
 *    structured data is a Merchant Center violation and, worse, sends shoppers
 *    to a page that cannot sell them anything.
 *
 * 2. **`itemCondition` is the interesting field.** Every listing here is used.
 *    Schema.org has exactly one term for that (`UsedCondition`), which is less
 *    granular than our five-level scale — so the scale goes in `description`
 *    where it can be read, and the schema term stays honest rather than being
 *    stretched.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaapsi.example'

/**
 * Whether search engines may index this deployment. **Opt-in.**
 *
 * Blocked unless `NEXT_PUBLIC_INDEXABLE` is exactly `1`, so every preview and
 * every branch deployment is closed by default and only a deliberate production
 * setting opens it. Defaulting the other way would mean one forgotten
 * environment variable is the difference between a private client link and a
 * crawlable one — and this build carries real brand names, placeholder
 * photography and unverified figures.
 */
export const IS_INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === '1'

export function absoluteUrl(path: string): string {
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

/** Schema.org availability from our single-unit states. */
function availabilityTerm(product: Product): string {
  switch (product.availability) {
    case 'available':
      return 'https://schema.org/InStock'
    case 'reserved':
      // Not `InStock`: it may not become available again. Not `SoldOut` either,
      // because it may.
      return 'https://schema.org/LimitedAvailability'
    case 'sold':
      return 'https://schema.org/SoldOut'
  }
}

/**
 * `Product` JSON-LD for a PDP, including condition and price.
 *
 * Emitted as a plain object for the page to serialise. Kept out of the component
 * so it can be unit-tested — structured data is exactly the kind of thing that
 * silently rots, because nothing on screen changes when it breaks.
 */
export function productJsonLd({
  product,
  passport,
  seller,
}: {
  product: Product
  passport: Passport | null
  seller: Seller | null
}): Record<string, unknown> {
  // Null for new stock. Schema.org has a value for that, so this maps rather
  // than omits — see `itemCondition` below.
  const condition = product.condition === null ? null : conditionCopy[product.condition]
  const images = product.images.map((image) => image.url)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.title}`,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    description:
      condition === null
        ? `${product.brand} ${product.subcategory} in ${product.color.name}.`
        : `${condition.label} — ${condition.definition} ${product.conditionNotes ?? ''}`.trim(),
    image: images,
    url: absoluteUrl(`/product/${product.slug}`),
    // Schema.org distinguishes these, and getting it wrong is a rich-result
    // penalty as well as a false claim: new stock marked used loses the price
    // and availability treatment, and used stock marked new is a lie.
    itemCondition:
      product.listingType === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    color: product.color.name,
    size: product.size.label,
    ...(passport !== null
      ? {
          // The passport is the genuinely novel thing about these listings, so it
          // is surfaced as an additional property rather than left invisible.
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Previous owners',
              value: String(passport.ownersCount),
            },
            {
              '@type': 'PropertyValue',
              name: 'Product passport',
              value: absoluteUrl(`/passport/${passport.id}`),
            },
          ],
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: product.currency,
      // Schema wants a decimal string in major units. Paise → rupees, once,
      // here.
      price: (product.priceInr / 100).toFixed(2),
      availability: availabilityTerm(product),
      itemCondition: 'https://schema.org/UsedCondition',
      // One of one. Stated explicitly so nothing infers otherwise.
      inventoryLevel: { '@type': 'QuantitativeValue', value: 1 },
      ...(seller !== null
        ? {
            seller: {
              '@type': seller.isVaapsi ? 'Organization' : 'Person',
              name: seller.displayName,
            },
          }
        : {}),
    },
  }
}

/** Open Graph and Twitter metadata for a product. */
export function productMetadata(product: Product): Metadata {
  const primary = product.images.find((image) => image.kind === 'primary') ?? product.images[0]
  const title = `${product.title} — ${product.brand}`
  // New stock has no grade and no inspector's note, so it describes itself by
  // what it is instead of by its wear.
  const description =
    product.condition === null
      ? `${product.subcategory} in ${product.color.name}. New.`
      : `${conditionCopy[product.condition].label}. ${product.conditionNotes ?? ''}`.trim()

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/product/${product.slug}`) },
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(`/product/${product.slug}`),
      ...(primary !== undefined
        ? { images: [{ url: primary.url, alt: primary.alt, width: 1200, height: 1600 }] }
        : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
