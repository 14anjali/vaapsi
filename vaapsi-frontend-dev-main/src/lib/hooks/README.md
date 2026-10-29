# lib/hooks/

Shared React hooks. Client-only by definition, so every file here starts with
`'use client'`.

`use-reduced-motion` is the single source of truth for whether the app animates.
Every animated component uses it — not `window.matchMedia` inline, not Framer
Motion's own hook. One answer, one place to check.
