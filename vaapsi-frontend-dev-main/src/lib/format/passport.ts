import type { ChainEvent, ChainEventType, Passport } from '@/lib/types'
import { formatMonthYear } from './date'

/**
 * Presentation helpers for the passport.
 *
 * Pure reads over the `chain` array. They exist because "where was this made"
 * and "when did it come back" are questions the interface asks constantly, and
 * answering them inline in a component means every surface answers them
 * slightly differently.
 */

/** The first event of a type, or null. The chain is ordered oldest first. */
export function firstEvent(passport: Passport, type: ChainEventType): ChainEvent | null {
  return passport.chain.find((event) => event.type === type) ?? null
}

/** The most recent event of a type, or null. */
export function lastEvent(passport: Passport, type: ChainEventType): ChainEvent | null {
  return [...passport.chain].reverse().find((event) => event.type === type) ?? null
}

/** How many times this garment has come back to Vaapsi. */
export function returnCount(passport: Passport): number {
  return passport.chain.filter((event) => event.type === 'returned').length
}

/** How many documented repairs. Worth surfacing — a mend is a feature here. */
export function repairCount(passport: Passport): number {
  return passport.chain.filter((event) => event.type === 'repaired').length
}

/**
 * The facts the hero and the card need, resolved once.
 *
 * Every field is nullable, because a real passport is frequently incomplete —
 * the Levi's fixture has no legible place of origin and the Nicobar one has no
 * manufacture date. A helper that pretends otherwise pushes the null-handling
 * out into six components.
 */
export type PassportHighlights = {
  madePlace: string | null
  madeWhen: string | null
  ownersCount: number
  cameBackWhen: string | null
  repairs: number
  isVerified: boolean
}

export function passportHighlights(passport: Passport): PassportHighlights {
  const made = firstEvent(passport, 'made')
  const returned = lastEvent(passport, 'returned')
  const origin = passport.placeOfOrigin.value

  return {
    // A place of origin recorded as unknown is not a place. Treat it as absent
    // rather than printing "Unknown — label removed before intake" in a hero.
    madePlace: /unknown|not recorded/i.test(origin) ? null : origin,
    madeWhen: made === null ? null : formatMonthYear(made.date),
    ownersCount: passport.ownersCount,
    cameBackWhen: returned === null ? null : formatMonthYear(returned.date),
    repairs: repairCount(passport),
    isVerified: passport.authentication.method !== 'none',
  }
}
