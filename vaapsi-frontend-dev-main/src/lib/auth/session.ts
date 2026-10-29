import { cookies } from 'next/headers'
import { ACCESS_COOKIE, REFRESH_COOKIE } from './config'
import { ApiNotConfiguredError, authApi, type AuthUser } from './backend'

/**
 * Reading and writing the session.
 *
 * ## The split, and why it exists
 *
 * Server Components can *read* cookies but not write them — that is a Next
 * constraint, not a preference. So the two halves of a session live in
 * different places:
 *
 * - **Reading** (`getSession`) happens anywhere: layouts, pages, route handlers.
 * - **Writing** (`writeSession`, `clearSession`) happens only where a response
 *   is being constructed: the route handlers in `app/api/auth/*`, and the
 *   middleware.
 *
 * Refreshing is therefore the middleware's job, not a page's. The middleware
 * runs before the page, holds the response, and can set the rotated cookies on
 * it. A page that tried to refresh would get a new token it had no way to
 * persist, and would refresh again on the very next request — burning a
 * rotation each time.
 */

export type Session = {
  user: AuthUser
}

/**
 * The signed-in customer, or null.
 *
 * Trusts the API rather than decoding the JWT locally: the token is verified by
 * the service that issued it, which also means a suspended account stops
 * working immediately instead of at the end of its token's life.
 *
 * Never throws for an unauthenticated or unreachable state — callers render a
 * signed-out view, and an API that is down must not take the storefront with
 * it. A missing `API_BASE_URL` is also treated as signed-out, which is what
 * keeps the app running on fixtures as `.env.example` describes.
 */
export async function getSession(): Promise<Session | null> {
  const accessToken = cookies().get(ACCESS_COOKIE)?.value
  if (accessToken === undefined || accessToken === '') return null

  try {
    const result = await authApi.me(accessToken)
    if (!result.ok) return null
    // `me` returns the user with wallet and prefs attached; the session only
    // needs the user, and narrowing here keeps the extra payload out of props.
    const { wallet: _wallet, notifPrefs: _prefs, ...user } = result.data
    return { user }
  } catch (error) {
    if (error instanceof ApiNotConfiguredError) return null
    throw error
  }
}

/** True when a refresh token is present — the cheap check the middleware uses. */
export function hasRefreshCookie(): boolean {
  const value = cookies().get(REFRESH_COOKIE)?.value
  return value !== undefined && value !== ''
}

export function readRefreshToken(): string | null {
  const value = cookies().get(REFRESH_COOKIE)?.value
  return value === undefined || value === '' ? null : value
}

/**
 * Re-exported so route handlers have one import for the session.
 *
 * The implementations live in `./cookies` because they must not pull in
 * `next/headers`, which the middleware runtime does not provide.
 */
export { clearSession, writeSession } from './cookies'
