import type { MetadataRoute } from 'next'
import { getPassport, listProducts } from '@/lib/data'
import { SITE_URL, absoluteUrl } from '@/lib/seo'

/**
 * Sitemap.
 *
 * The passport routes are in it deliberately. They are the genuinely novel
 * content on this site — nobody else publishes a per-garment provenance record —
 * and they are the pages most likely to earn a link. Leaving them out because
 * "they are a detail page" would be leaving out the reason the site is
 * interesting.
 *
 * Sold garments stay in the sitemap too. Their passports remain valid and remain
 * the destination of a QR code printed on a physical object, so those URLs have
 * to keep resolving and keep being findable long after the sale.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = await listProducts({ limit: 1000 })

  const passportEntries = (
    await Promise.all(
      page.items
        .filter((item) => item.passportId !== null)
        .map((item) => getPassport(item.passportId as string)),
    )
  )
    .filter((passport): passport is NonNullable<typeof passport> => passport !== null)
    .map((passport) => ({
      url: absoluteUrl(`/passport/${passport.id}`),
      lastModified: new Date(passport.lastUpdated),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/shop'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/pre-loved'), changeFrequency: 'monthly', priority: 0.7 },
    ...page.items.map((item) => ({
      url: absoluteUrl(`/product/${item.slug}`),
      changeFrequency: 'weekly' as const,
      // Available stock ranks above sold, but sold pages stay indexed — the
      // passport on them is still worth reading.
      priority: item.availability === 'sold' ? 0.4 : 0.8,
    })),
    ...passportEntries,
  ]
}
