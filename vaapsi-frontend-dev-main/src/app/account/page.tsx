import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { authCopy } from '@/content/auth'
import { getAccount } from '@/lib/data'
import { ProfileDetails } from '@/components/patterns/auth/profile-details'

export const metadata: Metadata = {
  title: accountCopy.hub.title,
  robots: { index: false, follow: false },
}

/**
 * The account hub.
 *
 * Purchases lead, because they are the only way into a resale listing — the
 * ordering here is the entitlement model made visible rather than a guess about
 * what gets clicked most.
 */
export default async function AccountPage() {
  // Middleware guarantees a session here, so this is the signed-in shopper
  // rather than a fixture. Naming them is the cheapest possible confirmation
  // that sign-in actually worked, on the page they land on after it.
  const account = await getAccount()

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.hub.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.hub.title}
          </Type>
          {account.name !== '' && (
            <Type size="sm" tone="muted">
              {authCopy.session.hubGreeting(account.name)}
            </Type>
          )}
        </Stack>

                <ProfileDetails
          name={account.name}
          email={account.email}
          phone={account.phone}
        />

        {/*
          Said plainly. A demo account presented as a real one is the kind of
          thing a reviewer reasonably takes at face value.
        */}
        <Stack gap={1} className="border border-line bg-surface p-4">
          <Type as="h2" size="sm" weight="emphasis">
            {accountCopy.hub.demoTitle}
          </Type>
          <Type size="xs" tone="muted" measure="default">
            {accountCopy.hub.demoBody}
          </Type>
        </Stack>

        <Stack gap={0} as="ul" className="border-t border-line">
          {accountCopy.menu.items.map((item) => (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                className="ease block py-4 transition-colors duration-fast hover:bg-surface"
              >
                <Row gap={3} justify="between" align="center" wrap={false}>
                  <Stack gap={0}>
                    <Type as="span" size="base" weight="emphasis">
                      {item.label}
                    </Type>
                    {item.note !== undefined && (
                      <Type as="span" size="xs" tone="subtle">
                        {item.note}
                      </Type>
                    )}
                  </Stack>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-ink-subtle"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Row>
              </Link>
            </li>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
