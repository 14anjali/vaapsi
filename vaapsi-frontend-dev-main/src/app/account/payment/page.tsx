import type { Metadata } from 'next'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { getAccount } from '@/lib/data'

export const metadata: Metadata = {
  title: accountCopy.payment.title,
  robots: { index: false, follow: false },
}

/**
 * Payment methods.
 *
 * A brand and the last four digits, which is all a UI ever needs. There is no
 * full card number anywhere in this codebase, demo or otherwise, and the page
 * says so — a prototype that appears to store card data invites exactly the
 * wrong assumption about what the real thing will do.
 *
 * The lede names the second use: a resale payout lands here. That is the reason
 * a seller would check this page, and it is not guessable from the title.
 */
export default async function PaymentPage() {
  const account = await getAccount()

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.payment.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.payment.title}
          </Type>
          <Type size="sm" tone="muted" measure="default">
            {accountCopy.payment.lede}
          </Type>
        </Stack>

        <Stack gap={3} as="ul">
          {account.cards.map((card) => (
            <li key={card.id}>
              <Stack gap={0} className="border border-line p-4">
                <Row gap={2} align="baseline" wrap>
                  <Type as="h2" size="sm" weight="emphasis">
                    {card.brand} &middot;&middot;&middot;&middot; {card.last4}
                  </Type>
                  {card.isDefault && (
                    <Type as="span" size="xs" tone="subtle">
                      {accountCopy.payment.default}
                    </Type>
                  )}
                </Row>
                <Type as="span" size="xs" tone="subtle" numeric>
                  {accountCopy.payment.expires(card.expiry)}
                </Type>
              </Stack>
            </li>
          ))}
        </Stack>

        <Type size="xs" tone="subtle" measure="default">
          {accountCopy.payment.demoNote}
        </Type>
      </Stack>
    </Container>
  )
}
