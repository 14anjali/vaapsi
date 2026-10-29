import Image from 'next/image'
import Link from 'next/link'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * The front door: three equal tiles, left to right.
 *
 * ## Why three equal thirds
 *
 * Every tile is the same size because none of these is more important than the
 * others — a shopper arrives wanting new stock, wanting the popular things, or
 * wanting to buy second-hand, and the page's job is to not put a thumb on that
 * scale. A hero plus two thumbnails would.
 *
 * They are titles over photographs rather than cards with buttons. The whole
 * tile is the link, so there is no target to aim for, and the photograph is
 * doing the work the old carousel did — saying what this shop sells — without
 * costing a shopper four seconds to find out where to click.
 *
 * ## Legibility over photography
 *
 * White type over an uncontrolled photograph is a contrast bug waiting to
 * happen: the images are editorial, they change, and none of them is graded for
 * text. So every tile carries a bottom-weighted scrim under its type. It is a
 * gradient rather than a flat wash so the top of the image stays untouched, and
 * it is dark enough that the title passes AA against the lightest frame, not
 * just the average one.
 *
 * ## Motion
 *
 * A slow scale on the image on hover, and nothing else. No lift, no shadow, no
 * sliding type. The image moving under a fixed title is the affordance, and it
 * is the same restraint the product card uses.
 */
export function HeroTiles() {
  return (
    <section aria-label={home.heroTiles.label}>
      {/* The page needs an h1 and search needs to know what this page is. The
          tiles are h2s under it. */}
      <h1 className="sr-only">{home.heroTiles.heading}</h1>

      {/*
        One column on mobile, three from tablet up. Not a horizontal scroller at
        small sizes: three stacked tiles is two thumb-flicks and every title is
        readable, where a rail hides two thirds of the choice off-screen.
      */}
      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
        {home.heroTiles.tiles.map((tile, index) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group/tile relative isolate block aspect-[4/5] overflow-hidden focus-visible:outline-offset-4 sm:aspect-[3/4]"
          >
            <Image
              src={tile.image.src}
              alt={tile.image.alt}
              fill
              // Three across from 640px, one across below it.
              sizes="(min-width: 640px) 33vw, 100vw"
              // Only the first is above the fold on every viewport.
              priority={index === 0}
              className="ease object-cover transition-transform duration-slow group-hover/tile:scale-[1.03]"
            />

            {/* See the note on legibility. Bottom-weighted, not a flat wash. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
              <Type
                as="h2"
                family="display"
                size="3xl"
                weight="heading"
                tone="inherit"
                className="text-white"
              >
                {tile.title}
              </Type>
              <Type as="p" size="sm" tone="inherit" className="mt-1 text-white/80">
                {tile.note}
              </Type>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
