import { cn } from '@/lib/utils'

/**
 * A chip — one fact, compressed to a label.
 *
 * The workhorse of the density pass. A great deal of what the passport and the
 * condition block were saying in sentences is really a single attribute:
 * *one owner*, *repaired once*, *published by choice*, *verified in house*,
 * *size M*. A sentence costs a line and a chip costs a corner, and a row of
 * chips can be scanned in one pass where four sentences have to be read.
 *
 * Near-square and hairline, from the tokens, so a row of them reads as a data
 * strip rather than as a set of buttons. Nothing here is clickable — if a chip
 * needs to be pressable it is a control, and it should not look like this.
 *
 * `emphasis` is for the one chip in a row that carries the headline fact. Use it
 * sparingly: if two chips are emphasised, neither is.
 */

export type ChipTone = 'default' | 'emphasis' | 'quiet'

const TONE: Record<ChipTone, string> = {
  default: 'border-line text-ink',
  emphasis: 'border-ink text-ink',
  quiet: 'border-line text-ink-subtle',
}

export type ChipProps = {
  tone?: ChipTone
  /** A mark before the label — a provenance dot, a care glyph, the accent dot. */
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Chip({ tone = 'default', icon, className, children }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-1',
        'text-xs leading-none',
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/**
 * A chip whose label is split into a quiet key and a loud value — *Owners 2*,
 * *Size M*. Reads as a data point rather than as a tag.
 */
export function ChipPair({
  label,
  value,
  tone = 'default',
  className,
}: {
  label: string
  value: React.ReactNode
  tone?: ChipTone
  className?: string
}) {
  return (
    <Chip tone={tone} className={className}>
      <span className="uppercase tracking-caps text-ink-subtle">{label}</span>
      <span className="font-emphasis">{value}</span>
    </Chip>
  )
}

/** A row of chips that wraps. Just the spacing, so it is consistent everywhere. */
export function ChipRow({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}
