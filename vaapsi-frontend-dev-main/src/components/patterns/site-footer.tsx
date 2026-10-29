import Link from 'next/link'
import { Logo } from './logo'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { footerMeta, footerNav, navLabels } from '@/content/navigation'
import { passportCopy } from '@/content/passport'

/**
 * Quiet and dense.
 *
 * Typographic throughout: no social icon soup, no newsletter box competing with
 * the navigation, no logo wall, and no payment-mark row — those belong at
 * checkout, where they answer a question somebody is actually asking. The tax
 * line lives in the cart summary for the same reason.
 *
 * A server component. Nothing here is interactive beyond links, and the year in
 * the copyright is computed at build time rather than being a client-side
 * `new Date()` that would mismatch on hydration.
 */
export function SiteFooter() {
  const year = new Date().getUTCFullYear()

  return (
    <footer className="mt-section border-t border-line">
      <Container>
        <div className="py-section-tight">
          <Grid rowGap="loose">
            <Col mobile={4} tablet={8} desktop={3}>
              <Link href="/" aria-label={navLabels.home} className="inline-block text-ink">
                <Logo decorative />
              </Link>
              <Type size="sm" tone="muted" measure="narrow" className="mt-4">
                {passportCopy.oneLiner}
              </Type>
            </Col>

            <Col mobile={4} tablet={8} desktop={9} startDesktop={4}>
              {/*
                Flex with `justify-end`, not grid columns. Five groups in a
                twelve-column grid can only occupy ten of them, so the last
                column stopped two columns short of the container edge while the
                legal links in the bar below sat flush against it — two right
                edges, a gutter apart, which reads as a mistake. Flexed to the
                end, the last group finishes exactly where that bar does.
              */}
              <nav aria-label={navLabels.footerNav}>
                <div className="flex flex-wrap gap-x-10 gap-y-10 desktop:justify-end desktop:gap-x-12">
                  {footerNav.map((group) => (
                    <section key={group.heading} className="min-w-[8rem] flex-1 desktop:flex-none">
                      <Eyebrow as="h2">{group.heading}</Eyebrow>
                      <Stack gap={1} as="ul" className="mt-3">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="text-ink-muted transition-colors hover:text-ink"
                            >
                              <Type as="span" size="sm" tone="inherit">
                                {item.label}
                              </Type>
                            </Link>
                          </li>
                        ))}
                      </Stack>
                    </section>
                  ))}
                </div>
              </nav>
            </Col>
          </Grid>
        </div>

        <div className="border-t border-line py-6">
          <Row gap={4} justify="between">
            <Type size="xs" tone="subtle">
              {footerMeta.copyright(year)}
            </Type>
            <Row gap={4} as="ul">
              {(footerNav.find((group) => group.heading === 'Legal')?.items ?? []).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-subtle transition-colors hover:text-ink"
                  >
                    <Type as="span" size="xs" tone="inherit">
                      {item.label}
                    </Type>
                  </Link>
                </li>
              ))}
            </Row>
          </Row>
        </div>
      </Container>
    </footer>
  )
}
