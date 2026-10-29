import type { NextResponse } from 'next/server'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  clearedCookieOptions,
  refreshCookieOptions,
} from './config'
import type { AuthTokens } from './backend'

/**
 * Cookie writes, kept apart from `session.ts` on purpose.
 *
 * `session.ts` imports `next/headers`, which does not exist in the middleware
 * runtime. The middleware needs to write rotated cookies, so the write helpers
 * live here where they depend on nothing but the response object — and both
 * route handlers and middleware can use the same two functions.
 */

export function writeSession(response: NextResponse, tokens: AuthTokens): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions())
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions())
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, '', clearedCookieOptions())
  response.cookies.set(REFRESH_COOKIE, '', clearedCookieOptions())
}
