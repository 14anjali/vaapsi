import type { IsoDateTime, SellerId, Url } from './common'

/**
 * A seller is a user in listing mode, not a separate account type (PRD §3).
 *
 * `Seller` is the **public** projection — what a shopper sees on a listing. It
 * carries no email, no phone, no address. Those live on the account model, which
 * is IPguide's and is not part of this contract.
 */
export type Seller = {
  id: SellerId
  /** Public handle. Unique, URL-safe. */
  handle: string
  /** Chosen display name. May be a first name, a shop name, or a pseudonym. */
  displayName: string
  /** Coarse location only — city and state. Never a precise address. */
  location: { city: string; state: string } | null
  avatarUrl: Url | null
  /** Vaapsi has confirmed identity. Drives the seller-level verification mark. */
  isVerified: boolean
  memberSince: IsoDateTime
  listingsCount: number
  /**
   * Vaapsi itself, holding first-party or consigned inventory, rather than a
   * C2C individual. Changes who the merchant of record is, so the UI must be
   * able to distinguish it. (PRD open question #6.)
   */
  isVaapsi: boolean
}
