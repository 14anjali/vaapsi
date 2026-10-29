import { Stat, StatGroup, attributionFrom } from '../data/stat'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import type { Passport } from '@/lib/types'

/**
 * What buying this instead of a new one saves.
 *
 * Pulled out of the passport story so it can be its own tab in the product
 * drawer — it answers a different question from the journey, and a shopper who
 * wants the number should not have to read a timeline to reach it.
 *
 * `basis` is required by the contract and it stays required here. The study and
 * year sit on the face of it; the full methodology is one click away. A number
 * without a stated source is marketing, and one shopper catching one
 * unsupported figure costs more than every figure earns.
 */
export function PassportImpact({ passport }: { passport: Passport }) {
  if (passport.impact === undefined) {
    // No defensible basis, so no number at all. Saying why is better than an
    // empty panel, which reads as something failing to load.
    return (
      <Type size="sm" tone="muted" measure="default">
        We have not recorded an environmental figure for this piece. There is no defensible basis
        for one — its origin is not confirmed — and a number we cannot stand behind is worse than no
        number.
      </Type>
    )
  }

  const attribution = attributionFrom(passport.impact.basis)

  return (
    <Stack gap={5}>
      <StatGroup
        basis={passport.impact.basis}
        {...(attribution !== undefined ? { attribution } : {})}
      >
        <Stat
          value={passport.impact.waterLitresSaved.toLocaleString('en-IN')}
          unit="litres of water"
        />
        <Stat value={String(passport.impact.co2KgSaved)} unit="kg of CO₂e" />
      </StatGroup>

      <Type size="xs" tone="subtle" measure="default" className="border-t border-line pt-4">
        Compared against manufacturing one new equivalent piece. Buying this one means that
        manufacture does not happen.
      </Type>
    </Stack>
  )
}
