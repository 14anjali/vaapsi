import type { Paise } from '@/lib/types'

/**
 * INR formatting from integer paise, with Indian lakh/crore grouping.
 *
 * Grouped by hand rather than through `Intl.NumberFormat('en-IN')` on purpose:
 * the grouping is the thing most likely to be visibly wrong to an Indian
 * shopper, and hand-rolling it makes the behaviour identical in Node, in the
 * browser, and in a jsdom test regardless of which ICU data is present.
 *
 * ₹1,20,000 — not ₹120,000.
 */

const RUPEE = '₹'

export type FormatInrOptions = {
  /**
   * `'auto'` (default) shows paise only when there are non-zero paise.
   * `'always'` forces two decimals. `'never'` rounds to whole rupees.
   */
  paise?: 'auto' | 'always' | 'never'
  /** Include the ₹ sign. Default true. */
  symbol?: boolean
}

/** Apply Indian digit grouping to a string of digits: last 3, then pairs. */
export function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) return digits
  const head = digits.slice(0, -3)
  const tail = digits.slice(-3)
  const grouped = head.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${grouped},${tail}`
}

export function formatInr(paise: Paise, options: FormatInrOptions = {}): string {
  const { paise: paiseMode = 'auto', symbol = true } = options

  if (!Number.isFinite(paise)) throw new RangeError(`formatInr: not a finite number: ${paise}`)
  if (!Number.isInteger(paise)) {
    throw new RangeError(
      `formatInr: expected integer paise, got ${paise}. Money is never a float — see lib/types/common.`,
    )
  }

  const negative = paise < 0
  const absolute = Math.abs(paise)

  const wholeRupees = Math.trunc(absolute / 100)
  const remainder = absolute % 100

  const showPaise = paiseMode === 'always' || (paiseMode === 'auto' && remainder !== 0)
  const rupees = paiseMode === 'never' ? Math.round(absolute / 100) : wholeRupees

  let out = groupIndianDigits(String(rupees))
  if (showPaise) out += `.${String(remainder).padStart(2, '0')}`
  if (symbol) out = `${RUPEE}${out}`
  if (negative) out = `-${out}`

  return out
}

/** `rupees(1299)` → `129900`. For fixtures and tests, not for runtime maths. */
export function rupees(amount: number): Paise {
  return Math.round(amount * 100)
}

/**
 * Percentage saved against original retail, rounded down.
 * Returns null when there is nothing honest to compare against.
 */
export function discountPercent(priceInr: Paise, originalRetailInr: Paise | null): number | null {
  if (originalRetailInr === null || originalRetailInr <= 0) return null
  if (priceInr >= originalRetailInr) return null
  return Math.floor(((originalRetailInr - priceInr) / originalRetailInr) * 100)
}
