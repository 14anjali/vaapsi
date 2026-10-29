import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The wordmark.
 *
 * This is the real brand asset, not a typographic approximation — a didone
 * wordmark with the accent dot floating clear above the final letter, well above
 * where a tittle would normally sit. That separation is what makes it read as a
 * mark rather than as punctuation, and it is not something a font substitution
 * would reproduce, which is why this is an image and not live text.
 *
 * ## Why two files per variant
 *
 * The letterforms are black pixels. On the inverse colour preset a black
 * wordmark on a black page is an invisible logo, and the usual fix — a CSS
 * `invert()` filter — would take the red dot with it and turn it cyan. The dot
 * is the one colour in this entire system that must never move.
 *
 * So there is a second file per variant with white letterforms and the same red
 * dot, and CSS picks between them off `data-theme`. Both are in the markup; only
 * one is ever painted. They are a few kilobytes each.
 *
 * ## Sizing and the optical nudge
 *
 * Sized by height, never width. The header, the footer and the mobile drawer all
 * reason in terms of how tall the mark is, and the wordmark and the standalone
 * mark have very different aspect ratios — 2.7:1 against roughly 1:3.5. Width
 * follows from the intrinsic ratio.
 *
 * The image is then pushed down 9%. Centring the bounding box centres the
 * *descender of the p* along with everything else: cap height starts at y=2 of
 * 118 but the baseline is at y=93, so a quarter of the box is empty space at the
 * bottom and the letterforms float visibly high. Centring on cap-to-baseline
 * instead comes to 9.75%; 9% is a hair short of that, leaving the descender a
 * sliver of the weight it does carry.
 */

/** Intrinsic pixel dimensions, so Next can reserve the box and avoid a shift. */
const ASSETS = {
  word: { light: '/brand/wordmark.png', dark: '/brand/wordmark-inverse.png', w: 317, h: 118 },
  mark: { light: '/brand/mark.png', dark: '/brand/mark-inverse.png', w: 26, h: 92 },
} as const

export type LogoProps = {
  /** `word` — the full wordmark. `mark` — the dotted final letter alone. */
  variant?: 'word' | 'mark'
  className?: string
  /** Render as decoration when the surrounding link already has a label. */
  decorative?: boolean
}

export function Logo({ variant = 'word', className, decorative = false }: LogoProps) {
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': 'Vaapsi' } as const)

  const asset = ASSETS[variant]

  return (
    <span
      {...a11y}
      className={cn(
        'inline-flex select-none items-center',
        // The wordmark is small and wide; the mark is small and tall. Both are
        // set from the same visual weight in the header rather than the same
        // number.
        variant === 'word' ? 'h-5 desktop:h-6' : 'h-5',
        className,
      )}
    >
      <LogoImage src={asset.light} asset={asset} className="[[data-theme='inverse']_&]:hidden" />
      <LogoImage
        src={asset.dark}
        asset={asset}
        className="hidden [[data-theme='inverse']_&]:block"
      />
    </span>
  )
}

function LogoImage({
  src,
  asset,
  className,
}: {
  src: string
  asset: (typeof ASSETS)[keyof typeof ASSETS]
  className?: string
}) {
  return (
    <Image
      src={src}
      alt=""
      width={asset.w}
      height={asset.h}
      // Every appearance is above the fold in a persistent header, so there is
      // nothing for lazy loading to defer.
      priority
      unoptimized
      className={cn('h-full w-auto translate-y-[9%]', className)}
    />
  )
}

/**
 * The accent dot on its own, at text scale.
 *
 * Reused as the active-nav marker, the passport indicator on a product card, the
 * cart badge and the loading indicator. Same shape, same colour, five jobs —
 * which is the brand logic showing up in the interface rather than being
 * described in a deck. Drawn rather than cropped from the asset, because at
 * 4–6px a scaled raster is mush.
 */
export function Dot({
  size = 'default',
  className,
}: {
  size?: 'small' | 'default'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 rounded-full bg-accent',
        size === 'small' ? 'size-1' : 'size-1.5',
        className,
      )}
    />
  )
}
