import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { ResetPasswordForm } from '@/components/patterns/auth/reset-password-form'
import { passwordCopy } from '@/content/auth-password'

export const metadata: Metadata = {
  title: passwordCopy.reset.title,
  robots: { index: false, follow: false },
}

/**
 * Set a new password.
 *
 * The Suspense boundary is required, not decorative — the form reads
 * `useSearchParams` to prefill the email from the forgot step, which opts its
 * subtree into client rendering.
 */
export default function ResetPasswordPage() {
  return (
    <Container>
      <Stack gap={6} className="max-w-[26rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{passwordCopy.reset.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {passwordCopy.reset.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {passwordCopy.reset.lede}
          </Type>
        </Stack>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </Stack>
    </Container>
  )
}
