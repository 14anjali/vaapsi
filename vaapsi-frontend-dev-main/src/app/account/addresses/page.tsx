import type { Metadata } from 'next'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { getAccount } from '@/lib/data'

export const metadata: Metadata = {
  title: accountCopy.addresses.title,
  robots: { index: false, follow: false },
}

/**
 * Addresses.
 *
 * Read-only: editing needs the account service, and a form that looks editable
 * and silently discards what you type is worse than one that admits it cannot
 * save. The lede states the second use — a prepaid resale label is posted here —
 * because that is not obvious and it is the reason a seller would open this page
 * at all.
 */
export default async function AddressesPage() {
  const account = await getAccount()

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.addresses.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.addresses.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {accountCopy.addresses.lede}
          </Type>
        </Stack>

        <Stack gap={3} as="ul">
          {account.addresses.map((address) => (
            <li key={address.id}>
              <Stack gap={1} className="border border-line p-4">
                <Row gap={2} align="baseline" wrap>
                  <Type as="h2" size="sm" weight="emphasis">
                    {address.label}
                  </Type>
                  {address.isDefault && (
                    <Type as="span" size="xs" tone="subtle">
                      {accountCopy.addresses.default}
                    </Type>
                  )}
                </Row>
                <Type size="sm" tone="muted">
                  {address.line2 === null ? address.line1 : `${address.line1}, ${address.line2}`}
                </Type>
                <Type size="sm" tone="muted" numeric>
                  {address.city}, {address.state} {address.pin}
                </Type>
              </Stack>
            </li>
          ))}
        </Stack>

        <Type size="xs" tone="subtle">
          {accountCopy.details.demoNote}
        </Type>
      </Stack>
    </Container>
  )
}
