import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Grid, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { PHOTO_QUALITY } from '@/lib/image'

/**
 * Shop by category.
 *
 * ## The layout, and why it is two rows and not one grid
 *
 * There are five categories, which is an awkward number. A uniform three-up grid
 * leaves a hole in the second row; a uniform two-up leaves one at the end. Both
 * read as a page that ran out rather than a page that decided.
 *
 * So: two cells on the first row, three on the second. Twelve columns split as
 * 6 + 6 and 4 + 4 + 4, which fills both rows exactly. Every cell in a row is the
 * same size as its neighbours and every cell shares the same crop, so nothing
 * looks accidental — but the rows differ in scale, which keeps this from
 * reading as a menu where every option is equally unchosen.
 *
 * The previous version put one tall cell beside two short ones. It made the
 * editorial point but the heights never resolved against each other, and the
 * leftover space around the tall cell was the first thing you saw.
 *
 * ## The crop
 *
 * One aspect ratio for every cell, so the grid stays a grid at any width. 4:3 —
 * landscape rather than portrait, because five portrait cells is most of a
 * viewport for what is functionally five links.
 *
 * The photography is real garment photography now rather than `picsum`
 * landscapes, and the frames were chosen for this crop specifically: a
 * flat-laid jacket, a shoulder bag and a construction close-up all survive
 * being cut to 4:3, where a standing full-length shot loses the garment and
 * keeps a midsection. `home.categories` records which frame and why.
 *
 * The images are decorative — `alt=""` and `aria-hidden`. The link already
 * announces "Jackets, truckers and chore coats"; describing the photograph on
 * top of that reads the same tile to a screen reader twice.
 *
 * No hover transform on the images. It was there and it was cut in the Phase 7
 * audit: a 2% scale on a photograph carries no information, and it made these
 * tiles the only images on the site that move on hover — where the product card
 * cross-fades to a detail shot, which actually tells you something.
 */

/**
 * Desktop column span per cell, index-matched to `home.categories.items`.
 * Sums to 12 on each row, which is what keeps the rows flush.
 */
const SPANS = [6, 6, 4, 4, 4] as const

export function CategoryGrid() {
  return (
    <Reveal>
      <Section eyebrow={home.categories.eyebrow} heading={home.categories.title}>
        <Grid gap="default" rowGap="default" as="ul">
          {home.categories.items.map((item, index) => {
            const desktop = SPANS[index] ?? 4
            return (
              <Col key={item.href} mobile={4} tablet={4} desktop={desktop} as="li">
                <Link href={item.href} className="group/cat block focus-visible:outline-offset-4">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                    <Image
                      src={item.image}
                      alt=""
                      aria-hidden
                      fill
                      sizes={
                        desktop === 6
                          ? '(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw'
                          : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                      }
                      quality={PHOTO_QUALITY}
                      className="object-cover"
                    />
                  </div>
                  <Stack gap={0} className="pt-2">
                    <Type
                      as="h3"
                      family="display"
                      size={desktop === 6 ? 'lg' : 'base'}
                      weight="heading"
                    >
                      {item.label}
                    </Type>
                    {'note' in item && item.note !== undefined && (
                      <Type size="sm" tone="subtle">
                        {item.note}
                      </Type>
                    )}
                  </Stack>
                </Link>
              </Col>
            )
          })}
        </Grid>
      </Section>
    </Reveal>
  )
}
