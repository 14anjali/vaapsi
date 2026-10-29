import { NextResponse } from 'next/server'
import { authCopy } from '@/content/auth'
import { ApiNotConfiguredError, authApi } from '@/lib/auth/backend'
import { signupSchema } from '@/lib/auth/schema'
import { writeSession } from '@/lib/auth/session'

/**
 * Create an account.
 *
 * This route exists so the browser never touches a token. It forwards the
 * credentials to the API, keeps the pair that comes back, and returns only the
 * public user projection with the tokens set as httpOnly cookies.
 *
 * The payload is validated here with the *same* schema the form uses, because
 * the form is a convenience and this is the boundary. The API validates a third
 * time and remains the authority — `details` from it are mapped back onto
 * fields rather than flattened into one message.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { fullName, email, phone, password, marketingOptIn } = parsed.data

  let result
  try {
    result = await authApi.register({
      email,
      password,
      fullName,
      ...(phone === undefined ? {} : { phone }),
      ...(marketingOptIn === undefined ? {} : { marketingOptIn }),
    })
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
    if (result.status === 409) {
      // The API distinguishes the two unique columns; keep that distinction so
      // the message lands on the field the shopper has to change.
      const onPhone = result.message.toLowerCase().includes('phone')
      return NextResponse.json(
        {
          error: onPhone ? authCopy.signup.phoneTaken : authCopy.signup.emailTaken,
          fieldErrors: onPhone
            ? { phone: [authCopy.signup.phoneTaken] }
            : { email: [authCopy.signup.emailTaken] },
        },
        { status: 409 },
      )
    }
    if (result.status === 429) {
      return NextResponse.json({ error: authCopy.signup.rateLimited }, { status: 429 })
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
    return NextResponse.json({ error: authCopy.unexpected }, { status: 502 })
  }

  // Signed in on creation. The existing flow has no email-verification gate, so
  // bouncing a new customer to a sign-in form to retype what they just typed
  // would be friction with nothing behind it.
  const response = NextResponse.json(
    { user: result.data.user },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
  writeSession(response, result.data)
  return response
}

