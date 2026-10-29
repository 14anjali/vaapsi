import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE } from '@/lib/auth/config'
import { authApi } from '@/lib/auth/backend'

export async function PATCH(request: Request) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Please sign in to update your profile.' },
      { status: 401 },
    )
  }

  let body: {
    fullName?: string
    email?: string
    phone?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const result = await authApi.updateProfile(accessToken, body)

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status === 0 ? 502 : result.status },
    )
  }

  return NextResponse.json(
    { user: result.data },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}