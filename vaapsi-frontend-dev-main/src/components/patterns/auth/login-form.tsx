'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { authCopy } from '@/content/auth'
import { loginSchema, type LoginFormValues } from '@/lib/auth/schema'
import { AuthField } from './auth-field'
import { safeNext } from './safe-next'
import { useQueryClient } from '@tanstack/react-query'
import { SESSION_QUERY_KEY } from '@/components/patterns/auth/use-session'

/**
 * Sign in.
 *
 * Validates locally for immediate feedback, then posts to `/api/auth/login`,
 * which is the only thing that sees the password after this component and the
 * only thing that handles tokens. Nothing token-shaped comes back here — the
 * response carries the user, and the session arrives as httpOnly cookies the
 * browser cannot read.
 *
 * `router.refresh()` after the redirect is load-bearing: the header and the
 * account pages are server-rendered, so without it a shopper lands on
 * `/account` with the cached signed-out shell.
 */
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: '', password: '' } })

  const redirectedFrom = searchParams.get('next')

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      for (const [name, messages] of Object.entries(fields)) {
        const message = messages?.[0]
        if (message !== undefined) setError(name as keyof LoginFormValues, { message })
      }
      return
    }


   
    
    let response: Response
    
    try {
   
response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(parsed.data),
})

console.log('Login status:', response.status)

    
      console.log('Login status:', response.status)
    } catch (error) {
      console.error('Login request failed:', error)
      setFormError(authCopy.offline)
      return
    }

   const payload = (await response.json().catch(() => null)) as {
  error?: string | { code?: string; message?: string }
  message?: string
  fieldErrors?: Record<string, string[]>
} | null

    if (!response.ok) {
      if (payload?.fieldErrors !== undefined) {
        for (const [name, messages] of Object.entries(payload.fieldErrors)) {
          const message = messages[0]
          if (message !== undefined) setError(name as keyof LoginFormValues, { message })
        }
      }
const errorMessage =
  typeof payload?.error === 'string'
    ? payload.error
    : payload?.error?.message ?? payload?.message ?? authCopy.unexpected

setFormError(errorMessage)
      return
    }
await queryClient.invalidateQueries({
  queryKey: SESSION_QUERY_KEY,
})
    // `replace`, not `push`: the sign-in page should not be a back-button stop
    // once it has done its job.
    router.replace('/')
    router.refresh()
  })

  return (
    <Stack gap={5}>
      {redirectedFrom !== null && formError === null && (
        <Type size="sm" tone="muted">
          {authCopy.login.redirectedNote}
        </Type>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <AuthField
            id="email"
            label={authCopy.login.emailLabel}
            type="email"
            placeholder={authCopy.login.emailPlaceholder}
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            error={errors.email?.message}
            registration={register('email')}
          />

          <AuthField
            id="password"
            label={authCopy.login.passwordLabel}
            type="password"
            placeholder={authCopy.login.passwordPlaceholder}
            autoComplete="current-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            registration={register('password')}
          />

          {/*
            The one message that covers a wrong email and a wrong password.
            Live, because it appears without focus moving anywhere.
          */}
          {formError !== null && (
            <div role="alert" aria-live="polite">
              <Type size="sm" tone="accent">
                {formError}
              </Type>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="ease w-full border border-line-strong px-4 py-2.5 text-sm transition-colors duration-fast hover:border-ink disabled:opacity-50"
          >
            {isSubmitting ? authCopy.login.submitting : authCopy.login.submit}
          </button>
        </Stack>
      </form>

      <Row gap={2} align="baseline">
        <Type as="span" size="sm" tone="muted">
          {authCopy.login.noAccount}
        </Type>
        <Link href="/signup" className="text-sm underline underline-offset-4 hover:no-underline">
          {authCopy.login.createAction}
        </Link>
      </Row>
    </Stack>
  )
}
