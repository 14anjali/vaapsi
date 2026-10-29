import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'

/**
 * Placeholder for a route that exists and is correctly laid out but has not been
 * designed yet.
 *
 * It names the phase that will build it. A scaffolded route that says nothing is
 * indistinguishable from a broken one, and someone will file a bug about it.
 *
 * Every use of this component is deleted by the phase named in it.
 */
export function PageScaffold({
  eyebrow,
  title,
  phase,
  note,
}: {
  eyebrow: string
  title: string
  phase: string
  note?: string
}) {
  return (
    <Container>
      <Stack gap={4} className="py-section">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Type as="h1" family="display" size="4xl" weight="heading">
          {title}
        </Type>
        {note !== undefined && (
          <Type size="lg" tone="muted" measure="default">
            {note}
          </Type>
        )}
        <Type size="sm" tone="subtle" className="mt-8">
          Scaffold only. Built in {phase}.
        </Type>
      </Stack>
    </Container>
  )
}
