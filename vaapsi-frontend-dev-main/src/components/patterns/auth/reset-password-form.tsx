'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { passwordCopy } from '@/content/auth-password'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/auth/password-schema'
import { AuthField } from './auth-field'

/**
 * Enter the emailed code and choose a new password.
 *
 * The email is prefilled from `?email=` when the customer arrived from the
 * forgot page, and stays editable — they may have asked for the code on a
 * phone and be finishing on a laptop, where the query string is absent.
 *
 * On success it does **not** sign them in: the reset has revoked every session
 * on the account, and issuing a new one here would undo that. It shows what
 * happened, including the sign-out-everywhere consequence, and links to sign in.
 */
export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: searchParams.get('email') ?? '',
      code: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const parsed = resetPasswordSchema.safeParse(values)
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      for (const [name, messages] of Object.entries(fields)) {
        const message = messages?.[0]
        if (message !== undefined) setError(name as keyof ResetPasswordFormValues, { message })
      }
      return
    }

    let response: Response
    try {
      response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parsed.data.email,
          code: parsed.data.code,
          password: parsed.data.password,
        }),
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
      if (payload?.fieldErrors !== undefined) {
        for (const [name, messages] of Object.entries(payload.fieldErrors)) {
          const message = messages[0]
          if (message !== undefined && name in parsed.data) {
            setError(name as keyof ResetPasswordFormValues, { message })
          }
        }
      }
      setFormError(payload?.error ?? passwordCopy.unexpected)
      return
    }

    setDone(true)
  })

  if (done) {
    return (
      <Stack gap={5}>
        <div role="status" aria-live="polite">
          <Type size="sm" tone="positive" measure="default">
            {passwordCopy.reset.success}
          </Type>
        </div>
        <Link
          href="/login"
          className="ease border border-line-strong px-4 py-2.5 text-center text-sm transition-colors duration-fast hover:border-ink"
        >
          {passwordCopy.reset.successAction}
        </Link>
      </Stack>
    )
  }

  return (
    <Stack gap={5}>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <AuthField
            id="email"
            label={passwordCopy.reset.emailLabel}
            type="email"
            placeholder={passwordCopy.reset.emailPlaceholder}
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            registration={register('email')}
          />

          <AuthField
            id="code"
            label={passwordCopy.reset.codeLabel}
            placeholder={passwordCopy.reset.codePlaceholder}
            // `one-time-code` is what lets a phone offer the code straight from
            // the notification instead of making them switch apps to read it.
            autoComplete="one-time-code"
            hint={passwordCopy.reset.codeHint}
            autoFocus={searchParams.get('email') !== null}
            disabled={isSubmitting}
            error={errors.code?.message}
            registration={register('code')}
          />

          <AuthField
            id="password"
            label={passwordCopy.reset.passwordLabel}
            type="password"
            placeholder={passwordCopy.reset.passwordPlaceholder}
            autoComplete="new-password"
            hint={passwordCopy.reset.passwordHint}
            disabled={isSubmitting}
            error={errors.password?.message}
            registration={register('password')}
          />

          <AuthField
            id="confirmPassword"
            label={passwordCopy.reset.confirmLabel}
            type="password"
            placeholder={passwordCopy.reset.confirmPlaceholder}
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
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
            {isSubmitting ? passwordCopy.reset.submitting : passwordCopy.reset.submit}
          </button>
        </Stack>
      </form>

      <Row gap={2} align="baseline">
        <Type as="span" size="sm" tone="muted">
          {passwordCopy.reset.noCode}
        </Type>
        <Link
          href="/forgot-password"
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          {passwordCopy.reset.resendAction}
        </Link>
      </Row>
    </Stack>
  )
}
