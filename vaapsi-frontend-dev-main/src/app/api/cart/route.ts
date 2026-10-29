import { NextResponse } from 'next/server'
import { resolveCart } from '@/lib/data'
import type { CartItemRef } from '@/lib/data'

/**
 * Resolve a client-held membership list into a priced, availability-checked cart.
 *
 * The client stores only IDs, so the pricing and the availability check have to
 * happen somewhere the client cannot influence. That is this route.
 *
 * It reads through the same adapter as every page, so it is not a second source
 * of truth. When the real backend has its own cart endpoint, this file is the
 * only thing to delete.
 *
 * The chosen colourway and size travel with each entry. They are the one part of
 * a cart line that cannot be re-derived server-side — a style with four colours
 * has no "the" colour — so they must survive this boundary. Everything else
 * (price, availability, title) is deliberately resolved fresh and never trusted
 * from the client.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const items = parseItems(body)
  if (items === null) {
    return NextResponse.json(
      { error: 'Expected { items: [{ productId, addedAt }] }' },
      { status: 400 },
    )
  }

  const cart = await resolveCart(items)

  return NextResponse.json(cart, {
    // A bag is per-shopper and changes constantly. Never cached, anywhere.
    headers: { 'Cache-Control': 'no-store' },
  })
}

/**
 * Validate defensively. The payload comes from localStorage, which a shopper can
 * edit and which will contain whatever an older version of this app wrote there.
 * A malformed entry is dropped rather than allowed to reach the adapter.
 */
function parseItems(body: unknown): readonly CartItemRef[] | null {
  if (body === null || typeof body !== 'object') return null
  const raw = (body as { items?: unknown }).items
  if (!Array.isArray(raw)) return null

  const items: CartItemRef[] = []
  for (const entry of raw) {
    if (entry === null || typeof entry !== 'object') continue
    const { productId, addedAt, colorSlug, sizeNormalized } = entry as {
      productId?: unknown
      addedAt?: unknown
      colorSlug?: unknown
      sizeNormalized?: unknown
    }
    if (typeof productId !== 'string' || productId === '') continue
    items.push({
      productId,
      addedAt: typeof addedAt === 'string' ? addedAt : new Date(0).toISOString(),
      // The chosen colourway and size. Dropping these silently resolved every
      // variant line back to "no selection", so a shopper who picked ecru saw
      // an unnamed line in their bag. Validated the same way as the id: a
      // non-string is treated as absent rather than passed through, because
      // this payload comes from localStorage and can contain anything.
      colorSlug: typeof colorSlug === 'string' && colorSlug !== '' ? colorSlug : null,
      sizeNormalized:
        typeof sizeNormalized === 'string' && sizeNormalized !== '' ? sizeNormalized : null,
    })
  }

  // A cap, so a tampered localStorage cannot ask us to resolve ten thousand ids.
  return items.slice(0, 100)
}
