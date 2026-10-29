import type { ProductColor } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * A colour, as a dot plus its name.
 *
 * **The name is never omitted.** A swatch alone fails for anyone who cannot
 * distinguish the two mid-blues in a denim palette — which is a large share of
 * people on a site selling almost nothing but blue — and `hex` is an
 * approximation of a wash anyway (see `ProductColor`). The dot is a fast visual
 * index; the word is the actual information.
 *
 * The ring is a hairline in the site's line colour rather than a border in the
 * swatch's own colour, so a pale ecru dot on a pale ground still has an edge.
 */
export function ColorSwatch({
  color,
  size = 'default',
  className,
}: {
  color: ProductColor
  /** `default` on a card, `large` in the product-page picker. */
  size?: 'default' | 'large'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 rounded-full ring-1 ring-inset ring-line-strong',
        size === 'large' ? 'h-6 w-6' : 'h-3 w-3',
        className,
      )}
      style={{ backgroundColor: color.hex }}
    />
  )
}
