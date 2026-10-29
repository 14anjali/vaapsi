# Integration

**Read this first.** It names every file you change to put this storefront on
real endpoints, and every file you should not touch.

If you only read one section, read [The five-minute version](#the-five-minute-version).

---

## The five-minute version

The whole data layer is behind one interface. To go live:

1. Write an object satisfying `DataAdapter` (`src/lib/data/adapter.ts`) against
   your endpoints.
2. Change one line in `src/lib/data/index.ts`:

   ```ts
   export const data: DataAdapter = httpAdapter // was: mockAdapter
   ```

3. Delete `src/lib/data/mock.ts` and `src/lib/data/fixtures/`.
4. Delete the two route handlers that exist only to serve the mock:
   `src/app/api/products/count/route.ts` and `src/app/api/cart/route.ts` — or
   repoint them at your API if you would rather keep the same client contract.

Nothing else in the app knows which implementation it is talking to. An ESLint
rule fails the build if anything outside `src/lib/data/` imports a fixture, so
that boundary is machine-checked rather than a convention.

---

## Files you will change

| File                                  | What it is                                      | What to do                                                              |
| ------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `src/lib/data/index.ts`               | Exports the active adapter                      | **One line.** Point `data` at your adapter                              |
| `src/lib/data/adapter.ts`             | The interface                                   | Read it. Do not widen it without a reason                               |
| `src/app/api/cart/route.ts`           | Resolves client-held cart IDs into priced lines | Repoint at your cart endpoint, or delete and have the client call yours |
| `src/app/api/products/count/route.ts` | Filter-count for the mobile filter sheet        | Repoint or delete                                                       |
| `next.config.mjs`                     | `images.remotePatterns` allows `picsum.photos`  | **Remove picsum.** Add your image host                                  |
| `.env.example` → your env             | Base URLs and keys                              | Fill in                                                                 |

## Files you will delete

| File                            | Why                                                      |
| ------------------------------- | -------------------------------------------------------- |
| `src/lib/data/mock.ts`          | The mock implementation                                  |
| `src/lib/data/fixtures/*`       | Placeholder garments, passports and sellers              |
| `src/app/kitchen-sink/page.tsx` | Internal component review page (optional — it is useful) |
| `src/app/tokens/page.tsx`       | Internal token specimen (optional — also useful)         |

## Files you should not touch

| File                      | Why                                                                     |
| ------------------------- | ----------------------------------------------------------------------- |
| `src/lib/types/*`         | **The contract.** Changing a type here is a contract change — see below |
| `src/styles/tokens.css`   | The only file allowed a colour literal. A test enforces it              |
| `src/lib/motion/index.ts` | Every animation resolves here. Inline durations get reverted            |
| `src/content/*`           | All user-facing copy. Strings in JSX get reverted                       |

---

## The contract

`src/lib/types/` is what you map Prisma models onto. Full field reference:
[`data-contract.md`](./data-contract.md).

Five things in it are load-bearing and will look like they can be simplified.
They cannot:

1. **Money is integer paise, never a float.** `priceInr: 129900` is ₹1,299.
   Formatting happens at the very edge, in `lib/format/currency`.
2. **There is no quantity, anywhere.** Every garment is one-of-one. If a
   `quantity` field appears, something upstream has started treating garments as
   SKUs, and the cart, the PDP and the passport all become wrong.
3. **`Sourced<T>` is not optional.** Every passport field carrying a source badge
   is a value _plus_ its provenance. Make provenance optional and it gets
   dropped, and then the storefront is making claims nobody can stand behind.
4. **`impact.basis` is required.** No number without a stated source.
5. **`originalDeclaration` is immutable and `corrections` is append-only.** A
   correction never overwrites. The UI shows both, deliberately.

### Changing a type

A change in `src/lib/types/` is a contract change. Say so in the PR body and
flag it to the design side — several UI behaviours are derived from these types
rather than duplicated, so widening a union usually means a new UI state exists
that nobody has designed.

---

## Not ours

Four things are your stack's, not this repo's. The seams are left clean and
nothing here needs to move to accommodate them.

| Area                                 | Where it plugs in                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** (email/password, phone OTP) | No auth exists here. The header has no account control yet; add one beside the bag in `components/patterns/site-header.tsx`. `Seller` is already a public projection with no PII |
| **Payments** (PayU, Razorpay, UPI)   | `/checkout` is an honest placeholder that says checkout is not built. Replace the route. It is deliberately _not_ a fake payment screen                                          |
| **Analytics** (GA4)                  | Nothing is wired. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is in `.env.example` as a placeholder                                                                                          |
| **PWA / service worker**             | Not set up, and not assumed                                                                                                                                                      |

---

## What runs where

Worth knowing before you refactor, because it is deliberate:

- **Server components by default.** Home, listing, PDP and passport all render on
  the server through the adapter. First paint matters on a storefront.
- **TanStack Query is used narrowly** — the pending filter count in the mobile
  sheet, and the cart. Both genuinely need to be live in the browser. Everything
  else is server-rendered.
- **Filter state is in the URL**, not in Zustand. Shareable, back-button correct,
  server-renderable. Do not move it into a store.
- **Zustand holds two things**: which panel is open (`store/ui.ts`, ephemeral) and
  cart/wishlist membership (`store/cart.ts`, `store/wishlist.ts`, persisted to
  localStorage as **IDs and timestamps only** — never prices or availability).
- **`/product/[slug]` and `/passport/[id]` are statically generated** from
  `generateStaticParams`, with `dynamicParams` left on so a newly listed garment
  still renders. See `decisions.md` on the soft-404 caveat.

## Gotchas that will cost you an afternoon

- **`cn()` is extended.** `src/lib/utils/cn.ts` teaches tailwind-merge that
  `font-display`/`font-body` are families and `font-regular`/`font-emphasis`/
  `font-heading` are weights. Without it, tailwind-merge silently eats the family.
- **`notFound()` returns HTTP 200 on dynamic routes.** Next has streamed the
  shell by then. It injects `noindex`, so it is not indexed, but it is a soft 404.
- **React 18 drops boolean `inert`.** Overlays use `visibility` instead, which
  also works before hydration. Do not "fix" this by adding `inert`.
- **shadcn CLI:** use `pnpm dlx shadcn@2.3.0 add <component>`. `@latest` targets
  Tailwind v4 and writes `oklch()` into a config that reads `hsl()`.
