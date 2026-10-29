'use client'

import { SellFlow, SellSubject } from '@/components/patterns/account/sell-flow'
import { Stack } from '@/components/primitives/layout'
import type { OrderLine, ResaleAssessment, ResaleShot } from '@/lib/types'

/**
 * The client boundary for the resale flow.
 *
 * The assessment and the submission run through route handlers rather than in
 * the browser, for the same reason cart pricing does: what a garment is worth
 * and whether it is genuinely ours are not decisions a client should make, and
 * when a real assessment service exists it will need a server to hold its
 * credentials. Keeping the calls behind `/api` now means that swap changes one
 * file.
 */
export function SellClient({ line, shots }: { line: OrderLine; shots: readonly ResaleShot[] }) {
  return (
    <Stack gap={6}>
      <SellSubject line={line} />

      <SellFlow
        line={line}
        shots={shots}
        onAssess={async (input) => {
          const response = await fetch('/api/resale/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderLineId: line.id, ...input }),
          })
          if (!response.ok) throw new Error('Could not read the photographs')
          return (await response.json()) as ResaleAssessment
        }}
        onSubmit={async (input) => {
          const response = await fetch('/api/resale/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderLineId: line.id, ...input }),
          })
          if (!response.ok) throw new Error('Could not send it in')
          const request = (await response.json()) as { id: string }
          return request.id
        }}
      />
    </Stack>
  )
}
