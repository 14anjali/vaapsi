import { JourneyLine } from './journey-line'
import { Seal } from './seal'
import { Stat, StatGroup, attributionFrom } from '../data/stat'
import { Chip, ChipPair, ChipRow } from '@/components/primitives/chip'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { passportCopy } from '@/content/passport'
import { repairCount, returnCount } from '@/lib/format/passport'
import type { AuthenticationMethod, Passport } from '@/lib/types'

/**
 * The passport, story side.
 *
 * ## What this used to be
 *
 * Journey, then a three-column block of origin / materials / care, then impact —
 * with materials and care also rendered inside the Product details drawer, and
 * the impact methodology set as a four-line paragraph. Three facts printed
 * twice, and a page that took four scrolls to say "one owner, inspected, here is
 * what it saves".
 *
 * ## What it is now
 *
 * **A summary strip, the journey, and the impact.** Nothing else.
 *
 * - **Composition, care and origin moved to the drawer.** They are specification
 *   — reference material a shopper consults — and they were the duplicated
 *   fields. One home each, and the drawer is the right one.
 * - **The summary strip is chips.** Owners, repairs, returns, how it was
 *   authenticated, whether the passport is voluntary. Five facts that were
 *   sentences scattered through three sections, now one scannable line that lets
 *   a reader skip the timeline entirely if they want the gist.
 * - **Impact keeps its source but not its paragraph.** The study and year stay
 *   on the face of it; the full methodology is one click away. The rule holds —
 *   no number without a stated source — but the proportion is fixed.
 */

const AUTH_LABEL: Record<AuthenticationMethod, string> = {
  in_house_inspection: 'Inspected in house',
  brand_partner: 'Brand verified',
  third_party_authenticator: 'Third-party verified',
  none: 'Not authenticated',
}

export function PassportStory({
  passport,
  showImpact = true,
}: {
  passport: Passport
  /**
   * Render the impact figures inline. The product drawer gives them their own
   * tab, because they answer a different question from the journey and a shopper
   * who wants the number should not have to read a timeline to reach it. The
   * standalone passport route keeps them inline so it prints complete.
   */
  showImpact?: boolean
}) {
  const repairs = repairCount(passport)
  const returns = returnCount(passport)
  const authenticated = passport.authentication.method !== 'none'

  return (
    <Stack gap={8}>
      {/*
        The summary strip. Everything a reader needs to form a judgement before
        deciding whether to read the timeline.
      */}
      <Row gap={4} justify="between" align="start">
        <ChipRow>
          <ChipPair
            label="Owners"
            value={passport.ownersCount}
            tone={passport.ownersCount === 1 ? 'emphasis' : 'default'}
          />
          {repairs > 0 && <ChipPair label="Repairs" value={repairs} />}
          {/*
            "Returns", not "Came back" — the timeline already uses "Came back"
            as the label for a `returned` event, and the same phrase meaning two
            different things on one page is a collision a reader has to resolve.
            In a row of counts beside Owners and Repairs, "Returns" is
            unambiguous.
          */}
          {returns > 0 && <ChipPair label="Returns" value={returns} />}
          <Chip tone={authenticated ? 'default' : 'quiet'}>
            {AUTH_LABEL[passport.authentication.method]}
          </Chip>
          <Chip tone="quiet">
            {passport.isVoluntary ? 'Published by choice' : 'Issued under EU regulation'}
          </Chip>
        </ChipRow>

        {passport.authentication.verifiedBy !== null && (
          <Seal
            label={passport.authentication.verifiedBy}
            className="hidden shrink-0 tablet:inline-flex"
          />
        )}
      </Row>

      {/* ---- Journey. The most space, deliberately. */}
      <section aria-labelledby="passport-journey">
        <Stack gap={4}>
          <Row gap={4} justify="between" align="baseline">
            <Eyebrow as="h3">{passportCopy.sections.journey}</Eyebrow>
            <Type as="p" id="passport-journey" size="sm" tone="muted">
              {passport.ownersCount === 1
                ? 'One owner before you'
                : `${passport.ownersCount} owners before you`}
            </Type>
          </Row>
          <JourneyLine chain={passport.chain} />
        </Stack>
      </section>

      {/* ---- Impact. Never a floating number, but no longer a paragraph either. */}
      {showImpact && passport.impact !== undefined && (
        <section aria-labelledby="passport-impact" className="border-t border-line pt-6">
          <Eyebrow as="h3" id="passport-impact">
            {passportCopy.sections.impact}
          </Eyebrow>
          <StatGroup
            className="pt-4"
            basis={passport.impact.basis}
            {...(attributionFrom(passport.impact.basis) !== undefined
              ? { attribution: attributionFrom(passport.impact.basis) }
              : {})}
          >
            <Stat
              value={passport.impact.waterLitresSaved.toLocaleString('en-IN')}
              unit="litres of water"
            />
            <Stat value={String(passport.impact.co2KgSaved)} unit="kg of CO₂e" />
          </StatGroup>
        </section>
      )}
    </Stack>
  )
}
