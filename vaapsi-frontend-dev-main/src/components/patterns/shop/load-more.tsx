'use client'

import { usePlpUrl } from './use-plp-url'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'

/**
 * Load more. A button, appending to a `page` param in the URL.
 *
 * **Not infinite scroll.** Two reasons, both concrete: infinite scroll makes the
 * footer unreachable, and it breaks back-navigation — a shopper scrolls through
 * ninety garments, opens one, comes back, and is returned to the top with
 * everything to do again. On a one-of-one marketplace where the whole point is
 * that browsing is the product, that is the worst possible failure.
 *
 * Because the page number is in the URL, "back" after loading more shows fewer
 * again, and a shared link reproduces exactly what the sender was looking at.
 */
export function LoadMore({ shown, total }: { shown: number; total: number }) {
  const { loadMore } = usePlpUrl()
  const remaining = total - shown

  if (remaining <= 0) {
    return (
      <Stack gap={2} align="center" className="py-section-tight">
        <Type size="sm" tone="subtle">
          {shop.loadMore.exhausted}
        </Type>
      </Stack>
    )
  }

  return (
    <Stack gap={3} align="center" className="py-section-tight">
      <button
        type="button"
        onClick={loadMore}
        className="ease border border-line-strong px-8 py-3 text-sm transition-colors duration-fast hover:border-ink"
      >
        {shop.loadMore.label}
      </button>
      <Type size="xs" tone="subtle" numeric>
        {shop.loadMore.remaining(remaining)}
      </Type>
    </Stack>
  )
}
