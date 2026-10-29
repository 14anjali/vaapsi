import type { MetadataRoute } from 'next'
import { IS_INDEXABLE, SITE_URL, absoluteUrl } from '@/lib/seo'

/**
 * robots.txt.
 *
 * **Blocked by default.** Indexing is opt-in via `NEXT_PUBLIC_INDEXABLE=1`, and
 * every preview deployment should leave it off.
 *
 * The default matters more than it looks. This build carries real brand names on
 * fixture garments, placeholder photography that is not ours, environmental
 * figures whose numbers are not yet verified, and provisional delivery and
 * returns copy. None of that should be discoverable under a Vaapsi domain, and a
 * preview link shared with a client is exactly the kind of thing that quietly
 * ends up crawled.
 *
 * When the real thing launches, set the flag. Until then the honest default is
 * "not for the public".
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Personal, transient, or internal reference rather than content.
        disallow: ['/api/', '/cart', '/checkout', '/tokens', '/kitchen-sink'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
