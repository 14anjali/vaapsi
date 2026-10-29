import type { ProductImage } from '@/lib/types'

/**
 * Gallery order.
 *
 * **The authored order wins.** `Product.images` is documented as ordered in the
 * data contract, and the fixtures now carry a deliberate six-frame sequence —
 * garment alone, worn front, worn close-up, construction crop, worn back, label
 * macro, with flaw frames inserted where a shopper is already looking closely.
 *
 * This used to re-sort by `kind`, which quietly destroyed that: sorting groups
 * both full-length model shots together, so the back view landed immediately
 * after the front and the construction details moved to the end. The sequence a
 * stylist composed is information, and the front end should not second-guess it.
 *
 * The one thing enforced here is that the `primary` frame leads. It is the card
 * image and the Open Graph image, and a gallery opening on a hardware macro
 * because someone added an image at the top of the array is a bug worth
 * preventing cheaply.
 *
 * Lives here rather than beside the Gallery component because Gallery is a
 * client component, and a plain function exported from a `'use client'` module
 * arrives in a server component as a client *reference*, not as the function.
 */
export function orderGalleryImages(images: readonly ProductImage[]): readonly ProductImage[] {
  const primaryIndex = images.findIndex((image) => image.kind === 'primary')
  if (primaryIndex <= 0) return images
  const primary = images[primaryIndex]
  if (primary === undefined) return images
  return [primary, ...images.filter((_, index) => index !== primaryIndex)]
}
