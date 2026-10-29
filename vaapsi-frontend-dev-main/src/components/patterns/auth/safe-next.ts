/**
 * Validate a post-sign-in redirect target.
 *
 * `?next=` is attacker-controllable: it arrives in a URL anyone can send to
 * anyone. Handing it to the router unchecked turns the sign-in page into an
 * open redirect — `/login?next=https://vaapsi-returns.example` lets someone
 * send a link that genuinely starts on our domain, shows our real sign-in form,
 * and then lands the shopper somewhere else entirely. That is the strongest
 * possible phishing setup.
 *
 * So only a same-origin *path* is accepted:
 *
 * - must start with a single `/` — rejects `https://evil.test` and `//evil.test`
 *   (the second being a protocol-relative URL that browsers treat as absolute)
 * - must not contain a backslash — some parsers normalise `/\evil.test` to a
 *   host
 * - must not be an auth page, which would bounce a shopper straight back
 *
 * Anything else falls back to the account hub.
 */

const FALLBACK = '/account'

export function safeNext(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return FALLBACK
  if (!value.startsWith('/')) return FALLBACK
  if (value.startsWith('//')) return FALLBACK
  if (value.includes('\\')) return FALLBACK
  if (value === '/login' || value === '/signup') return FALLBACK
  if (value.startsWith('/login/') || value.startsWith('/signup/')) return FALLBACK
  return value
}
