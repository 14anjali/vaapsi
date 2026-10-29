import { cn } from '@/lib/utils'

/**
 * Container, Grid, Stack, Row.
 *
 * Four components, and between them they should account for essentially all
 * layout on the site. Spacing comes only from the scale — there is no prop that
 * takes an arbitrary value, because the moment one exists, half the site is
 * spaced on 13px.
 */

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export type ContainerProps = {
  /**
   * `default` — the reading and product measure. Most pages.
   * `wide` — full-bleed image grids and editorial bands. Gutters only.
   */
  variant?: 'default' | 'wide'
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav' | 'article'
  className?: string
  children?: React.ReactNode
}

export function Container({
  variant = 'default',
  as: Component = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-gutter',
        variant === 'default' && 'max-w-container',
        className,
      )}
    >
      {children}
    </Component>
  )
}

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

/**
 * The site grid: 4 columns on mobile, 8 on tablet, 12 on desktop.
 *
 * Everything aligns to this. Column spans are given per breakpoint and are
 * relative to that breakpoint's column count, which is why `Col` takes three
 * numbers rather than one — a component spanning 6 of 12 on desktop is usually
 * 4 of 8 on tablet and all 4 on mobile, and those are three different decisions.
 */

export const GRID_COLUMNS = { mobile: 4, tablet: 8, desktop: 12 } as const

export type GridGap = 'none' | 'tight' | 'default' | 'loose'

const GRID_GAP: Record<GridGap, string> = {
  none: 'gap-0',
  tight: 'gap-2',
  default: 'gap-4 desktop:gap-6',
  loose: 'gap-6 desktop:gap-10',
}

// Spelled out rather than derived from GRID_GAP by string replacement:
// Tailwind's scanner reads source text, so a class name assembled at runtime
// produces no CSS at all.
const GRID_ROW_GAP: Record<GridGap, string> = {
  none: 'gap-y-0',
  tight: 'gap-y-2',
  default: 'gap-y-4 desktop:gap-y-6',
  loose: 'gap-y-6 desktop:gap-y-10',
}

export type GridProps = {
  gap?: GridGap
  /** Row gap independent of column gap. Grids of cards usually want more. */
  rowGap?: GridGap
  as?: 'div' | 'section' | 'ul' | 'ol'
  className?: string
  children?: React.ReactNode
}

export function Grid({
  gap = 'default',
  rowGap,
  as: Component = 'div',
  className,
  children,
}: GridProps) {
  return (
    <Component
      className={cn(
        'grid grid-cols-4 tablet:grid-cols-8 desktop:grid-cols-12',
        GRID_GAP[gap],
        rowGap !== undefined && GRID_ROW_GAP[rowGap],
        className,
      )}
    >
      {children}
    </Component>
  )
}

/** 1–4 on mobile, 1–8 on tablet, 1–12 on desktop. */
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

// Written out rather than interpolated: Tailwind's scanner reads source text,
// so `col-span-${n}` produces no CSS at all.
const MOBILE_SPAN: Record<1 | 2 | 3 | 4, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
}

const TABLET_SPAN: Record<ColSpan, string> = {
  1: 'tablet:col-span-1',
  2: 'tablet:col-span-2',
  3: 'tablet:col-span-3',
  4: 'tablet:col-span-4',
  5: 'tablet:col-span-5',
  6: 'tablet:col-span-6',
  7: 'tablet:col-span-7',
  8: 'tablet:col-span-8',
  9: 'tablet:col-span-8',
  10: 'tablet:col-span-8',
  11: 'tablet:col-span-8',
  12: 'tablet:col-span-8',
}

const DESKTOP_SPAN: Record<ColSpan, string> = {
  1: 'desktop:col-span-1',
  2: 'desktop:col-span-2',
  3: 'desktop:col-span-3',
  4: 'desktop:col-span-4',
  5: 'desktop:col-span-5',
  6: 'desktop:col-span-6',
  7: 'desktop:col-span-7',
  8: 'desktop:col-span-8',
  9: 'desktop:col-span-9',
  10: 'desktop:col-span-10',
  11: 'desktop:col-span-11',
  12: 'desktop:col-span-12',
}

const DESKTOP_START: Partial<Record<ColSpan, string>> = {
  1: 'desktop:col-start-1',
  2: 'desktop:col-start-2',
  3: 'desktop:col-start-3',
  4: 'desktop:col-start-4',
  5: 'desktop:col-start-5',
  6: 'desktop:col-start-6',
  7: 'desktop:col-start-7',
  8: 'desktop:col-start-8',
  9: 'desktop:col-start-9',
  10: 'desktop:col-start-10',
  11: 'desktop:col-start-11',
  12: 'desktop:col-start-12',
}

export type ColProps = {
  mobile?: 1 | 2 | 3 | 4
  tablet?: ColSpan
  desktop?: ColSpan
  /** Offset on desktop only. Mobile and tablet never indent. */
  startDesktop?: ColSpan
  as?: 'div' | 'li' | 'article' | 'section' | 'aside'
  className?: string
  children?: React.ReactNode
}

export function Col({
  mobile = 4,
  tablet,
  desktop,
  startDesktop,
  as: Component = 'div',
  className,
  children,
}: ColProps) {
  return (
    <Component
      className={cn(
        MOBILE_SPAN[mobile],
        tablet !== undefined && TABLET_SPAN[tablet],
        desktop !== undefined && DESKTOP_SPAN[desktop],
        startDesktop !== undefined && DESKTOP_START[startDesktop],
        className,
      )}
    >
      {children}
    </Component>
  )
}

// ---------------------------------------------------------------------------
// Stack / Row
// ---------------------------------------------------------------------------

export const SPACE_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32] as const
export type SpaceStep = (typeof SPACE_STEPS)[number]

const GAP: Record<SpaceStep, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
  20: 'gap-20',
  24: 'gap-24',
  32: 'gap-32',
}

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

type FlexProps = {
  gap?: SpaceStep
  align?: keyof typeof ALIGN
  justify?: keyof typeof JUSTIFY
  as?: 'div' | 'section' | 'ul' | 'ol' | 'li' | 'header' | 'footer' | 'nav' | 'dl'
  className?: string
  children?: React.ReactNode
}

/** Vertical flow. */
export function Stack({
  gap = 4,
  align,
  justify,
  as: Component = 'div',
  className,
  children,
}: FlexProps) {
  return (
    <Component
      className={cn(
        'flex flex-col',
        GAP[gap],
        align !== undefined && ALIGN[align],
        justify !== undefined && JUSTIFY[justify],
        className,
      )}
    >
      {children}
    </Component>
  )
}

/** Horizontal flow. Wraps by default — a row that cannot wrap is a bug on a phone. */
export function Row({
  gap = 4,
  align = 'center',
  justify,
  wrap = true,
  as: Component = 'div',
  className,
  children,
}: FlexProps & { wrap?: boolean }) {
  return (
    <Component
      className={cn(
        'flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        GAP[gap],
        ALIGN[align],
        justify !== undefined && JUSTIFY[justify],
        className,
      )}
    >
      {children}
    </Component>
  )
}

/** A hairline rule. One weight, one colour, from tokens. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />
}
