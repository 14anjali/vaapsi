'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Client providers.
 *
 * TanStack Query is used narrowly and on purpose. Everything that can be
 * server-rendered is — the product grid, the filters, the passport — because
 * this is a storefront and the first paint matters. Query is here for the small
 * number of things that genuinely need to be live in the browser: the pending
 * filter count in the mobile sheet, and later the cart.
 *
 * The client is created inside state rather than at module scope, so it is not
 * shared between requests on the server.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // A one-of-one marketplace changes underneath you. Short staleness,
            // and no refetch on focus — a shopper tabbing back should not see
            // the grid flicker.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
