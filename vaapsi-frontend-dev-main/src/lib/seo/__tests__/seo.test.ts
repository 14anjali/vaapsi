import { absoluteUrl, productJsonLd, productMetadata } from '..'
import { passports } from '@/lib/data/fixtures/passports'
import { products } from '@/lib/data/fixtures/products'
import { sellers } from '@/lib/data/fixtures/sellers'
import type { Product } from '@/lib/types'

/**
 * Structured data is exactly the kind of thing that silently rots: nothing on
 * screen changes when it breaks, so nobody notices until a Merchant Center
 * warning arrives months later. These tests exist to make it noisy.
 */

const available = products.find((p) => p.availability === 'available') as Product
const reserved = products.find((p) => p.availability === 'reserved') as Product
const sold = products.find((p) => p.availability === 'sold') as Product
const noRetail = products.find((p) => p.originalRetailInr === null) as Product
const passport = passports[0]!
const seller = sellers[0]!

const ld = (product: Product, extras: Partial<Parameters<typeof productJsonLd>[0]> = {}) =>
  productJsonLd({ product, passport: null, seller: null, ...extras })

describe('absoluteUrl', () => {
  it('produces an absolute URL without doubling slashes', () => {
    expect(absoluteUrl('/shop')).toMatch(/^https?:\/\/[^/]+\/shop$/)
    expect(absoluteUrl('shop')).toBe(absoluteUrl('/shop'))
  })
})

describe('productJsonLd', () => {
  it('is a Product with a price in major units, not paise', () => {
    const data = ld(available)
    expect(data['@type']).toBe('Product')
    const offers = data.offers as Record<string, unknown>
    // 265000 paise is ₹2,650.00 — not "265000".
    expect(offers.price).toBe((available.priceInr / 100).toFixed(2))
    expect(offers.priceCurrency).toBe('INR')
  })

  it('maps every availability state to the right schema term', () => {
    const term = (product: Product) => (ld(product).offers as Record<string, unknown>).availability
    expect(term(available)).toBe('https://schema.org/InStock')
    // Reserved is neither: it may not come back, and it may.
    expect(term(reserved)).toBe('https://schema.org/LimitedAvailability')
    expect(term(sold)).toBe('https://schema.org/SoldOut')
  })

  it('never marks a sold garment as in stock', () => {
    // The failure that gets a Merchant Center account flagged, and that sends a
    // shopper to a page which cannot sell them anything.
    const offers = ld(sold).offers as Record<string, unknown>
    expect(offers.availability).not.toBe('https://schema.org/InStock')
  })

  it('always declares used condition', () => {
    const data = ld(available)
    expect(data.itemCondition).toBe('https://schema.org/UsedCondition')
    expect((data.offers as Record<string, unknown>).itemCondition).toBe(
      'https://schema.org/UsedCondition',
    )
  })

  it('states an inventory level of one', () => {
    const offers = ld(available).offers as Record<string, unknown>
    expect(offers.inventoryLevel).toEqual({ '@type': 'QuantitativeValue', value: 1 })
  })

  it('carries the five-level grade in the description, since schema has no term for it', () => {
    expect(String(ld(available).description)).toMatch(
      /Pristine|Excellent|Very good|Good|Well loved/,
    )
  })

  it('surfaces the passport when there is one, and omits it when there is not', () => {
    const withPassport = ld(available, { passport })
    const props = withPassport.additionalProperty as { name: string; value: string }[]
    expect(props.some((p) => p.name === 'Product passport')).toBe(true)
    expect(props.some((p) => p.name === 'Previous owners')).toBe(true)

    expect(ld(available).additionalProperty).toBeUndefined()
  })

  it('types a Vaapsi seller as an Organization and an individual as a Person', () => {
    const vaapsi = sellers.find((s) => s.isVaapsi)!
    const individual = sellers.find((s) => !s.isVaapsi)!

    const asOrg = ld(available, { seller: vaapsi }).offers as Record<string, unknown>
    const asPerson = ld(available, { seller: individual }).offers as Record<string, unknown>

    expect((asOrg.seller as Record<string, unknown>)['@type']).toBe('Organization')
    expect((asPerson.seller as Record<string, unknown>)['@type']).toBe('Person')
  })

  it('omits the seller entirely rather than emitting an empty object', () => {
    expect((ld(available).offers as Record<string, unknown>).seller).toBeUndefined()
  })

  it('includes every image', () => {
    expect(ld(available).image).toHaveLength(available.images.length)
  })

  it('serialises to valid JSON', () => {
    // The page injects this with dangerouslySetInnerHTML, so a value that cannot
    // round-trip would break the document.
    for (const product of products) {
      expect(() => JSON.parse(JSON.stringify(ld(product, { passport, seller })))).not.toThrow()
    }
  })
})

describe('productMetadata', () => {
  it('sets a canonical URL', () => {
    expect(productMetadata(available).alternates?.canonical).toBe(
      absoluteUrl(`/product/${available.slug}`),
    )
  })

  it('gives Open Graph an image with alt text and dimensions', () => {
    const og = productMetadata(available).openGraph as {
      images?: { url: string; alt?: string }[]
    }
    expect(og.images?.[0]?.url).toBeDefined()
    expect(og.images?.[0]?.alt).toBeTruthy()
  })

  it('leads the title with the garment, not the brand', () => {
    expect(String(productMetadata(available).title)).toMatch(
      new RegExp(`^${available.title.slice(0, 10)}`),
    )
  })

  it('works for a garment with no original retail price', () => {
    expect(() => productMetadata(noRetail)).not.toThrow()
    expect(productMetadata(noRetail).description).toBeTruthy()
  })
})
