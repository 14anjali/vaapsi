import type { IsoDate, IsoDateTime, PassportId, ProductId, Sourced, Url } from './common'

/**
 * The Digital Product Passport.
 *
 * The first block mirrors the EuFSI structure so a passport issued there maps
 * onto this type field-for-field. The second block is Vaapsi's extension, and
 * it is the reason a passport is worth showing a shopper at all: EuFSI answers
 * "what is this made of and who made it", which is a compliance question. It
 * does not answer "where has this garment been", which is the question a
 * resale buyer is actually asking.
 *
 * Fields typed `Sourced<T>` are the ones EuFSI renders with a source badge.
 * Keep them sourced. See the note on `Sourced`.
 */

// ---------------------------------------------------------------------------
// Mirrored from EuFSI
// ---------------------------------------------------------------------------

export type Material = {
  /** "Organic cotton", "Recycled polyester". As it appears on the composition label. */
  name: Sourced<string>
  /** 0–100. The set should sum to 100; the UI shows the remainder if it does not. */
  percentage: Sourced<number>
  isRecycled: Sourced<boolean>
  /** Where the fibre came from, when known. "Gujarat, India". */
  provenance: Sourced<string | null>
}

/** GINETEX care symbol. `code` is the machine handle, `icon` the asset name. */
export type CareInstruction = {
  code: string
  label: string
  icon: string
}

export type EndOfLife = {
  recyclerLookupUrl: Url | null
  collectionPointUrl: Url | null
}

/**
 * The immutable snapshot taken when the passport was first published.
 *
 * Corrections never overwrite it. This is what makes the passport a record
 * rather than a product description — if the declared fibre content was wrong
 * and got fixed, a shopper can see both that it was wrong and that it was
 * fixed, which is more trustworthy than a clean page.
 */
export type OriginalDeclaration = {
  declaredAt: IsoDateTime
  declaredBy: string
  /** Frozen copy of the passport payload as first published. */
  snapshot: Readonly<Record<string, unknown>>
}

/** Append-only. Never edit or remove an entry. */
export type Correction = {
  id: string
  correctedAt: IsoDateTime
  correctedBy: string
  /** Dot path into the passport, e.g. `materials.0.percentage`. */
  field: string
  previousValue: unknown
  newValue: unknown
  reason: string
}

// ---------------------------------------------------------------------------
// Vaapsi extension
// ---------------------------------------------------------------------------

/**
 * Lifecycle event types, roughly in the order a garment meets them — though a
 * garment can loop through `owned → returned → inspected → repaired → relisted`
 * any number of times, which is the entire point of the business.
 */
export const CHAIN_EVENT_TYPES = [
  'made',
  'first_sold',
  'owned',
  'returned',
  'inspected',
  'repaired',
  // An addition made at the owner's request — a patch, embroidery, initials.
  // Distinct from `repaired`: a repair answers damage, this answers a choice,
  // and a shopper reading the record needs to be able to tell them apart.
  // See `content/customise.ts`.
  'customised',
  'relisted',
] as const

export type ChainEventType = (typeof CHAIN_EVENT_TYPES)[number]

export type ChainEvent = {
  id: string
  type: ChainEventType
  date: IsoDate
  /**
   * Who did it. Never a real customer name — "Second owner, Bengaluru" or
   * "Vaapsi Studio, Delhi". Owners are described, not identified.
   */
  actor: string
  note: string | null
  /** How Vaapsi knows this event happened. */
  verification: Sourced<string>
}

export type AuthenticationMethod =
  'in_house_inspection' | 'brand_partner' | 'third_party_authenticator' | 'none'

export type Authentication = {
  method: AuthenticationMethod
  /** Named party. Null when `method` is `none`. */
  verifiedBy: string | null
  verifiedAt: IsoDateTime | null
}

/**
 * Environmental saving from buying this garment rather than its new equivalent.
 *
 * `basis` is **required**. A number without a stated basis is not a fact, it is
 * marketing, and the whole passport loses its credibility the moment a shopper
 * catches one. If there is no defensible basis, omit `impact` entirely — the UI
 * handles a passport with no impact block.
 */
export type Impact = {
  waterLitresSaved: number
  co2KgSaved: number
  /** Named methodology and vintage, e.g. "Ellen MacArthur Foundation, 2021 — cotton shirt baseline". */
  basis: string
}

// ---------------------------------------------------------------------------
// The passport
// ---------------------------------------------------------------------------

export type Passport = {
  id: PassportId
  productId: ProductId

  /** Resolvable URL form of the unique product identifier. What the QR encodes. */
  uniqueProductId: Url
  /** The issuer's own reference. */
  productNo: string
  dppVersion: string
  signedAt: IsoDateTime
  /** Who signed it. "Vaapsi" for self-issued, a brand name for brand-issued. */
  issuer: string
  /** The registry it is recorded in, and where to resolve it. */
  registry: { name: string; url: Url }
  lastUpdated: IsoDateTime

  placeOfOrigin: Sourced<string>
  manufacturingCountry: Sourced<string>
  manufacturer: Sourced<string>

  materials: readonly Material[]
  careInstructions: readonly CareInstruction[]
  endOfLife: EndOfLife

  originalDeclaration: OriginalDeclaration
  /** Append-only event log. Empty array means never corrected. */
  corrections: readonly Correction[]

  /**
   * True when the passport is published by choice rather than issued under EU
   * regulation. Almost every Vaapsi passport is voluntary, and the UI must be
   * able to say so plainly — claiming regulatory backing you do not have is the
   * fastest way to lose the trust the passport exists to build.
   */
  isVoluntary: boolean

  // Vaapsi extension
  /** Ordered oldest first. */
  chain: readonly ChainEvent[]
  /** Distinct owners so far, excluding Vaapsi's own custody. */
  ownersCount: number
  authentication: Authentication
  /** Omitted when no defensible basis exists. */
  impact?: Impact
}
