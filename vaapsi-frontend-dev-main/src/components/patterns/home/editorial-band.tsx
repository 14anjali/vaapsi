import Image from 'next/image'
import { Reveal } from '../reveal'
import { Container } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * The breathing room in the page. One full-bleed image, one statement.
 *
 * No call to action, no product, no link. Every other section on this page is
 * asking for something; this one is not, and that is its job. A page that sells
 * continuously reads as a page that is nervous.
 *
 * The statement sits on the image rather than beside it, which is the one place
 * on the site where text goes over photography — so the overlay is a flat scrim
 * at low opacity rather than a gradient, and the crop is chosen to be quiet
 * behind text.
 */
export function EditorialBand() {
  return (
    <Reveal as="section" className="py-section-tight">
      <section className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden tablet:aspect-[16/9] desktop:aspect-[24/9]">
          <Image
            src="https://picsum.photos/seed/vaapsi-editorial-band/2400/1200"
            alt={home.editorial.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Flat scrim, not a gradient. This direction does not use gradients. */}
          <div className="absolute inset-0 bg-ink/30" aria-hidden />

          <div className="absolute inset-0 flex items-end">
            <Container>
              {/*
                Sits low in the frame. The statement is the only thing here now
                — the place line went, because a strapline needs no byline —
                and with nothing under it the type can drop nearer the edge
                than a stacked block safely could.
              */}
              <Type
                as="p"
                family="display"
                size="2xl"
                weight="heading"
                tone="inherit"
                measure="narrow"
                className="pb-6 text-background desktop:pb-8 desktop:text-3xl"
              >
                {home.editorial.statement}
              </Type>
            </Container>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
