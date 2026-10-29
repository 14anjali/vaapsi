import type { ProductCategory } from '@/lib/types'

/**
 * ============================================================================
 * SIZE GUIDE
 * ============================================================================
 *
 * Body measurements, in centimetres, for the size ladders new Vaapsi stock runs
 * on.
 *
 * ## Where these numbers come from
 *
 * They follow the **H&M womenswear and menswear size charts**, which is what
 * was asked for and is a defensible choice: H&M publishes its charts openly,
 * they are a widely recognised European ladder, and a shopper who knows their
 * H&M size has a reference point that transfers.
 *
 * ⚠️ **NEEDS SIGN-OFF BEFORE LAUNCH, FOR TWO REASONS.**
 *
 * 1. These are *another retailer's* charts. They describe how H&M's garments
 *    fit, and using them commits Vaapsi's own production to matching that fit.
 *    Either the pattern-cutting is specified against these numbers, or these
 *    numbers get replaced with Vaapsi's actual spec — the two must not drift,
 *    because the returns rate is the thing that finds out.
 * 2. Published charts change without notice and are the publisher's material.
 *    Transcribing a competitor's chart onto a live commercial site is worth a
 *    look from whoever handles legal before launch.
 *
 * Until then this is honest scaffolding: the numbers are real and internally
 * consistent, and the drawer says where they come from rather than presenting
 * them as measured facts about Vaapsi garments.
 *
 * ## Body, not garment
 *
 * These are **body** measurements — measure the person. `Product.measurements`
 * is the opposite: a garment measured flat. Both exist because they answer
 * different questions ("what size am I" versus "will this specific piece fit
 * me"), and conflating them is the single most common way a size guide misleads.
 * The drawer keeps them in separate tabs and says which is which.
 */

/** Which chart a garment reads from. Bottoms are sized on the waist ladder. */
export type SizeChartId = 'womenswear' | 'menswear' | 'bottoms'

export type SizeChartRow = {
  /** The label as it appears on the garment and in the picker. */
  size: string
  /** Body measurements in centimetres. Ranges where the chart gives one. */
  values: readonly string[]
}

export type SizeChart = {
  id: SizeChartId
  label: string
  /** Column headings, first is always the size column. */
  columns: readonly string[]
  rows: readonly SizeChartRow[]
  /** What this chart measures and how. */
  note: string
}

export const sizeCharts: readonly SizeChart[] = [
  {
    id: 'womenswear',
    label: 'Womenswear',
    columns: ['Size', 'Bust', 'Waist', 'Hips'],
    rows: [
      { size: 'XS', values: ['80–84', '62–66', '88–92'] },
      { size: 'S', values: ['84–88', '66–70', '92–96'] },
      { size: 'M', values: ['88–94', '70–76', '96–102'] },
      { size: 'L', values: ['94–100', '76–82', '102–108'] },
      { size: 'XL', values: ['100–108', '82–90', '108–116'] },
    ],
    note: 'Measured on the body, in centimetres, over underwear and pulled snug but not tight.',
  },
  {
    id: 'menswear',
    label: 'Menswear',
    columns: ['Size', 'Chest', 'Waist', 'Neck'],
    rows: [
      { size: 'XS', values: ['84–88', '72–76', '36'] },
      { size: 'S', values: ['88–96', '76–84', '37–38'] },
      { size: 'M', values: ['96–104', '84–92', '39–40'] },
      { size: 'L', values: ['104–112', '92–100', '41–42'] },
      { size: 'XL', values: ['112–120', '100–108', '43–44'] },
    ],
    note: 'Measured on the body, in centimetres, over a shirt rather than bare.',
  },
  {
    id: 'bottoms',
    label: 'Jeans and trousers',
    columns: ['Size', 'Waist (in)', 'Waist (cm)', 'Hips', 'Inseam'],
    rows: [
      { size: 'W28', values: ['28', '71–73', '92–95', '76'] },
      { size: 'W30', values: ['30', '76–78', '97–100', '76'] },
      { size: 'W32', values: ['32', '81–83', '102–105', '78'] },
      { size: 'W34', values: ['34', '86–88', '107–110', '78'] },
      { size: 'W36', values: ['36', '91–93', '112–115', '80'] },
    ],
    note: 'Waist sizes are stated in inches on the label, as denim conventionally is, and in centimetres beside it. Inseam is the finished garment length.',
  },
]

/**
 * Which chart a category reads from.
 *
 * Bottoms run the waist ladder. Everything else falls back to womenswear, which
 * is a **known gap, not a decision**: `Product` has no gender field, so there is
 * no way to tell a men's shirt from a women's one here. The same gap is flagged
 * in `lib/format/size`. Fixing it properly means adding gender to the contract.
 */
export function chartForCategory(category: ProductCategory): SizeChartId {
  return category === 'bottoms' ? 'bottoms' : 'womenswear'
}

export const sizeGuide = {
  /** The trigger beside the size row. */
  trigger: 'Size guide',
  title: 'Size guide',
  standfirst:
    'Body measurements in centimetres. Find your own measurements in the chart, rather than assuming the size you usually take.',
  tabs: {
    body: 'Body measurements',
    garment: 'This garment, measured flat',
  },
  /**
   * Said plainly in the drawer, because a shopper comparing a chart against a
   * garment measurement and getting different answers deserves to know why.
   */
  bodyVsGarment:
    'This chart describes a body. The measurements on the other tab describe this specific garment, laid flat — use those to judge how it will sit.',
  /** The provenance note. See the warning at the top of this file. */
  source: 'Sizing follows the H&M size chart.',
  sourcePending: 'Provisional — to be replaced by Vaapsi’s own specification.',
  /** For pre-loved, where the ladder does not apply. */
  oneOfOneNote:
    'This is a second-hand garment in the size its own label states. The chart below is a general reference; the flat measurements are the reliable guide.',
  howToMeasure: {
    title: 'How to measure',
    steps: [
      'Bust or chest — around the fullest part, keeping the tape level under the arms.',
      'Waist — around the narrowest part, usually just above the navel.',
      'Hips — around the fullest part, with your feet together.',
      'Inseam — from the crotch seam to the hem, down the inside of the leg.',
    ],
  },
} as const
