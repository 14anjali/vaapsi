import { cn } from '@/lib/utils'

/**
 * The only component in the app permitted to set font styles.
 *
 * Everything typographic goes through here: family, size, weight, tracking,
 * leading, colour. That is a strict rule and it is worth the strictness —
 * without it, `text-2xl font-medium tracking-tight text-ink-muted` gets copied
 * around with small variations until there are eleven near-identical heading
 * treatments and no way to change any of them centrally.
 *
 * Every value is a token. There is no escape hatch by design; if a size is
 * missing from the scale, add it to the scale.
 */

export const TYPE_SIZES = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
] as const
export type TypeSize = (typeof TYPE_SIZES)[number]

export type TypeFamily = 'display' | 'body'
export type TypeWeight = 'regular' | 'emphasis' | 'heading'
export type TypeTone = 'default' | 'muted' | 'subtle' | 'accent' | 'positive' | 'inherit'
export type TypeTracking = 'default' | 'caps' | 'tight'
export type TypeLeading = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed'

/** Elements `Type` is allowed to render. Deliberately narrow. */
export type TypeAs =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'dt'
  | 'dd'
  | 'li'
  | 'figcaption'
  | 'label'
  | 'time'
  | 'strong'
  | 'em'

const SIZE: Record<TypeSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
}

const FAMILY: Record<TypeFamily, string> = {
  display: 'font-display',
  body: 'font-body',
}

const WEIGHT: Record<TypeWeight, string> = {
  regular: 'font-regular',
  emphasis: 'font-emphasis',
  heading: 'font-heading',
}

const TONE: Record<TypeTone, string> = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  subtle: 'text-ink-subtle',
  accent: 'text-accent',
  // Money the shopper keeps, and nothing else. Not a success tone — see the
  // note on --positive in tokens.css.
  positive: 'text-positive',
  inherit: '',
}

const TRACKING: Record<TypeTracking, string> = {
  default: '',
  caps: 'uppercase tracking-caps',
  tight: 'tracking-tight',
}

const LEADING: Record<TypeLeading, string> = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
}

export type TypeProps = {
  as?: TypeAs
  size?: TypeSize
  family?: TypeFamily
  weight?: TypeWeight
  tone?: TypeTone
  tracking?: TypeTracking
  leading?: TypeLeading
  /** Constrain to a readable measure. `narrow` for captions and side panels. */
  measure?: 'none' | 'default' | 'narrow'
  /** Truncate to a single line. */
  truncate?: boolean
  /** Tabular figures — for prices, measurements, counts in a column. */
  numeric?: boolean
  className?: string
  children?: React.ReactNode
  id?: string
  htmlFor?: string
  dateTime?: string
  title?: string
  /**
   * For text derived from the current date.
   *
   * A delivery estimate rendered on the server and re-rendered on hydration
   * disagrees if the two straddle midnight. Both values are correct, so the
   * warning is noise — and the alternatives are a flash of empty space where
   * the date should be, or deferring the most useful fact on a checkout to an
   * effect. Reach for it only for clock-derived text; anything else that
   * mismatches is a real bug being silenced.
   */
  suppressHydrationWarning?: boolean
}

export function Type({
  as: Component = 'p',
  size = 'base',
  family = 'body',
  weight = 'regular',
  tone = 'default',
  tracking = 'default',
  leading,
  measure = 'none',
  truncate = false,
  numeric = false,
  className,
  children,
  ...rest
}: TypeProps) {
  return (
    <Component
      className={cn(
        FAMILY[family],
        SIZE[size],
        WEIGHT[weight],
        TONE[tone],
        TRACKING[tracking],
        leading !== undefined && LEADING[leading],
        measure === 'default' && 'max-w-measure',
        measure === 'narrow' && 'max-w-measure-narrow',
        truncate && 'truncate',
        numeric && 'tabular-nums',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

/**
 * The small uppercase label above a heading. Common enough across the site to
 * earn its own component rather than being three props every time.
 */
export function Eyebrow({
  as = 'p',
  tone = 'subtle',
  className,
  id,
  children,
}: Pick<TypeProps, 'as' | 'tone' | 'className' | 'children' | 'id'>) {
  // `id` is here because an eyebrow is frequently the accessible name of the
  // section it sits in, via aria-labelledby. Without it every such call site
  // has to drop down to a raw `Type`, which is exactly the drift this component
  // exists to prevent.
  return (
    <Type as={as} size="xs" tone={tone} tracking="caps" className={className} id={id}>
      {children}
    </Type>
  )
}
