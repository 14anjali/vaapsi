'use client'

import { CartLine } from './cart-line'
import { CartSummary } from './cart-summary'
import { EmptyBag } from './cart-drawer'
import { useCart } from './use-cart'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { cart as copy } from '@/content/cart'

/**
 * The full bag.
 *
 * Renders the same `CartLine` and `CartSummary` as the drawer, so the two
 * surfaces cannot say different things about the same bag. The only differences
 * are the layout and the extra secondary action per line — the drawer is for
 * checking, this is for deciding.
 *
 * A client component. The bag lives in localStorage, so there is nothing the
 * server can render for it — and a server-rendered empty bag that flashes to
 * three items on hydration would be worse than a brief hold.
 */
export function CartView() {
  const { cart, isLoading, isError, unavailable, canCheckout } = useCart()
  const lines = cart?.lines ?? []

  return (
    <Container>
      <div className="py-6 desktop:py-8">
        <Row gap={3} align="baseline">
          <Type as="h1" family="display" size="3xl" weight="heading">
            {copy.title}
          </Type>
          {lines.length > 0 && (
            <Type as="span" size="sm" tone="subtle" numeric>
              {copy.count(lines.length)}
            </Type>
          )}
        </Row>
      </div>

      {isLoading ? (
        <div
          className="flex min-h-[40vh] items-center justify-center border-t border-line"
          role="status"
          aria-live="polite"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
          <span className="sr-only">Loading your bag</span>
        </div>
      ) : isError ? (
        <div className="border-t border-line py-section-tight">
          <Stack gap={3} className="max-w-measure-narrow">
            <Type as="p" family="display" size="xl" weight="heading">
              We could not check your bag
            </Type>
            <Type size="sm" tone="muted">
              Prices and availability are checked fresh every time, and that check did not come
              back. Reloading usually fixes it.
            </Type>
          </Stack>
        </div>
      ) : lines.length === 0 ? (
        <div className="border-t border-line">
          <EmptyBag />
        </div>
      ) : (
        <Grid gap="loose" className="border-t border-line pt-6">
          <Col mobile={4} tablet={8} desktop={7}>
            <ul>
              {lines.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </ul>
          </Col>

          <Col mobile={4} tablet={8} desktop={4} startDesktop={9}>
            <div className="desktop:sticky desktop:top-24">
              {cart !== null && (
                <CartSummary cart={cart} unavailable={unavailable} canCheckout={canCheckout} />
              )}
            </div>
          </Col>
        </Grid>
      )}

      <div className="pb-section" />
    </Container>
  )
}
