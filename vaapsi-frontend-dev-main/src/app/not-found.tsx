import Link from 'next/link'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { states } from '@/content/states'

/**
 * 404.
 *
 * The body copy does real work: on a one-of-one marketplace, a dead link is
 * often a garment that sold rather than a typo. Saying so is more useful than
 * "page not found", and it quietly reinforces that stock here is singular.
 */
export default function NotFound() {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Eyebrow>{states.notFound.eyebrow}</Eyebrow>
        <Type as="h1" family="display" size="3xl" weight="heading">
          {states.notFound.title}
        </Type>
        <Type size="lg" tone="muted">
          {states.notFound.body}
        </Type>

        <Row gap={4} className="mt-6">
          <Link
            href="/shop"
            className="bg-ink px-6 py-3 text-sm text-background transition-colors hover:bg-ink-muted"
          >
            {states.notFound.shop}
          </Link>
          <Link
            href="/"
            className="border border-line-strong px-6 py-3 text-sm transition-colors hover:border-ink"
          >
            {states.notFound.home}
          </Link>
        </Row>
      </Stack>
    </Container>
  )
}
