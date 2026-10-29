import type { Metadata, Viewport } from 'next'
import { SiteFooter } from '@/components/patterns/site-footer'
import { SiteHeader } from '@/components/patterns/site-header'
import { SkipLink } from '@/components/patterns/skip-link'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme'
import { StudioMount } from '@/components/theme/studio/studio-mount'
import { fontVariables } from '@/components/theme/fonts'
import { DEFAULT_THEME } from '@/components/theme/presets'
import { common } from '@/content'
import { IS_INDEXABLE } from '@/lib/seo'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: common.meta.title,
    template: `%s — ${common.meta.title}`,
  },
  description: common.meta.description,
  /*
   * Belt and braces with robots.txt. A crawler that ignores robots.txt still
   * honours a meta tag, and the two disagreeing is a worse outcome than either
   * alone — so both come from the same flag.
   */
  ...(IS_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * The shell. Every route renders inside this and nothing else defines a
   * header or footer.
   *
   * `data-theme` and `data-font` are rendered server-side at their defaults, so
   * the first paint is already correct and there is no flash. ThemeProvider
   * takes over only if a `?t=` link asks for something else.
   *
   * All seven font variables land on <html> via className. The two semantic
   * slots — --font-display and --font-body — are assigned in tokens.css by the
   * `data-font` attribute, never here.
   *
   * Landmarks: one <header>, one <main id="main">, one <footer>. The skip link
   * targets `#main`, and `scroll-mt` on it keeps the sticky header from covering
   * the heading a keyboard user just jumped to.
   */
  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme={DEFAULT_THEME.colorPreset}
      data-font={DEFAULT_THEME.fontPreset}
    >
      <body className="flex min-h-screen flex-col">
        <Providers>
          <ThemeProvider>
            <SkipLink />
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 scroll-mt-20 focus:outline-none">
              {children}
            </main>
            <SiteFooter />
            {/*
            The studio panel. Gated on `?studio=1`, dynamically imported, and
            wrapped in Suspense because `useSearchParams` opts its subtree into
            client rendering — without the boundary that would deopt every
            statically-rendered page in the app.
          */}
            <Suspense fallback={null}>
              <StudioMount />
            </Suspense>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
