import { API_PREFIX, apiBaseUrl } from './config'
import { ApiNotConfiguredError } from './backend'

/**
 * The two password-reset calls against the Express API.
 *
 * Self-contained on purpose, so this feature drops in without editing
 * `backend.ts`. If you would rather have one client, move `forgot` and `reset`
 * onto `authApi` there and delete this file — nothing but the two route
 * handlers imports it.
 *
 * Same contract as `backend.ts`: a completed call is a value, not a throw, and
 * `status: 0` means the API was never reached — a case the UI has to tell apart
 * from a rejection, because one is worth retrying and the other is not.
 */

export type PasswordApiResult =
  | { ok: true; status: number }
  | {
      ok: false
      status: number
      code: string
      message: string
      details?: Record<string, readonly string[]>
    }

type Envelope =
  | { success: true; data: unknown }
  | {
      success: false
      error: { code?: string; message?: string; details?: Record<string, readonly string[]> }
    }

async function post(path: string, body: unknown): Promise<PasswordApiResult> {
  const base = apiBaseUrl()
  if (base === null) throw new ApiNotConfiguredError()

  let response: Response
  try {
    response = await fetch(`${base}${API_PREFIX}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, status: 0, code: 'NETWORK', message: 'Could not reach the API' }
  }

  let payload: Envelope | null = null
  try {
    payload = (await response.json()) as Envelope
  } catch {
    payload = null
  }

  if (response.ok && payload !== null && payload.success === true) {
    return { ok: true, status: response.status }
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

export const passwordApi = {
  /**
   * POST /auth/password/forgot
   *
   * Succeeds whether or not the address has an account — the API refuses to
   * confirm either way, and this layer must not add that signal back.
   */
  forgot: (email: string) => post('/auth/password/forgot', { email }),

  /** POST /auth/password/reset — 400 for any unusable code, deliberately vague. */
  reset: (input: { email: string; code: string; password: string }) =>
    post('/auth/password/reset', input),
}
