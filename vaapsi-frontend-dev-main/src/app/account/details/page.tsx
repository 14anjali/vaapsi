import type { Metadata } from 'next'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { getAccount } from '@/lib/data'
import { ProfileDetails } from '@/components/patterns/auth/profile-details'

export const metadata: Metadata = {
  title: accountCopy.details.title,
  robots: { index: false, follow: false },
}

export default async function DetailsPage() {
  const account = await getAccount()

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.details.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.details.title}
          </Type>
        </Stack>

        <ProfileDetails
          name={account.name}
          email={account.email}
          phone={account.phone}
        />

        <Type size="xs" tone="subtle">
          Update your name, email, or phone number and save your changes.
        </Type>
      </Stack>
    </Container>
  )
}