import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

/**
 * Who is signed in, for client components.
 *
 * The header is a client component (it tracks scroll), so it cannot read the
 * session the way a server component does. It asks here instead. The response
 * carries the public user projection and never a token, which is the whole
 * point of keeping the tokens in httpOnly cookies.
 *
 * Returns 200 with `{ user: null }` rather than a 401 for a signed-out visitor:
 * not being signed in is a normal answer to this question, and a 401 would make
 * every anonymous page view look like an error in the console and in logs.
 */
export async function GET() {
  const session = await getSession()
  return NextResponse.json(
    { user: session?.user ?? null },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
