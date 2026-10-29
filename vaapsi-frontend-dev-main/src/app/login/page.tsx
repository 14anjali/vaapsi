import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { LoginForm } from '@/components/patterns/auth/login-form'
import { authCopy } from '@/content/auth'

export const metadata: Metadata = {
  title: authCopy.login.title,
  // An account page has nothing for a crawler, and a sign-in form in search
  // results is a phishing target wearing our name.
  robots: { index: false, follow: false },
}

/**
 * Sign in.
 *
 * Thin by design: the page owns the heading and the metadata, the form owns the
 * interaction. Middleware has already bounced anyone who is signed in, so this
 * never renders for a shopper who does not need it.
 *
 * The Suspense boundary is required, not decorative — the form reads
 * `useSearchParams` for `?next=`, which opts its subtree into client rendering.
 */
export default function LoginPage() {
  return (
    <Container>
      <Stack gap={6} className="max-w-[26rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{authCopy.login.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {authCopy.login.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {authCopy.login.lede}
          </Type>
        </Stack>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Stack>
    </Container>
  )
}
