import { API_PREFIX, apiBaseUrl } from './config'

/**
 * The typed edge of the auth API.
 *
 * Every call to the Express backend goes through here so there is one place
 * that knows the envelope shape, one place that turns a network failure into a
 * value rather than a throw, and one place that guarantees `cache: 'no-store'`.
 * A cached sign-in response would be a serious bug.
 */

/** The user projection the API returns. Never contains a password hash. */
export type AuthUser = {
  id: string
  email: string | null
  phone: string | null
  fullName: string | null
  role: 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  emailVerified: boolean
  phoneVerified: boolean
  marketingOptIn: boolean
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthSuccess = { user: AuthUser } & AuthTokens

/**
 * A call that completed, whether or not the API liked the request.
 *
 * `status: 0` is reserved for "we never reached the backend", which the UI has
 * to tell apart from a rejection: one is worth retrying and the other is not.
 */
export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false
      status: number
      code: string
      message: string
      details?: Record<string, readonly string[]>
    }

type Envelope<T> =
  | { success: true; data: T }
  | {
      success: false
      error: { code?: string; message?: string; details?: Record<string, readonly string[]> }
    }

export class ApiNotConfiguredError extends Error {
  constructor() {
    super('API_BASE_URL is not set, so authentication cannot reach the backend.')
    this.name = 'ApiNotConfiguredError'
  }
}

async function call<T>(
  path: string,
 init: { method: 'GET' | 'POST' | 'PATCH'; body?: unknown; accessToken?: string },
): Promise<ApiResult<T>> {
  const base = apiBaseUrl()
  if (base === null) throw new ApiNotConfiguredError()

  let response: Response
  try {
    response = await fetch(`${base}${API_PREFIX}${path}`, {
      method: init.method,
      headers: {
        ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(init.accessToken === undefined ? {} : { Authorization: `Bearer ${init.accessToken}` }),
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      // Credentials are in the Authorization header, and a cached auth response
      // is never acceptable.
      cache: 'no-store',
    })
  } catch {
    return { ok: false, status: 0, code: 'NETWORK', message: 'Could not reach the API' }
  }

  let payload: Envelope<T> | null = null
  try {
    payload = (await response.json()) as Envelope<T>
  } catch {
    // A non-JSON body (a proxy error page, say) is still a failure we can report.
    payload = null
  }

  if (response.ok && payload !== null && payload.success === true) {
    return { ok: true, status: response.status, data: payload.data }
  }

  const error = payload !== null && payload.success === false ? payload.error : undefined
  return {
    ok: false,
    status: response.status,
    code: error?.code ?? 'UNKNOWN',
    message: error?.message ?? 'Request failed',
    ...(error?.details === undefined ? {} : { details: error.details }),
  }
}

export const authApi = {
  /** POST /auth/register — 409 when the email or phone is already taken. */
  register: (body: {
    email: string
    password: string
    fullName?: string
    phone?: string
    marketingOptIn?: boolean
  }) => call<AuthSuccess>('/auth/register', { method: 'POST', body }),

  /** POST /auth/login — 401 for bad credentials or an inactive account. */
  login: (body: { email: string; password: string }) =>
    call<AuthSuccess>('/auth/login', { method: 'POST', body }),

  /** POST /auth/refresh — rotates: the old refresh token is revoked. */
  refresh: (refreshToken: string) =>
    call<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  /** POST /auth/logout — revokes the refresh token server-side. */
  logout: (refreshToken: string) =>
    call<{ success: boolean }>('/auth/logout', { method: 'POST', body: { refreshToken } }),

  /** GET /auth/me — the signed-in user, plus wallet and notification prefs. */
  me: (accessToken: string) =>
    call<AuthUser & { wallet: unknown; notifPrefs: unknown }>('/auth/me', {
      method: 'GET',
      accessToken,
    }),
      /** PATCH /auth/me — updates the signed-in user's profile. */
  updateProfile: (
    accessToken: string,
    body: {
      fullName?: string
      email?: string
      phone?: string | null
    },
  ) =>
    call<AuthUser>('/auth/me', {
      method: 'PATCH',
      body,
      accessToken,
    }),
}
