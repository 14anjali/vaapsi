'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { states } from '@/content/states'

/**
 * Route error boundary.
 *
 * The copy says what happened and what to do next. It does not apologise, does
 * not say "oops", and does not blame the shopper. Nobody has ever felt better
 * about a failed page because it was sorry.
 *
 * The technical detail is shown in development only. In production it is a
 * string a shopper cannot act on, and `digest` is the thing support actually
 * needs — so that is what gets surfaced instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Replace with the real reporter when one exists. Left as console.error
    // rather than silently swallowed — an error boundary that loses the error is
    // worse than no boundary.
    console.error(error)
  }, [error])

  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Eyebrow>{states.error.eyebrow}</Eyebrow>
        <Type as="h1" family="display" size="3xl" weight="heading">
          {states.error.title}
        </Type>
        <Type size="lg" tone="muted">
          {states.error.body}
        </Type>

        <Row gap={4} className="mt-6">
          <button
            type="button"
            onClick={reset}
            className="bg-ink px-6 py-3 text-sm text-background transition-colors hover:bg-ink-muted"
          >
            {states.error.retry}
          </button>
          <Link
            href="/"
            className="border border-line-strong px-6 py-3 text-sm transition-colors hover:border-ink"
          >
            {states.error.home}
          </Link>
        </Row>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-12 border-t border-line pt-6">
            <summary className="cursor-pointer text-xs uppercase tracking-caps text-ink-subtle">
              {states.error.detail}
            </summary>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-ink-muted">
              {error.message}
              {error.stack !== undefined && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {error.digest !== undefined && (
          <Type size="xs" tone="subtle" numeric className="mt-4">
            Reference {error.digest}
          </Type>
        )}
      </Stack>
    </Container>
  )
}
