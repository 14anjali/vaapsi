/**
 * Session configuration.
 *
 * ## Why the tokens live in httpOnly cookies
 *
 * The API returns a short-lived access token and a 30-day refresh token in its
 * JSON body. Those are **never handed to browser JavaScript**: one reflected
 * script on any page of a storefront this size would otherwise walk off with a
 * month-long credential. So the route handlers in `app/api/auth/*` keep the
 * tokens and put them in httpOnly cookies, and the browser holds nothing it can
 * read.
 *
 * This is also why auth is not in Zustand. The two existing stores persist
 * product IDs and timestamps to localStorage, which is fine for a bag and would
 * be a liability for a credential.
 *
 * ## Why the access cookie expires before its token does
 *
 * The cookie's lifetime mirrors the token's, one minute short. That makes
 * "access cookie present" a reliable proxy for "access token still valid", so
 * the middleware can tell a request that needs refreshing from one that does
 * not without decoding a JWT at the edge — and it refreshes just *before*
 * expiry rather than just after, so a page load never lands in the gap.
 */

export const ACCESS_COOKIE = 'vaapsi.at'
export const REFRESH_COOKIE = 'vaapsi.rt'

/** Backend access-token TTL is 15m; refresh at 14m so we are never late. */
const ACCESS_COOKIE_MAX_AGE = 14 * 60
/** Matches REFRESH_TOKEN_TTL_DAYS on the backend. */
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

/**
 * `secure` is off in development because localhost is served over http and a
 * secure cookie would simply never be set — which looks exactly like a broken
 * login. Everywhere else it is on.
 *
 * `sameSite: 'lax'` rather than `'strict'`: strict drops the cookie on a
 * top-level navigation from another site, so arriving at an account page from a
 * link in an order email would show a signed-out shopper their sign-in form.
 * Lax still withholds the cookie from cross-site POSTs, which is the case that
 * matters.
 */
function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  } as const
}

export function accessCookieOptions() {
  return { ...baseCookieOptions(), maxAge: ACCESS_COOKIE_MAX_AGE }
}

export function refreshCookieOptions() {
  return { ...baseCookieOptions(), maxAge: REFRESH_COOKIE_MAX_AGE }
}

/** Expiry in the past, so the browser drops it immediately. */
export function clearedCookieOptions() {
  return { ...baseCookieOptions(), maxAge: 0 }
}

/**
 * Where the API lives.
 *
 * Prefers the server-only `API_BASE_URL`, because the token exchange happens
 * server-side and the base URL does not need to be in the client bundle. Falls
 * back to the existing `NEXT_PUBLIC_API_BASE_URL` from `.env.example` so a
 * deployment that already sets that keeps working.
 */
export function apiBaseUrl(): string | null {
  const raw = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const trimmed = raw.trim().replace(/\/+$/, '')
  return trimmed === '' ? null : trimmed
}

/** The versioned prefix the Express app mounts every route under. */
export const API_PREFIX = '/api/v1'
