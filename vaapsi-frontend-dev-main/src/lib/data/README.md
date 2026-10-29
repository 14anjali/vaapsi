# lib/data/

The integration seam. Exposes a typed adapter interface (`getProduct`,
`listProducts`, `getPassport`, …) with a mock implementation reading local
fixtures.

**Nothing outside this folder may import fixtures.** Every consumer goes through
the interface, which is why swapping the mock for TanStack Query against real
endpoints is a single-file change. An ESLint rule enforces the boundary.
