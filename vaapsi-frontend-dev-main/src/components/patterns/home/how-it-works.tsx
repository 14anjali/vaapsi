import { Reveal } from '../reveal'
import { Col, Grid, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * How the passport works. Four steps.
 *
 * **This is the only numbered thing on the site.** Numbers here are earned:
 * declared → inspected → verified → relisted is genuinely a sequence, and the
 * order carries meaning. Numbering a set of feature tiles implies an order that
 * does not exist and makes a reader look for one.
 *
 * The verbs are lifted straight out of the data model. A shopper who reads this
 * and then opens a passport sees the same four words in the same order, which is
 * the difference between an explainer and a marketing panel.
 *
 * Two-up on mobile rather than a four-step stack — four full-width steps is most
 * of a screen for something that is scaffolding, not the main event.
 */
export function HowItWorks() {
  return (
    <Reveal>
      <Section
        tone="surface"
        eyebrow={home.howItWorks.eyebrow}
        heading={home.howItWorks.title}
        headingSize="3xl"
        lede={home.howItWorks.lede}
      >
        <Grid gap="loose" rowGap="default" as="ol">
          {home.howItWorks.steps.map((step, index) => (
            <Col key={step.verb} mobile={2} tablet={4} desktop={3} as="li">
              <Stack gap={2}>
                {/*
                  The marker is a hairline rule with the number over it, not a
                  filled circle. A numbered badge on a near-monochrome page is
                  the loudest thing on the screen, and step three is not the most
                  important element here.
                */}
                <div className="border-t border-line-strong pt-3">
                  <Type size="xs" tone="subtle" numeric tracking="caps">
                    {String(index + 1).padStart(2, '0')}
                  </Type>
                </div>
                <Type as="h3" family="display" size="lg" weight="heading">
                  {step.verb}
                </Type>
                <Type size="sm" tone="muted">
                  {step.body}
                </Type>
              </Stack>
            </Col>
          ))}
        </Grid>
      </Section>
    </Reveal>
  )
}
