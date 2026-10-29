'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Type } from '@/components/primitives/type'
import { productPage } from '@/content/product'
import { PHOTO_QUALITY } from '@/lib/image'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { ProductImage } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The product gallery: one hero frame, with the rest as thumbnails under it.
 *
 * ## What this replaced, and why
 *
 * Every frame used to fill its own viewport height, stacked vertically. It made
 * a beautiful column and a bad product page: seeing the fourth photograph meant
 * scrolling past three full screens, and the buy panel — which is the point of
 * the page — scrolled away with them on anything short of a tall desktop.
 *
 * Hero plus thumbnails puts **every** frame on the first screen. A shopper sees
 * how many pictures exist, picks the one they want, and never scrolls to do it.
 * That is the whole goal: less scroll, same photography.
 *
 * ## Three ways to move, because they suit different hands
 *
 * - **Thumbnails** — direct access. Fastest when you can see the frame you want.
 * - **Arrows** — stepping, for going through everything in order. They sit on the
 *   hero rather than under it, and they wrap, so you can never reach a dead end.
 * - **Swipe** — on touch, the hero is a snap-scrolling track. A phone user
 *   swipes photographs; asking them to aim at a 44px arrow instead would be
 *   worse, so the arrows are desktop-only.
 *
 * Keyboard: the thumbnails are ordinary buttons in a tab order, and left/right
 * arrow keys move the hero when focus is anywhere in the gallery.
 *
 * ## Why the count is written out
 *
 * "2 / 5" under the hero, not a dot rail. Dots were fine when a frame filled the
 * screen and you needed a position indicator; with thumbnails visible the useful
 * information is which of *these* you are on, and a number says that without
 * asking anyone to count dots.
 */
export function Gallery({
  images,
  sold,
  productId,
}: {
  images: readonly ProductImage[]
  sold: boolean
  productId: string
}) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLUListElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const total = images.length
  const active = images[Math.min(index, Math.max(total - 1, 0))]

  /** Wraps, so stepping never dead-ends on the first or last frame. */
  const step = useCallback(
    (delta: number) => {
      if (total === 0) return
      setIndex((current) => (current + delta + total) % total)
    },
    [total],
  )

  /** Show a frame, and bring the touch track along with it. */
  const show = useCallback((next: number) => {
    setIndex(next)
    const track = trackRef.current
    if (track === null) return
    // `scrollTo` with options is absent in jsdom and in some older webviews.
    // Falling back to the property assignment loses the smooth animation and
    // keeps the behaviour, which is the right way round to degrade.
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    } else {
      track.scrollLeft = next * track.clientWidth
    }
  }, [])

  // Left/right anywhere in the gallery. Scoped to the gallery rather than the
  // document, so it cannot hijack arrow keys meant for the page or the picker.
  useEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
    }
    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
  }, [step])

  if (total === 0 || active === undefined) return null

  /**
   * The three frames after the active one, wrapping. See the note on the
   * thumbnail row. Fewer than four frames in total simply yields a shorter row.
   */
  const others = Array.from({ length: Math.min(3, total - 1) }, (_, offset) => {
    const position = (index + offset + 1) % total
    return { image: images[position]!, position }
  })

  /** Touch: which frame is snapped. */
  const onTrackScroll = () => {
    const track = trackRef.current
    if (track === null) return
    const width = track.clientWidth
    if (width === 0) return
    setIndex(Math.round(track.scrollLeft / width))
  }

  return (
    <div ref={rootRef} className="relative">
      {/* ---- Hero.
           Touch gets a snap track of every frame; desktop gets the one active
           frame with arrows. Both are the same aspect box, so switching
           breakpoints does not reflow the column. */}
      <div className="group/gallery relative bg-surface">
        <WishlistButton productId={productId} />

        {/* Touch: swipeable */}
        <ul
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto desktop:hidden"
          aria-label={productPage.gallery.label}
        >
          {images.map((image, position) => (
            <li key={image.id} className="w-full shrink-0 snap-start">
              <Frame image={image} sold={sold} priority={position === 0} />
            </li>
          ))}
        </ul>

        {/* Desktop: one frame, stepped */}
        <div className="hidden desktop:block">
          <Frame image={active} sold={sold} priority />

          <ArrowButton
            direction="previous"
            onClick={() => step(-1)}
            className="left-4"
            disabled={total < 2}
          />
          <ArrowButton
            direction="next"
            onClick={() => step(1)}
            className="right-4"
            disabled={total < 2}
          />
        </div>
      </div>

      {/* ---- Thumbnails and the count.
           Three tiles, and they are the three frames *after* the hero rather
           than the first three of the set. A listing carries four to six frames
           (flaw shots push it up), so a fixed first-three row would show the
           hero back to you in slot one and hide the last frames entirely.

           A rolling window means every tile is always something you are not
           already looking at, clicking one always changes the hero, and the
           arrows are what walk the full set in order — which is why they exist.
           Three, not "as many as fit": the row keeps one shape whether a garment
           has four frames or six. */}
      <div className="px-gutter py-3 desktop:px-6">
        <ul className="grid grid-cols-3 gap-2" aria-label={productPage.gallery.thumbnails}>
          {others.map(({ image, position }) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => show(position)}
                aria-label={productPage.gallery.frame(position + 1, total)}
                className="ease relative block w-full overflow-hidden bg-surface opacity-75 transition-opacity duration-fast hover:opacity-100"
              >
                <span className="relative block aspect-[3/4]">
                  <Image
                    src={image.url}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(min-width: 1024px) 16vw, 30vw"
                    quality={PHOTO_QUALITY}
                    className={cn('object-cover', sold && 'saturate-0')}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-baseline justify-between">
          <Type size="xs" tone="subtle" numeric>
            {productPage.gallery.position(index + 1, total)}
          </Type>
          {/*
            Flaw frames are captioned, and only flaw frames. A caption on a
            styling shot is noise; an unlabelled close-up of a mark leaves a
            shopper guessing whether it is damage or texture.
          */}
          {active.kind === 'flaw' && (
            <Type size="xs" tone="muted" className="text-right">
              {active.alt}
            </Type>
          )}
        </div>

        {/* The frame change is announced, since the hero swap is silent. */}
        <p aria-live="polite" className="sr-only">
          {active.alt}
        </p>
      </div>
    </div>
  )
}

function Frame({
  image,
  sold,
  priority,
}: {
  image: ProductImage
  sold: boolean
  priority: boolean
}) {
  return (
    <div className="relative aspect-[4/5] bg-surface">
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        quality={PHOTO_QUALITY}
        priority={priority}
        className={cn('object-cover', sold && 'saturate-0')}
      />
    </div>
  )
}

/**
 * A stepping arrow, on the photograph.
 *
 * White on a scrim rather than a solid chip: the frames are uncontrolled
 * photography and a plain white glyph disappears against a pale one. The scrim
 * is the smallest thing that guarantees contrast without becoming furniture.
 */
function ArrowButton({
  direction,
  onClick,
  disabled,
  className,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
  disabled: boolean
  className?: string
}) {
  if (disabled) return null
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={productPage.gallery[direction]}
      className={cn(
        'ease absolute top-1/2 z-10 -translate-y-1/2 bg-background/80 p-2.5 text-ink opacity-0 transition-opacity duration-base',
        // Revealed on hover or keyboard focus. Hidden by default because the
        // thumbnails are the primary control and two permanent chevrons over
        // the photography is the kind of chrome this page has avoided
        // everywhere else. Touch never sees these — it swipes.
        'focus-visible:opacity-100 group-hover/gallery:opacity-100',
        'hover:bg-background',
        className,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
    </button>
  )
}

function WishlistButton({ productId }: { productId: string }) {
  const saved = useWishlistStore((state) => state.items.includes(productId))
  const toggle = useWishlistStore((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={saved ? productPage.gallery.saved : productPage.gallery.save}
      className="ease absolute right-4 top-4 z-10 bg-background/80 p-2.5 text-ink transition-colors duration-fast hover:bg-background"
    >
      <Heart className={cn('h-5 w-5', saved && 'fill-current')} strokeWidth={1.5} aria-hidden />
    </button>
  )
}
