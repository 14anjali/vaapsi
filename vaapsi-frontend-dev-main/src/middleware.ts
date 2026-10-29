import { NextResponse, type NextRequest } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/config'
import { ApiNotConfiguredError, authApi } from '@/lib/auth/backend'
import { clearSession, writeSession } from '@/lib/auth/cookies'

/**
 * Route protection and token refresh.
 *
 * ## Why refresh happens here
 *
 * This is the only place in the request path that can both read the refresh
 * cookie and write a rotated pair onto the response. A Server Component can
 * read cookies but not set them, so a page that refreshed would get a token it
 * could not keep and would refresh again on the next request — and because the
 * API rotates refresh tokens, each of those would burn one.
 *
 * The access cookie is set to expire a minute before its token does, so
 * "access cookie missing, refresh cookie present" is exactly the condition that
 * means *refresh now*. No JWT decoding at the edge.
 *
 * ## What it deliberately does not do
 *
 * It does not call `/auth/me`. Middleware runs on every matched request and an
 * identity lookup there would add a network hop to each one; the cookie's
 * presence is enough to decide *whether to let the request through*, and the
 * page itself resolves *who* via `getSession()`. Authorisation still happens on
 * the API for every call that matters — the middleware is a redirect, not a
 * security boundary.
 */

/** Signed-in-only areas. The account hub and everything under it. */
const PROTECTED = ['/account']
/** Pages that make no sense once signed in. */
const GUEST_ONLY = ['/login', '/signup']

function matches(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected = matches(pathname, PROTECTED)
  const isGuestOnly = matches(pathname, GUEST_ONLY)
  if (!isProtected && !isGuestOnly) return NextResponse.next()

  const hasAccess = (request.cookies.get(ACCESS_COOKIE)?.value ?? '') !== ''
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value ?? ''
  const hasRefresh = refreshToken !== ''

  // Signed in, or at least holding a usable refresh token.
  if (hasAccess || hasRefresh) {
    if (isGuestOnly) {
      return NextResponse.redirect(new URL('/account', request.url))
    }

    // Protected, and the access token has just lapsed. Rotate before the page
    // renders so `getSession()` finds a valid token.
    if (!hasAccess && hasRefresh) {
      let rotated
      try {
        rotated = await authApi.refresh(refreshToken)
      } catch (error) {
        if (error instanceof ApiNotConfiguredError) {
          return redirectToLogin(request, pathname, search)
        }
        throw error
      }

      if (!rotated.ok) {
        // Revoked, expired, or already used. Drop the cookies on the redirect
        // itself, otherwise the next request retries the same dead token.
        const response = redirectToLogin(request, pathname, search)
        clearSession(response)
        return response
      }

      const response = NextResponse.next()
      writeSession(response, rotated.data)
      return response
    }

    return NextResponse.next()
  }

  // Not signed in at all.
  if (isProtected) return redirectToLogin(request, pathname, search)
  return NextResponse.next()
}

/**
 * Send them to sign in, remembering where they were going.
 *
 * `next` is a path only, never a full URL, and it is re-validated on the login
 * page before being used — an open redirect on a sign-in form is how a
 * convincing phishing flow starts.
 */
function redirectToLogin(request: NextRequest, pathname: string, search: string) {
  const url = new URL('/login', request.url)
  url.searchParams.set('next', `${pathname}${search}`)
  return NextResponse.redirect(url)
}

export const config = {
  /*
   * Only the routes that need a decision. Everything else — the catalogue, the
   * passport pages, static assets — skips the middleware entirely, which keeps
   * it off the hot path for the pages that are statically generated.
   */
  matcher: ['/account/:path*', '/login', '/signup'],
}
