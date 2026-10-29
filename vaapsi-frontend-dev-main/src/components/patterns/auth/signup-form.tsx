'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { authCopy } from '@/content/auth'
import { signupSchema, type SignupFormValues } from '@/lib/auth/schema'
import { AuthField } from './auth-field'
import { safeNext } from './safe-next'

/**
 * Create an account.
 *
 * Email and password are the credential; the name is asked for because every
 * account page shows it, and the phone is optional because nothing in the
 * sign-up path needs it — it is there so a delivery or a resale label has
 * somewhere to go, and it says so rather than being a silent required field.
 *
 * On success the shopper is already signed in: the route handler sets the
 * session cookies from the same response, so there is no sign-in form to
 * retype into. There is no email-verification gate in the confirmed scope, so
 * adding one here would block a flow nobody asked to block.
 */
export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      marketingOptIn: false,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setEmailTaken(false)

    const parsed = signupSchema.safeParse(values)
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      for (const [name, messages] of Object.entries(fields)) {
        const message = messages?.[0]
        if (message !== undefined) setError(name as keyof SignupFormValues, { message })
      }
      return
    }

    let response: Response
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL
    
      if (!API_URL) {
        setFormError('Backend API URL is not configured.')
        return
      }
    
      response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      })
    
      console.log('Signup status:', response.status)
    } catch (error) {
      console.error('Signup request failed:', error)
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
          if (message !== undefined) setError(name as keyof SignupFormValues, { message })
        }
      }
      // A taken email is the one failure with an obvious next step, so the form
      // offers it as a link rather than leaving the shopper to find sign-in.
      if (response.status === 409 && payload?.fieldErrors?.email !== undefined) {
        setEmailTaken(true)
      }
    const errorMessage =
  typeof payload?.error === 'string'
    ? payload.error
    : payload?.error?.message ?? payload?.message ?? authCopy.unexpected

setFormError(errorMessage)
      return
    }

    // Held for a beat so the success line is readable rather than a flash.
    setDone(true)
    router.replace(safeNext(searchParams.get('next')))
    router.refresh()
  })

  return (
    <Stack gap={5}>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <AuthField
            id="fullName"
            label={authCopy.signup.nameLabel}
            placeholder={authCopy.signup.namePlaceholder}
            autoComplete="name"
            autoFocus
            disabled={isSubmitting || done}
            error={errors.fullName?.message}
            registration={register('fullName')}
          />

          <AuthField
            id="email"
            label={authCopy.signup.emailLabel}
            type="email"
            placeholder={authCopy.signup.emailPlaceholder}
            autoComplete="email"
            disabled={isSubmitting || done}
            error={errors.email?.message}
            registration={register('email')}
          />

          <AuthField
            id="phone"
            label={authCopy.signup.phoneLabel}
            labelNote={authCopy.signup.phoneOptional}
            type="tel"
            placeholder={authCopy.signup.phonePlaceholder}
            autoComplete="tel"
            hint={authCopy.signup.phoneNote}
            disabled={isSubmitting || done}
            error={errors.phone?.message}
            registration={register('phone')}
          />

          <AuthField
            id="password"
            label={authCopy.signup.passwordLabel}
            type="password"
            placeholder={authCopy.signup.passwordPlaceholder}
            autoComplete="new-password"
            hint={authCopy.signup.passwordHint}
            disabled={isSubmitting || done}
            error={errors.password?.message}
            registration={register('password')}
          />

          <AuthField
            id="confirmPassword"
            label={authCopy.signup.confirmLabel}
            type="password"
            placeholder={authCopy.signup.confirmPlaceholder}
            autoComplete="new-password"
            disabled={isSubmitting || done}
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
          />

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              disabled={isSubmitting || done}
              {...register('marketingOptIn')}
              className="mt-0.5 size-4 shrink-0 border-line accent-ink"
            />
            <Type as="span" size="sm" tone="muted">
              {authCopy.signup.marketingLabel}
            </Type>
          </label>

          {formError !== null && (
            <div role="alert" aria-live="polite">
              <Stack gap={1}>
                <Type size="sm" tone="accent">
                  {formError}
                </Type>
                {emailTaken && (
                  <Link
                    href="/login"
                    className="text-sm underline underline-offset-4 hover:no-underline"
                  >
                    {authCopy.signup.emailTakenAction}
                  </Link>
                )}
              </Stack>
            </div>
          )}

          {done && (
            <div role="status" aria-live="polite">
              <Type size="sm" tone="positive">
                {authCopy.signup.success}
              </Type>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || done}
            className="ease w-full border border-line-strong px-4 py-2.5 text-sm transition-colors duration-fast hover:border-ink disabled:opacity-50"
          >
            {isSubmitting ? authCopy.signup.submitting : authCopy.signup.submit}
          </button>
        </Stack>
      </form>

      <Row gap={2} align="baseline">
        <Type as="span" size="sm" tone="muted">
          {authCopy.signup.haveAccount}
        </Type>
        <Link href="/login" className="text-sm underline underline-offset-4 hover:no-underline">
          {authCopy.signup.loginAction}
        </Link>
      </Row>
    </Stack>
  )
}
