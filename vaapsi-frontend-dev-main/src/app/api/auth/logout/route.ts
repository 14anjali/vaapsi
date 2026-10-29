import { NextResponse } from 'next/server'
import { ApiNotConfiguredError, authApi } from '@/lib/auth/backend'
import { clearSession, readRefreshToken } from '@/lib/auth/session'

/**
 * Sign out.
 *
 * Two things have to happen, and the order matters: revoke the refresh token on
 * the server, then drop the cookies. Only clearing the cookies would leave a
 * 30-day credential valid for anyone who had already copied it.
 *
 * **The cookies are cleared even if the revocation call fails.** A shopper who
 * clicks sign out on a train with no signal must still end up signed out
 * locally; leaving them logged in because the network was down is the worse
 * failure. The unrevoked token then expires on its own.
 */
export async function POST() {
  const refreshToken = readRefreshToken()

  if (refreshToken !== null) {
    try {
      await authApi.logout(refreshToken)
    } catch (error) {
      if (!(error instanceof ApiNotConfiguredError)) throw error
    }
  }

  const response = NextResponse.json(
    { signedOut: true },
    { headers: { 'Cache-Control': 'no-store' } },
  )
  clearSession(response)
  return response
}
