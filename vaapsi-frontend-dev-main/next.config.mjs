/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Placeholder photography only. `picsum.photos` is here so the fixtures
     * render at real dimensions during design review.
     *
     * REMOVE THIS before launch and replace with the real image host. A
     * production storefront should not be able to load images from an arbitrary
     * third party — see PRD open question #10 on who supplies photography.
     */
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * Indexing is opt-in, and it is driven by one flag in three places:
   * robots.txt, the document meta tag, and this header.
   *
   * The header lives here rather than in `vercel.json` on purpose. A hardcoded
   * `X-Robots-Tag: noindex` in the platform config is a landmine — it is
   * invisible from the application, it survives every code change, and somebody
   * has to remember to delete it on launch day. Reading the same environment
   * variable the other two read means there is exactly one thing to set.
   */
  async headers() {
    if (process.env.NEXT_PUBLIC_INDEXABLE === '1') return []
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
