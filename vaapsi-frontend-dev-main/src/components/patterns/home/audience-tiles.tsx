import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Grid } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { PHOTO_QUALITY } from '@/lib/image'

/**
 * Womenswear and menswear, as two halves.
 *
 * ## Where this sits, and why
 *
 * Between "Just arrived" and "By category", which is the order a shopper
 * actually decides in: what is new → who is it for → what kind of thing. The
 * page now makes three separate claims in three separate sections instead of
 * jumping from a rail of individual garments straight to a grid of garment
 * types, which asked someone to narrow by category before they had narrowed by
 * half the catalogue.
 *
 * ## Two tiles, photographs, no third option
 *
 * Equal halves, because neither is the default. There is no unisex tile — a
 * straight-cut garment appears in *both* listings rather than in a third one,
 * which is what the note under the heading says out loud. See the long note on
 * `home.audience` for why the section is not called "gender".
 *
 * ## The treatment is the hero tiles', deliberately
 *
 * Full-bleed photograph, bottom-weighted scrim, display-size title over it —
 * the same language as `HeroTiles` rather than the label-under-image treatment
 * of `CategoryGrid`. That is a statement about rank: this is a top-level way
 * into the catalogue, and it should carry the same weight as the front door,
 * while the category grid below reads as the finer-grained menu it is.
 *
 * The scrim is the same non-negotiable it is on the hero: white type over an
 * uncontrolled photograph is a contrast bug waiting to happen, and these frames
 * are editorial rather than graded for text.
 *
 * ## Portrait, not landscape
 *
 * 4:5 on mobile, 3:4 from tablet up. Both frames are full-length worn shots and
 * a landscape crop of a standing figure keeps the midsection and throws away
 * the garment. The category tiles below can be landscape precisely because
 * their frames were chosen to survive it.
 */
export function AudienceTiles() {
  return (
    <Reveal>
      <Section eyebrow={home.audience.eyebrow} heading={home.audience.title}>
        <Grid gap="default" as="ul">
          {home.audience.items.map((item) => (
            <Col key={item.href} mobile={4} tablet={4} desktop={6} as="li">
              <Link
                href={item.href}
                className="group/aud relative isolate block aspect-[4/5] overflow-hidden focus-visible:outline-offset-4 tablet:aspect-[3/4]"
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
                  quality={PHOTO_QUALITY}
                  className="ease object-cover transition-transform duration-slow group-hover/aud:scale-[1.03]"
                />

                {/* See the note on the scrim. Bottom-weighted, not a flat wash. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 tablet:p-8">
                  <Type
                    as="h3"
                    family="display"
                    size="3xl"
                    weight="heading"
                    tone="inherit"
                    className="text-white"
                  >
                    {item.label}
                  </Type>
                  <Type as="p" size="sm" tone="inherit" className="mt-1 text-white/80">
                    {item.note}
                  </Type>
                </div>
              </Link>
            </Col>
          ))}
        </Grid>

        {/*
          Under the tiles rather than in the section lede, because it explains
          the *result* of clicking one — a shopper reads it when they are
          deciding, not when they are skimming the heading.
        */}
        <Type size="xs" tone="subtle" className="pt-3">
          {home.audience.note}
        </Type>
      </Section>
    </Reveal>
  )
}
