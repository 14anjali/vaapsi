import { account as fixtureAccount } from './fixtures/account'
import { getSession } from '@/lib/auth/session'
import type { Account } from '@/lib/types'

/**
 * The signed-in shopper's account.
 *
 * This is the change `types/account.ts` and `docs/integration.md` both
 * anticipated: "when real auth lands the only change here is where
 * `getAccount()` gets its id". The identity now comes from the session rather
 * than from the fixture.
 *
 * ## What is real and what is not
 *
 * **Real**: name, email and phone, read from `GET /auth/me` on every call.
 *
 * **Still fixture**: addresses and saved cards. There are no address or card
 * tables in the API — the schema has users, products, listings, orders,
 * loyalty, tickets and audit, and nothing else — so there is nothing to read
 * them from yet. They are left pointing at the fixture rather than returned
 * empty, because an empty address book would read as "your saved addresses are
 * gone" instead of "this part is not built". The payment page already carries a
 * demo note; the addresses page needs one when those endpoints land.
 *
 * ## Why it still falls back to the fixture
 *
 * Every page that calls this sits behind the middleware, so in practice a
 * session always exists. The fallback covers the two cases where it does not:
 * `API_BASE_URL` unset, which `.env.example` documents as "the app runs
 * entirely on local fixtures", and a build-time prerender. Throwing in either
 * case would take down a storefront that is otherwise working.
 */
export async function getSessionAccount(): Promise<Account> {
  const session = await getSession()
  if (session === null) return fixtureAccount

  const { user } = session
  return {
    // A phone-only account has no name until it sets one; the email local part
    // is a better placeholder than an empty heading.
    name: user.fullName ?? user.email?.split('@')[0] ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    addresses: fixtureAccount.addresses,
    cards: fixtureAccount.cards,
  }
}
