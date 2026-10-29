import type { Metadata } from 'next'
import { tokensPage } from '@/content/tokens'
import { cn } from '@/lib/utils'

/**
 * Token specimen. The Phase 1 acceptance surface.
 *
 * Set `data-theme="inverse"` or `data-font="didone"` on <html> in devtools and
 * this whole page restyles with no layout break and no font loading. If it
 * does not, a token is missing or something below hardcoded a value.
 *
 * Not linked from anywhere. It is a working reference for the team, and it is
 * the thing to check first when a colour looks wrong somewhere else.
 */

export const metadata: Metadata = {
  title: 'Token specimen — vaapsi',
  robots: { index: false, follow: false },
}

const COLOR_SLOTS = [
  { token: 'background', label: '--background', className: 'bg-background' },
  { token: 'surface', label: '--surface', className: 'bg-surface' },
  { token: 'surface-raised', label: '--surface-raised', className: 'bg-surface-raised' },
  { token: 'ink', label: '--ink', className: 'bg-ink' },
  { token: 'ink-muted', label: '--ink-muted', className: 'bg-ink-muted' },
  { token: 'ink-subtle', label: '--ink-subtle', className: 'bg-ink-subtle' },
  { token: 'line', label: '--line', className: 'bg-line' },
  { token: 'line-strong', label: '--line-strong', className: 'bg-line-strong' },
] as const

const TYPE_STEPS = [
  { className: 'text-6xl', label: '6xl' },
  { className: 'text-5xl', label: '5xl' },
  { className: 'text-4xl', label: '4xl' },
  { className: 'text-3xl', label: '3xl' },
  { className: 'text-2xl', label: '2xl' },
  { className: 'text-xl', label: 'xl' },
  { className: 'text-lg', label: 'lg' },
  { className: 'text-base', label: 'base' },
  { className: 'text-sm', label: 'sm' },
  { className: 'text-xs', label: 'xs' },
] as const

const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const

const RADIUS_STEPS = [
  { className: 'rounded-none', label: 'none' },
  { className: 'rounded-xs', label: 'xs' },
  { className: 'rounded-sm', label: 'sm' },
  { className: 'rounded-md', label: 'md' },
  { className: 'rounded-lg', label: 'lg' },
  { className: 'rounded-xl', label: 'xl' },
  { className: 'rounded-full', label: 'full' },
] as const

const DURATIONS = [
  { className: 'duration-instant', label: 'instant · 80ms' },
  { className: 'duration-fast', label: 'fast · 160ms' },
  { className: 'duration-base', label: 'base · 260ms' },
  { className: 'duration-slow', label: 'slow · 420ms' },
  { className: 'duration-slower', label: 'slower · 640ms' },
] as const

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-caps text-ink-subtle">{children}</p>
}

function Section({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-line py-12">
      <div className="mb-8 max-w-measure">
        <h2 className="text-2xl">{title}</h2>
        {note !== undefined && <p className="mt-2 text-sm text-ink-muted">{note}</p>}
      </div>
      {children}
    </section>
  )
}

export default function TokenSpecimenPage() {
  const { sections } = tokensPage

  return (
    <main className="mx-auto max-w-container px-gutter py-16">
      <header className="max-w-measure pb-12">
        <Eyebrow>Vaapsi</Eyebrow>
        <h1 className="mt-4 text-4xl">{tokensPage.title}</h1>
        <p className="mt-4 text-base text-ink-muted">{tokensPage.intro}</p>
      </header>

      {/* ---------------------------------------------------------- colour */}
      <Section title={sections.colour} note={sections.colourNote}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {COLOR_SLOTS.map((slot) => (
            <div key={slot.token}>
              <div
                className={cn('aspect-[4/3] w-full border border-line', slot.className)}
                aria-hidden
              />
              <p className="mt-3 text-sm text-ink">{slot.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <div className="flex flex-wrap items-stretch gap-4">
            <div className="flex min-h-24 flex-1 basis-64 flex-col justify-between bg-accent p-5 text-accent-ink">
              <p className="text-xs uppercase tracking-caps">--accent</p>
              <p className="text-lg">The dot over the i</p>
            </div>
            <p className="max-w-measure-narrow flex-1 basis-64 text-sm text-ink-muted">
              {sections.accentNote}
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ type */}
      <Section title={sections.type} note={sections.typeNote}>
        <div className="space-y-6">
          {TYPE_STEPS.map((step) => (
            <div key={step.label} className="flex items-baseline gap-6">
              <span className="w-12 shrink-0 text-xs tabular-nums text-ink-subtle">
                {step.label}
              </span>
              <span className={cn('truncate font-display', step.className)}>
                {tokensPage.pangram}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
          <div>
            <Eyebrow>{sections.specimen} · display</Eyebrow>
            <p className="mt-4 font-display text-3xl">{tokensPage.pangram}</p>
          </div>
          <div>
            <Eyebrow>{sections.specimen} · body</Eyebrow>
            <p className="mt-4 max-w-measure font-body text-base text-ink-muted">
              {tokensPage.paragraph}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-10">
          <Eyebrow>{sections.weights}</Eyebrow>
          <div className="mt-4 space-y-3">
            <p className="font-body text-xl font-regular">--weight-body · body copy at rest</p>
            <p className="font-body text-xl font-emphasis">
              --weight-emphasis · a price, a name, a state
            </p>
            <p className="font-display text-xl font-heading">--weight-display · headings</p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- space */}
      <Section title={sections.space} note={sections.spaceNote}>
        <div className="space-y-2">
          {SPACE_STEPS.map((step) => (
            <div key={step} className="flex items-center gap-4">
              <span className="w-12 shrink-0 text-xs tabular-nums text-ink-subtle">{step}</span>
              <div className="h-2 bg-ink" style={{ width: `var(--space-${step})` }} aria-hidden />
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- radius */}
      <Section title={sections.radius} note={sections.radiusNote}>
        <div className="flex flex-wrap gap-6">
          {RADIUS_STEPS.map((step) => (
            <div key={step.label}>
              <div
                className={cn('size-16 border border-line-strong bg-surface', step.className)}
                aria-hidden
              />
              <p className="mt-2 text-xs text-ink-subtle">{step.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- motion */}
      <Section title={sections.motion} note={sections.motionNote}>
        <div className="space-y-3">
          {DURATIONS.map((duration) => (
            <div key={duration.label} className="group flex items-center gap-6">
              <span className="w-32 shrink-0 text-xs text-ink-subtle">{duration.label}</span>
              <div className="relative h-8 flex-1 border border-line bg-surface">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 w-8 bg-accent transition-transform group-hover:translate-x-[calc(100%*7)]',
                    duration.className,
                  )}
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- elevation */}
      <Section title={sections.elevation} note={sections.elevationNote}>
        <div className="flex flex-wrap gap-8 bg-surface p-10">
          <div className="size-40 border border-line bg-surface-raised p-4 text-sm shadow-none">
            none
          </div>
          <div className="size-40 bg-surface-raised p-4 text-sm shadow-overlay">overlay</div>
          <div className="size-40 bg-surface-raised p-4 text-sm shadow-sheet">sheet</div>
        </div>
      </Section>
    </main>
  )
}
