/**
 * Shared scalars and the provenance mechanism.
 *
 * Contract note for the backend: the branded ID aliases below are plain strings
 * at runtime. They exist so a `PassportId` cannot be passed where a `ProductId`
 * is expected. Map them to whatever your Prisma `@id` is — cuid, uuid, bigint
 * as string. Nothing in the front end parses them.
 */

/** ISO-8601 instant, always UTC, e.g. `2026-03-14T09:12:00.000Z`. */
export type IsoDateTime = string

/** ISO-8601 calendar date with no time component, e.g. `2026-03-14`. */
export type IsoDate = string

/** Absolute or root-relative URL. Not validated at the type level. */
export type Url = string

export type ProductId = string
export type PassportId = string
export type SellerId = string
export type ImageId = string
export type CartId = string
export type CartLineId = string

/**
 * Where a piece of information came from. This is the honesty mechanism.
 *
 * - `verified`      Vaapsi or a named third party physically checked it.
 * - `supplier`      Supplied by the brand or manufacturer, in their records.
 * - `self_declared` Stated by the seller. Unchecked.
 * - `ai_extracted`  Read by a model off a label, invoice or photo.
 * - `ai_suggested`  Inferred by a model. Not read off anything.
 *
 * Ordered loosely most to least trustworthy; do not rely on the order in code,
 * use `provenanceRank` in `lib/format` if you need to sort.
 */
export const PROVENANCES = [
  'verified',
  'supplier',
  'self_declared',
  'ai_extracted',
  'ai_suggested',
] as const

export type Provenance = (typeof PROVENANCES)[number]

/**
 * A value carried together with where it came from.
 *
 * Every passport field that the UI shows with a source badge is `Sourced<T>`
 * rather than a bare value, and it is deliberately **not** optional. If
 * provenance were optional it would get dropped somewhere in the pipeline, and
 * then the storefront would be making claims about a garment's history that
 * nobody can stand behind.
 *
 * `verifiedAt` is present only when `provenance` is `verified`.
 */
export type Sourced<T> = {
  value: T
  provenance: Provenance
  verifiedAt?: IsoDateTime
}

/** Convenience constructor for fixtures and adapters. */
export function sourced<T>(value: T, provenance: Provenance, verifiedAt?: IsoDateTime): Sourced<T> {
  return verifiedAt === undefined ? { value, provenance } : { value, provenance, verifiedAt }
}

/**
 * Integer paise. Never a float, never rupees.
 *
 * ₹1,299.00 is `129900`. Formatting to a rupee string is `lib/format/currency`
 * and happens at the very edge, in the component that renders it.
 */
export type Paise = number

export type CurrencyCode = 'INR'

/** A cursor-paginated list. Cursor is opaque; do not construct one. */
export type Page<T> = {
  items: readonly T[]
  nextCursor: string | null
  total: number
}
