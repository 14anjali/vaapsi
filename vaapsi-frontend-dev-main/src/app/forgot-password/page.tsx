import type { Metadata } from 'next'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { ForgotPasswordForm } from '@/components/patterns/auth/forgot-password-form'
import { passwordCopy } from '@/content/auth-password'

export const metadata: Metadata = {
  title: passwordCopy.forgot.title,
  // Account recovery has nothing for a crawler, and a reset form in search
  // results is a phishing target wearing our name.
  robots: { index: false, follow: false },
}

/**
 * Forgot your password.
 *
 * Reachable while signed out *and* signed in: the middleware does not guard
 * this route. Someone who is signed in on one device and has forgotten the
 * password they need on another should not have to sign out to recover it.
 */
export default function ForgotPasswordPage() {
  return (
    <Container>
      <Stack gap={6} className="max-w-[26rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{passwordCopy.forgot.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {passwordCopy.forgot.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {passwordCopy.forgot.lede}
          </Type>
        </Stack>

        <ForgotPasswordForm />
      </Stack>
    </Container>
  )
}
