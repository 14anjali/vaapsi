# Contributing

## Commits — Conventional Commits

```
<type>(<scope>): <subject>
```

`type` is one of `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`,
`build`, `ci`, `perf`, `revert`.

`scope` is the area touched — usually a folder or a surface: `pdp`, `plp`,
`cart`, `passport`, `tokens`, `data`, `content`, `ci`.

Subject is imperative and lower-case, no trailing period.

```
feat(pdp): add passport chain timeline
fix(format): lakh grouping for values under one lakh
chore(deps): pin tailwind to 3.4.19
```

A commit that changes anything in `src/lib/types/` is a **contract change**. Say
so in the body and flag it to IPguide — those types are what the Prisma models
are mapped onto.

Breaking changes: add `!` after the scope and a `BREAKING CHANGE:` footer.

## Branches

```
<type>/<short-kebab-description>
```

Same `type` vocabulary as commits.

```
feat/pdp-passport-view
fix/inr-lakh-grouping
chore/ci-node-20
```

Branch off `main`. Keep branches short-lived and rebase rather than merge to
keep history readable. One epic or one fix per branch.

## Before you push

The pre-commit hook runs ESLint and Prettier on staged files. CI runs the full
gate. Locally, the fast check is:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

## Things that will get a PR sent back

- A hex code or `font-family` outside `src/styles/tokens.css`.
- A user-facing string hardcoded in JSX instead of `src/content/`.
- An import of a fixture from outside `src/lib/data/`.
- A price handled as a float.
- Bumping `next` or `tailwindcss` past their pinned majors.

## Adding a shadcn/ui primitive

Use the pinned CLI. `shadcn@latest` targets Tailwind v4 and its `init` writes
`oklch()` values into a config that expects `hsl()` triplets:

```bash
pnpm dlx shadcn@2.3.0 add <component>
```

Files land in `src/components/ui/` and stay unmodified — restyle via tokens,
extend via a wrapper in `src/components/primitives/`.
