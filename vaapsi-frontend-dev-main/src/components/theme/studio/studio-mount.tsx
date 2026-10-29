'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

/**
 * Gate and lazy-load the studio panel.
 *
 * Two things happen here, and both matter:
 *
 * 1. **The panel mounts only when `?studio=1` is present.** That makes the
 *    client's version a shareable link with no auth, no build flag and no
 *    environment variable to forget.
 *
 * 2. **It is a dynamic import, so it is not in the default bundle.** Without
 *    that, every shopper on every page would download a design tool they can
 *    never see. `ssr: false` because the panel reads computed styles off
 *    `<html>`, which does not exist on the server.
 *
 * The result is that without `?studio=1` there is no trace of it — not in the
 * DOM, and not in the network tab.
 */
const StudioPanel = dynamic(
  () => import('./studio-panel').then((mod) => ({ default: mod.StudioPanel })),
  { ssr: false },
)

export const STUDIO_QUERY_PARAM = 'studio'

export function StudioMount() {
  const searchParams = useSearchParams()
  if (searchParams.get(STUDIO_QUERY_PARAM) !== '1') return null
  return <StudioPanel />
}
