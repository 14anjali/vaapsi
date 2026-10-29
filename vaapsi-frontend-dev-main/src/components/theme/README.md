# components/theme/

The theme system. Two axes, two attributes on `<html>`, nothing else.

| File                 | Does                                                           |
| -------------------- | -------------------------------------------------------------- |
| `presets.ts`         | The registry — which colour and font presets exist             |
| `fonts.ts`           | All seven families, loaded at build time by `next/font/google` |
| `encode.ts`          | Config to and from the shareable `?t=` token                   |
| `theme-provider.tsx` | Holds the config, writes `data-theme` and `data-font`          |

Everything a preset changes is declared in `src/styles/tokens.css`. Adding a
colour preset is a `[data-theme="name"]` block of about twelve lines plus an
entry in `presets.ts`. No component changes, ever.

Fonts are never loaded at runtime — all seven are already in the document, so
switching a preset only reassigns `--font-display` and `--font-body`. That is
what makes preset switching instant and flash-free. When a direction is signed
off, delete the unused families from `fonts.ts`.
