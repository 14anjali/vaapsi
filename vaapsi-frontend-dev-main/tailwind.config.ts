import plugin from 'tailwindcss/plugin'
import type { Config } from 'tailwindcss'

/**
 * Every value here resolves to a CSS custom property defined in
 * src/styles/tokens.css. Nothing in this file is a literal.
 *
 * That is the whole trick: `bg-background`, `text-ink`, `border-line` and
 * `font-display` are stable class names whose meaning is decided at runtime by
 * whichever preset is on <html>. Components never learn what colour they are.
 */

/** Wrap a bare HSL triplet token so Tailwind's opacity modifiers still work. */
const hsl = (token: string) => `hsl(var(--${token}) / <alpha-value>)`

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    /**
     * Breakpoints, named for the device class they describe.
     *
     * mobile 375–767 · tablet 768–1023 · desktop 1024–1439 · wide 1440+
     *
     * Mobile is the unprefixed base — this is a mobile-first system, and the
     * design brief says design for the middle and derive outward. `sm` exists
     * only for large phones; `tablet` is where marketplace layouts break, so it
     * gets a name rather than being an alias nobody reaches for.
     *
     * The Tailwind-conventional aliases point at the same widths, so a dev
     * arriving from another project is not wrong, just less explicit.
     */
    screens: {
      sm: '480px',
      tablet: '768px',
      md: '768px',
      desktop: '1024px',
      lg: '1024px',
      wide: '1440px',
      xl: '1440px',
      print: { raw: 'print' },
    },
    extend: {
      colors: {
        // ---- Vaapsi semantic slots
        background: hsl('background'),
        surface: {
          DEFAULT: hsl('surface'),
          raised: hsl('surface-raised'),
        },
        ink: {
          DEFAULT: hsl('ink'),
          muted: hsl('ink-muted'),
          subtle: hsl('ink-subtle'),
        },
        line: {
          DEFAULT: hsl('line'),
          strong: hsl('line-strong'),
        },
        accent: {
          DEFAULT: hsl('accent'),
          ink: hsl('accent-ink'),
          foreground: hsl('accent-foreground'),
        },
        // Savings only. See the long note on --positive in tokens.css: it is a
        // numeral colour, and there is deliberately no filled variant.
        positive: hsl('positive'),

        // ---- shadcn required set, so generated primitives theme themselves
        foreground: hsl('foreground'),
        card: { DEFAULT: hsl('card'), foreground: hsl('card-foreground') },
        popover: { DEFAULT: hsl('popover'), foreground: hsl('popover-foreground') },
        primary: { DEFAULT: hsl('primary'), foreground: hsl('primary-foreground') },
        secondary: { DEFAULT: hsl('secondary'), foreground: hsl('secondary-foreground') },
        muted: { DEFAULT: hsl('muted'), foreground: hsl('muted-foreground') },
        destructive: { DEFAULT: hsl('destructive'), foreground: hsl('destructive-foreground') },
        border: hsl('border'),
        input: hsl('input'),
        ring: hsl('ring'),
      },

      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },

      // Named to avoid colliding with the fontFamily keys above — Tailwind
      // generates both as `font-*`, so `font-display` cannot mean two things.
      fontWeight: {
        regular: 'var(--weight-body)',
        emphasis: 'var(--weight-emphasis)',
        heading: 'var(--weight-display)',
      },

      // Each size ships with its own tracking and leading, so `text-4xl` is a
      // complete typographic decision rather than a size that still needs two
      // more classes to look right.
      fontSize: {
        xs: ['var(--text-xs)', { letterSpacing: 'var(--tracking-xs)', lineHeight: '1.45' }],
        sm: ['var(--text-sm)', { letterSpacing: 'var(--tracking-sm)', lineHeight: '1.5' }],
        base: [
          'var(--text-base)',
          { letterSpacing: 'var(--tracking-base)', lineHeight: 'var(--leading-normal)' },
        ],
        lg: [
          'var(--text-lg)',
          { letterSpacing: 'var(--tracking-lg)', lineHeight: 'var(--leading-snug)' },
        ],
        xl: [
          'var(--text-xl)',
          { letterSpacing: 'var(--tracking-xl)', lineHeight: 'var(--leading-snug)' },
        ],
        '2xl': [
          'var(--text-2xl)',
          { letterSpacing: 'var(--tracking-2xl)', lineHeight: 'var(--leading-snug)' },
        ],
        '3xl': [
          'var(--text-3xl)',
          { letterSpacing: 'var(--tracking-3xl)', lineHeight: 'var(--leading-tight)' },
        ],
        '4xl': [
          'var(--text-4xl)',
          { letterSpacing: 'var(--tracking-4xl)', lineHeight: 'var(--leading-tight)' },
        ],
        '5xl': [
          'var(--text-5xl)',
          { letterSpacing: 'var(--tracking-5xl)', lineHeight: 'var(--leading-none)' },
        ],
        '6xl': [
          'var(--text-6xl)',
          { letterSpacing: 'var(--tracking-6xl)', lineHeight: 'var(--leading-none)' },
        ],
      },

      letterSpacing: {
        caps: 'var(--tracking-caps)',
        tight: 'var(--tracking-3xl)',
        normal: 'var(--tracking-base)',
      },

      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
      },

      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
        32: 'var(--space-32)',
        40: 'var(--space-40)',
        48: 'var(--space-48)',
        gutter: 'var(--gutter)',
        // Vertical rhythm between and inside page sections. Use these rather
        // than picking a number — see the note in tokens.css.
        section: 'var(--space-section)',
        'section-tight': 'var(--space-section-tight)',
      },

      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      /**
       * The stacking order, named.
       *
       * Bare numbers meant the header (`z-40`) and a drawer (`z-50`) were only
       * correctly ordered by accident, and a drawer rendered inside a page's
       * own stacking context lost to the header regardless of the number. The
       * portal in `Overlay` fixes the context; these names fix the ordering
       * being guesswork.
       *
       * Anything above `header` must be portalled to `document.body`, or its
       * number is compared against the wrong parent and the name lies.
       */
      zIndex: {
        raised: '10',
        header: '40',
        overlay: '60',
      },

      boxShadow: {
        none: 'var(--elevation-none)',
        overlay: 'var(--elevation-overlay)',
        sheet: 'var(--elevation-sheet)',
      },

      // DEFAULT means a bare `transition` already uses the house curve.
      transitionTimingFunction: {
        DEFAULT: 'var(--ease)',
        exit: 'var(--ease-exit)',
      },

      transitionDuration: {
        DEFAULT: 'var(--duration-base)',
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      maxWidth: {
        measure: 'var(--measure)',
        'measure-narrow': 'var(--measure-narrow)',
        container: 'var(--container-max)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),

    /**
     * Hide a scrollbar without disabling the scrolling.
     *
     * Only for a rail that carries its own visible controls. Taking the
     * scrollbar off a region with no other way through it strands anyone who
     * cannot swipe. Three spellings because the property is still unstandardised
     * across engines.
     */
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    }),
  ],
}

export default config
