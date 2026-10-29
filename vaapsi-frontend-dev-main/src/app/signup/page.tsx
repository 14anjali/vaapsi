import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { SignupForm } from '@/components/patterns/auth/signup-form'
import { authCopy } from '@/content/auth'

export const metadata: Metadata = {
  title: authCopy.signup.title,
  robots: { index: false, follow: false },
}

/** Create an account. See `login/page.tsx` on why the Suspense boundary is here. */
export default function SignupPage() {
  return (
    <Container>
      <Stack gap={6} className="max-w-[26rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{authCopy.signup.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {authCopy.signup.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {authCopy.signup.lede}
          </Type>
        </Stack>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </Stack>
    </Container>
  )
}
