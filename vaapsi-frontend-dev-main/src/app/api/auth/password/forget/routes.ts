import { NextResponse } from 'next/server'
import { passwordCopy } from '@/content/auth-password'
import { ApiNotConfiguredError } from '@/lib/auth/backend'
import { passwordApi } from '@/lib/auth/password-api'
import { forgotPasswordSchema } from '@/lib/auth/password-schema'

/**
 * Ask for a reset code.
 *
 * **Always 200 when the request is well-formed**, whether or not that email has
 * an account. The API behaves this way and this layer has to preserve it: a
 * route that returned 404 for unregistered addresses would hand back exactly
 * the account-existence oracle the API is refusing to provide.
 *
 * The two non-200s are both about us rather than about the address: 429 from the
 * rate limiter, and a send failure. A send failure is reported honestly instead
 * of being swallowed into the usual "a code is on its way", because telling
 * someone to wait for an email that was never sent leaves them stuck with no
 * idea why.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  let result
  try {
    result = await passwordApi.forgot(parsed.data.email)
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
      return NextResponse.json({ error: passwordCopy.forgot.rateLimited }, { status: 429 })
    }
    if (result.status === 400) {
      return NextResponse.json(
        {
          error: result.message,
          ...(result.details === undefined ? {} : { fieldErrors: result.details }),
        },
        { status: 400 },
      )
    }
    // A 500 here is the relay failing. Say so rather than claiming a send.
    return NextResponse.json({ error: passwordCopy.forgot.sendFailed }, { status: 502 })
  }

  return NextResponse.json({ requested: true }, { headers: { 'Cache-Control': 'no-store' } })
}
