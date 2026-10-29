import { NextResponse } from 'next/server'
import { passwordCopy } from '@/content/auth-password'
import { ApiNotConfiguredError } from '@/lib/auth/backend'
import { passwordApi } from '@/lib/auth/password-api'
import { resetPasswordSchema } from '@/lib/auth/password-schema'
import { clearSession } from '@/lib/auth/cookies'

/**
 * Set a new password using the emailed code.
 *
 * ## No session is issued
 *
 * A successful reset does not sign anyone in. The API has just revoked every
 * refresh token on the account — that is the point of a reset — so handing back
 * a fresh session here would immediately undo the one guarantee the flow makes.
 * The customer signs in with the new password, which also confirms to them that
 * it works.
 *
 * ## It clears cookies instead
 *
 * Whoever completed this reset may be sitting on a session that is now revoked
 * server-side. Clearing locally means the next request looks signed out rather
 * than bouncing through a refresh that is guaranteed to fail.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { email, code, password } = parsed.data

  let result
  try {
    result = await passwordApi.reset({ email, code, password })
  } catch (error) {
    if (error instanceof ApiNotConfiguredError) {
      return NextResponse.json({ error: passwordCopy.unexpected }, { status: 503 })
    }
    throw error
  }

  if (!result.ok) {
    if (result.status === 0) {
      return NextResponse.json({ error: passwordCopy.offline }, { status: 503 })
    }
    if (result.status === 429) {
      return NextResponse.json({ error: passwordCopy.reset.rateLimited }, { status: 429 })
    }
    if (result.status === 400) {
      // The API returns one message for a wrong, expired, used or never-issued
      // code. If it flagged a specific field (a password that fails the
      // strength rules), that is passed through; otherwise the vague code
      // message stands, and it is attached to `code` so it lands on the field.
      const fieldErrors = result.details
      if (fieldErrors !== undefined && Object.keys(fieldErrors).length > 0) {
        return NextResponse.json({ error: result.message, fieldErrors }, { status: 400 })
      }
      return NextResponse.json(
        {
          error: passwordCopy.reset.invalidCode,
          fieldErrors: { code: [passwordCopy.reset.invalidCode] },
        },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: passwordCopy.unexpected }, { status: 502 })
  }

  const response = NextResponse.json({ reset: true }, { headers: { 'Cache-Control': 'no-store' } })
  clearSession(response)
  return response
}
