'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { passwordCopy } from '@/content/auth-password'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/auth/password-schema'
import { AuthField } from './auth-field'

/**
 * Ask for a reset code.
 *
 * On success it shows a confirmation that **does not say whether the address is
 * registered** — "if there is an account with that email" — and offers a link
 * through to the reset page carrying the address, so nobody has to retype it.
 *
 * The form is replaced by the confirmation rather than sitting underneath it.
 * Leaving a live Send button next to "a code is on its way" invites a second
 * press, which retires the first code and makes the one in their inbox stop
 * working.
 */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ defaultValues: { email: '' } })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const parsed = forgotPasswordSchema.safeParse(values)
    if (!parsed.success) {
      const message = parsed.error.flatten().fieldErrors.email?.[0]
      if (message !== undefined) setError('email', { message })
      return
    }

    let response: Response
    try {
      response = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
    } catch {
      setFormError(passwordCopy.offline)
      return
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: string
      fieldErrors?: Record<string, string[]>
    } | null

    if (!response.ok) {
      const fieldMessage = payload?.fieldErrors?.email?.[0]
      if (fieldMessage !== undefined) setError('email', { message: fieldMessage })
      setFormError(payload?.error ?? passwordCopy.unexpected)
      return
    }

    setSentTo(parsed.data.email)
  })

  if (sentTo !== null) {
    return (
      <Stack gap={5}>
        <div role="status" aria-live="polite">
          <Type size="sm" tone="positive" measure="default">
            {passwordCopy.forgot.sent}
          </Type>
        </div>

        <Stack gap={3}>
          {/*
            Carries the address through so it is not typed twice. It is not a
            credential — the code in their inbox is — so putting it in the query
            string costs nothing.
          */}
          <Link
            href={`/reset-password?email=${encodeURIComponent(sentTo)}`}
            className="ease border border-line-strong px-4 py-2.5 text-center text-sm transition-colors duration-fast hover:border-ink"
          >
            {passwordCopy.forgot.sentAction}
          </Link>
          <Link
            href="/login"
            className="text-sm underline underline-offset-4 hover:no-underline"
          >
            {passwordCopy.forgot.backToLogin}
          </Link>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack gap={5}>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <AuthField
            id="email"
            label={passwordCopy.forgot.emailLabel}
            type="email"
            placeholder={passwordCopy.forgot.emailPlaceholder}
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            error={errors.email?.message}
            registration={register('email')}
          />

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
            {isSubmitting ? passwordCopy.forgot.submitting : passwordCopy.forgot.submit}
          </button>
        </Stack>
      </form>

      <Row gap={2} align="baseline">
        <Link href="/login" className="text-sm underline underline-offset-4 hover:no-underline">
          {passwordCopy.forgot.backToLogin}
        </Link>
      </Row>
    </Stack>
  )
}
