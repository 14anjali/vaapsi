import { NextResponse } from 'next/server'
import { authCopy } from '@/content/auth'
import { ApiNotConfiguredError, authApi } from '@/lib/auth/backend'
import { loginSchema } from '@/lib/auth/schema'
import { writeSession } from '@/lib/auth/session'

/**
 * Sign in.
 *
 * Returns one message for a wrong email and a wrong password. The API already
 * behaves this way; repeating the rule here matters because this is the layer a
 * shopper's browser talks to, and a helpfully specific "no such account" would
 * turn this endpoint into a way to test whether an address is registered.
 *
 * Rate limiting is the API's (20 attempts per 15 minutes on the auth routes),
 * and its 429 is passed through rather than retried — retrying a throttled
 * sign-in on the shopper's behalf would defeat the limiter.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  let result
  try {
    result = await authApi.login(parsed.data)
  } catch (error) {
    if (error instanceof ApiNotConfiguredError) {
      return NextResponse.json({ error: authCopy.unexpected }, { status: 503 })
    }
    throw error
  }

  if (!result.ok) {
    if (result.status === 0) {
      return NextResponse.json({ error: authCopy.offline }, { status: 503 })
    }
    if (result.status === 429) {
      return NextResponse.json({ error: authCopy.login.rateLimited }, { status: 429 })
    }
    if (result.status === 401) {
      // The one case worth telling apart: a correct password on a disabled
      // account. Saying "wrong password" there sends someone round in circles
      // changing a password that was never the problem.
      const inactive = result.message.toLowerCase().includes('not active')
      return NextResponse.json(
        { error: inactive ? authCopy.login.suspended : authCopy.login.invalid },
        { status: 401 },
      )
    }
    return NextResponse.json({ error: authCopy.unexpected }, { status: 502 })
  }

  const response = NextResponse.json(
    { user: result.data.user },
    { headers: { 'Cache-Control': 'no-store' } },
  )
  writeSession(response, result.data)
  return response
}
