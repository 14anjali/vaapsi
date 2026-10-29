import { rupees } from '@/lib/format/currency'
import type { Product, ProductColor, ProductImage, Size } from '@/lib/types'

/**
 * Eight fixture garments. **All denim**, clothing and accessories.
 *
 * ---
 *
 * ## The shot list
 *
 * Every product carries the same six frames in the same order, modelled on the
 * Prada PDP the client referenced. That consistency is the point: a listing page
 * where one garment has a flat lay and the next has a cropped street shot reads
 * as a marketplace, not a store — and on resale, where every garment is a
 * one-off, consistency of presentation is the only thing making the set look
 * like one catalogue.
 *
 * | # | kind | The frame |
 * |---|---|---|
 * | 1 | `primary` | Garment alone on a light grey ground. Full bleed, no props |
 * | 2 | `worn` | Model, full length, front, plain pale ground, neutral pose |
 * | 3 | `detail` | Worn close-up — upper body, showing how it sits |
 * | 4 | `detail` | Hardware or construction crop — pocket, seam, rivet |
 * | 5 | `worn` | Model, full length, back |
 * | 6 | `label` | Macro on the collar, waistband or brand mark |
 *
 * Flaw frames are inserted after 4, since that is where a shopper is already
 * looking closely at construction.
 *
 * **The alt text is written as a photography brief.** It describes the frame we
 * want, not the placeholder that is currently there — so whoever shoots this can
 * work from the fixtures directly. See `SHOT_LIST` below.
 *
 * ## Placeholders
 *
 * `picsum.photos` images are unrelated to denim and always will be. The
 * structure, ratios and ordering are real; the pixels are not. Replacing them is
 * PRD open question #10.
 */

/** Source ratio for every frame. 4:5 crops well into the split PDP panel. */
const PORTRAIT = 4 / 5

/**
 * Garments that have real photography in `public/products/<slug>/`.
 *
 * Add a slug here and its frames resolve to local files instead of placeholders.
 * That is the entire switch — one line per garment. The file naming convention
 * is in `public/products/README.md`.
 *
 * Empty for now: every image on the site is still an unrelated `picsum`
 * placeholder. Replacing them is PRD open question #10, and it is the single
 * biggest thing between this build and a client review that shows the design
 * rather than the scaffolding.
 */
const LOCAL_PHOTOGRAPHY = new Map<string, string>([
  ['chandra-denim-blazer', 'jpg'],
  ['saraswati-wide-leg-jean', 'jpg'],
  ['krishna-denim-tote', 'jpg'],
  ['sindhu-denim-overshirt', 'jpg'],
  ['godavari-tapered-jean', 'jpg'],
  ['kaveri-chore-jacket', 'jpg'],
  ['chenab-trucker-jacket', 'jpg'],
  ['ravi-straight-jean', 'jpg'],
  ['beas-denim-skirt', 'jpg'],
  ['sutlej-shirt-dress', 'jpg'],
  ['jhelum-shoulder-bag', 'jpg'],
  ['gomti-waistcoat', 'jpg'],
  ['narmada-jumpsuit', 'jpg'],
  ['tapti-straight-leg-jean', 'png'],
  ['indus-straight-jean', 'jpg'],
  ['kaveri-trucker-jacket', 'jpg'],
  ['yamuna-chambray-shirt', 'jpg'],
])

/**
 * Frame filenames, matched to `SHOT_LIST` order. Flaw frames are named
 * `flaw-1`, `flaw-2`, … because their position in the sequence varies with how
 * many a garment has.
 */
function localPath(slug: string, id: string, kind: ProductImage['kind'], index: number): string {
  const name = kind === 'flaw' ? `flaw-${id.split('_').pop() ?? '1'}` : `${index + 1}-${kind}`
  return `/products/${slug}/${name}.${LOCAL_PHOTOGRAPHY.get(slug) ?? 'jpg'}`
}

/**
 * The brief, in order. Exported so a photographer or a stylist can be handed the
 * list without reading a TypeScript file, and so the fixture set cannot drift
 * out of shape one product at a time.
 */
export const SHOT_LIST = [
  { kind: 'primary', frame: 'Garment alone, light grey ground, full bleed' },
  { kind: 'worn', frame: 'Model, full length, front, plain pale ground' },
  { kind: 'detail', frame: 'Worn close-up, upper body' },
  { kind: 'detail', frame: 'Hardware or construction crop' },
  { kind: 'worn', frame: 'Model, full length, back' },
  { kind: 'label', frame: 'Macro on collar, waistband or brand mark' },
] as const

/**
 * One frame.
 *
 * `slug` and `index` are only used to build a local path when the garment has
 * real photography; otherwise the seeded placeholder is stable so the same
 * garment always shows the same (unrelated) picture, which matters for review.
 */
function image(
  id: string,
  seed: string,
  alt: string,
  kind: ProductImage['kind'],
  slug?: string,
  index = 0,
): ProductImage {
  const local = slug !== undefined && LOCAL_PHOTOGRAPHY.has(slug)
  return {
    id,
    url: local ? localPath(slug, id, kind, index) : `https://picsum.photos/seed/${seed}/1200/1500`,
    alt,
    kind,
    aspectRatio: PORTRAIT,
  }
}

/**
 * The denim palette.
 *
 * Shared so a colour name means the same thing on every listing — "Mid wash" on
 * a jacket and on a pair of jeans must be the same swatch, or the picker is
 * lying about what matches what.
 *
 * Every hex is an approximation of a wash. See `ProductColor.hex`.
 */
export const DENIM_COLORS = {
  raw: { slug: 'raw-indigo', name: 'Raw indigo', hex: '#2b3a55' },
  indigo: { slug: 'indigo', name: 'Indigo', hex: '#3a5480' },
  midIndigo: { slug: 'mid-indigo', name: 'Mid indigo', hex: '#4a6a99' },
  midWash: { slug: 'mid-wash', name: 'Mid wash', hex: '#5d7fa8' },
  washedBlue: { slug: 'washed-blue', name: 'Washed blue', hex: '#7c9cc4' },
  lightWash: { slug: 'light-wash', name: 'Light wash', hex: '#a8c0d8' },
  ecru: { slug: 'ecru', name: 'Ecru', hex: '#ded6c4' },
  black: { slug: 'washed-black', name: 'Washed black', hex: '#2f2f33' },
} as const satisfies Record<string, ProductColor>

/**
 * Size ladders for new stock.
 *
 * Pre-loved garments carry whatever their own label says, transcribed and never
 * inferred. New stock is ours, so it runs a known ladder — and a colourway picks
 * its available sizes out of it rather than inventing labels.
 */
const SIZES_ALPHA: readonly Size[] = [
  { label: 'XS', system: 'IN', normalized: 'xs' },
  { label: 'S', system: 'IN', normalized: 's' },
  { label: 'M', system: 'IN', normalized: 'm' },
  { label: 'L', system: 'IN', normalized: 'l' },
  { label: 'XL', system: 'IN', normalized: 'xl' },
]

const SIZES_W: readonly Size[] = [
  { label: 'W28', system: 'IN', normalized: 'w28' },
  { label: 'W30', system: 'IN', normalized: 'w30' },
  { label: 'W32', system: 'IN', normalized: 'w32' },
  { label: 'W34', system: 'IN', normalized: 'w34' },
  { label: 'W36', system: 'IN', normalized: 'w36' },
]

export const products: readonly Product[] = [
  // 1 — passport, pristine, outerwear. The editorial lead.
  {
    id: 'prd_bhaane_trucker_indigo',
    slug: 'chenab-trucker-jacket',
    sku: 'VP-2601-0148',
    title: 'Chenab Trucker Jacket',
    brand: 'Vaapsi',
    category: 'outerwear',
    subcategory: 'Trucker jacket',
    listingType: 'pre_loved',
    gender: 'unisex',
    color: DENIM_COLORS.raw,
    composition: '100% cotton',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'pristine',
    conditionNotes:
      'Unworn, tags attached. Raw selvedge that has never been washed — it will fade to whoever wears it, not to whoever owned it before.',
    flaws: [],
    measurements: { chest: 116, shoulder: 48, length: 66, sleeveLength: 61 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(6_400),
    originalRetailInr: rupees(11_500),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_ch_1',
        'chenab-trucker-jacket-1',
        'Raw indigo trucker jacket held open to show a printed cotton lining',
        'primary',
        'chenab-trucker-jacket',
        0,
      ),
      image(
        'img_ch_2',
        'chenab-trucker-jacket-2',
        'Someone wearing the trucker jacket open over a white shirt, on the street',
        'worn',
        'chenab-trucker-jacket',
        1,
      ),
      image(
        'img_ch_3',
        'chenab-trucker-jacket-3',
        'The jacket turned back to show the patterned inner facing at the placket',
        'detail',
        'chenab-trucker-jacket',
        2,
      ),
      image(
        'img_ch_4',
        'chenab-trucker-jacket-4',
        'Macro of hand-stitched thread work on woven indigo cloth',
        'label',
        'chenab-trucker-jacket',
        3,
      ),
    ],
    passportId: 'psp_bhaane_trucker_indigo',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-14T06:30:00.000Z',
  },

  // 2 — passport, good, jeans, documented flaws
  {
    id: 'prd_levis_501_indigo',
    slug: 'ravi-straight-jean',
    sku: 'VP-2605-0902',
    title: 'Ravi Straight Jean',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Straight jeans',
    listingType: 'pre_loved',
    gender: 'men',
    color: DENIM_COLORS.midIndigo,
    composition: '100% cotton',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'good',
    conditionNotes:
      'Broken in properly. Even fade through the thigh and a soft hem — the wear pattern is the appeal here, not a defect.',
    flaws: [
      {
        description: 'Fraying along roughly 3 cm of the left hem where it has caught underfoot.',
        imageId: 'img_lv_flaw_1',
        location: 'Left hem',
      },
      {
        description: 'Small paint fleck, about 4 mm, on the right back pocket. Does not lift off.',
        imageId: 'img_lv_flaw_2',
        location: 'Right back pocket',
      },
    ],
    measurements: { waist: 78, hip: 100, inseam: 79, rise: 29, thigh: 30, hem: 18 },
    size: { label: '30', system: 'IN', normalized: 'w30' },
    priceInr: rupees(2_650),
    originalRetailInr: rupees(6_499),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_rv_1',
        'ravi-straight-jean-1',
        'Mid indigo straight jeans worn full length, front, with a leather belt',
        'primary',
        'ravi-straight-jean',
        0,
      ),
      image(
        'img_rv_2',
        'ravi-straight-jean-2',
        'The jeans worn on a staircase, showing the fade through the thigh',
        'worn',
        'ravi-straight-jean',
        1,
      ),
      image(
        'img_rv_3',
        'ravi-straight-jean-3',
        'Close crop of the front rise, button fly and pocket bags',
        'detail',
        'ravi-straight-jean',
        2,
      ),
      image(
        'img_rv_4',
        'ravi-straight-jean-4',
        'The jeans worn from the side, showing the leg line and hem break',
        'worn',
        'ravi-straight-jean',
        3,
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_lv_flaw_1',
        'flaw-ravi-1',
        'Close crop of about 3 cm of fraying along the left hem',
        'flaw',
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_lv_flaw_2',
        'flaw-ravi-2',
        'Close crop of a 4 mm paint fleck on the right back pocket',
        'flaw',
      ),
    ],
    passportId: 'psp_levis_501_indigo',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-19T11:05:00.000Z',
  },

  // 3 — passport, excellent, skirt, reserved
  {
    id: 'prd_acne_denim_maxi_skirt',
    slug: 'beas-denim-skirt',
    sku: 'VP-2604-0331',
    title: 'Beas Denim Skirt',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Maxi skirt',
    listingType: 'pre_loved',
    gender: 'women',
    color: DENIM_COLORS.washedBlue,
    composition: '65% cotton, 35% linen',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'excellent',
    conditionNotes:
      'Worn four or five times across one summer. The wash is even, the back vent sits flat, and the zip runs clean.',
    flaws: [],
    measurements: { waist: 72, hip: 98, length: 92, hem: 68 },
    size: { label: '38', system: 'IN', normalized: 'm' },
    priceInr: rupees(9_800),
    originalRetailInr: rupees(24_990),
    currency: 'INR',
    // Someone is mid-checkout. On one-of-one inventory this is a normal state a
    // shopper will meet, not an edge case.
    availability: 'reserved',
    images: [
      image(
        'img_bs_1',
        'beas-denim-skirt-1',
        'Washed blue denim skirt with a full gathered hem, worn full length',
        'primary',
        'beas-denim-skirt',
        0,
      ),
      image(
        'img_bs_2',
        'beas-denim-skirt-2',
        'The skirt worn with a matching indigo top, front, in a panelled room',
        'worn',
        'beas-denim-skirt',
        1,
      ),
      image(
        'img_bs_3',
        'beas-denim-skirt-3',
        'Close crop of appliqué and running-stitch detail on the denim panel',
        'detail',
        'beas-denim-skirt',
        2,
      ),
      image(
        'img_bs_4',
        'beas-denim-skirt-4',
        'The skirt worn outdoors with a strappy top, full length',
        'worn',
        'beas-denim-skirt',
        3,
      ),
    ],
    passportId: 'psp_acne_denim_maxi_skirt',
    sellerId: 'sel_ananya_r',
    listedAt: '2026-07-30T09:15:00.000Z',
  },

  // 4 — passport, very_good, chambray dress
  {
    id: 'prd_nicobar_chambray_shirtdress',
    slug: 'sutlej-shirt-dress',
    sku: 'VP-2606-1177',
    title: 'Sutlej Shirt Dress',
    brand: 'Vaapsi',
    category: 'dresses',
    subcategory: 'Shirt dress',
    listingType: 'pre_loved',
    gender: 'women',
    color: DENIM_COLORS.indigo,
    composition: '100% cotton',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'very_good',
    conditionNotes:
      'A summer of regular wear. The chambray has softened the way it should and the colour is intact. Two spare buttons still in the pocket.',
    flaws: [
      {
        description: 'Faint shadow at the underarm, visible only inside out. Does not show worn.',
        imageId: 'img_nb_flaw_1',
        location: 'Left underarm, interior',
      },
    ],
    measurements: { chest: 100, waist: 96, hip: 104, shoulder: 42, length: 118, sleeveLength: 48 },
    size: { label: 'L', system: 'IN', normalized: 'l' },
    priceInr: rupees(2_200),
    originalRetailInr: rupees(5_800),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_su_1',
        'sutlej-shirt-dress-1',
        'Indigo chambray shirt dress worn belted at the waist, front, full length',
        'primary',
        'sutlej-shirt-dress',
        0,
      ),
      image(
        'img_su_2',
        'sutlej-shirt-dress-2',
        'The shirt dress worn open over a matching skirt, front',
        'worn',
        'sutlej-shirt-dress',
        1,
      ),
      image(
        'img_su_3',
        'sutlej-shirt-dress-3',
        'Close crop of the cuff, patch pocket and topstitching',
        'detail',
        'sutlej-shirt-dress',
        2,
      ),
      image(
        'img_su_4',
        'sutlej-shirt-dress-4',
        'The chambray worn with the sleeves rolled, upper body, front',
        'worn',
        'sutlej-shirt-dress',
        3,
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_nb_flaw_1',
        'flaw-sutlej-1',
        'The dress turned inside out at the left underarm, showing a faint shadow',
        'flaw',
      ),
    ],
    passportId: 'psp_nicobar_chambray_shirtdress',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-21T04:40:00.000Z',
  },

  // 5 — passport, well_loved, bag, repaired, sold
  {
    id: 'prd_diesel_denim_shoulder_bag',
    slug: 'jhelum-shoulder-bag',
    sku: 'VP-2602-0455',
    title: 'Jhelum Shoulder Bag',
    brand: 'Vaapsi',
    category: 'accessories',
    subcategory: 'Shoulder bag',
    listingType: 'pre_loved',
    gender: 'unisex',
    color: DENIM_COLORS.midWash,
    composition: '100% cotton, leather trim',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'well_loved',
    conditionNotes:
      'Carried for years and it shows. One re-stitched strap anchor, done properly and visible. Priced for it. The repair is on the passport.',
    flaws: [
      {
        description: 'Re-stitched left strap anchor, in a matching thread. Sound, but visible.',
        imageId: 'img_dl_flaw_1',
        location: 'Left strap anchor',
      },
      {
        description: 'Denim rubbed pale along the bottom edge where it has sat down.',
        imageId: 'img_dl_flaw_2',
        location: 'Base edge',
      },
    ],
    // A bag has no garment measurements. `Measurements` is a partial record
    // precisely so this renders as three lines rather than nine with six blanks.
    measurements: { length: 28, hem: 15 },
    size: { label: 'One size', system: 'IN', normalized: 'one_size' },
    priceInr: rupees(3_900),
    originalRetailInr: rupees(18_500),
    currency: 'INR',
    // Sold. Kept in the fixture set because a sold garment still has a passport
    // worth reading, and the PDP has to render that state.
    availability: 'sold',
    images: [
      image(
        'img_jh_1',
        'jhelum-shoulder-bag-1',
        'Mid-wash denim shoulder bag alone on a pale ground, buckle forward',
        'primary',
        'jhelum-shoulder-bag',
        0,
      ),
      image(
        'img_jh_2',
        'jhelum-shoulder-bag-2',
        'The bag from the front, showing the belted flap and shoulder strap',
        'worn',
        'jhelum-shoulder-bag',
        1,
      ),
      image(
        'img_jh_3',
        'jhelum-shoulder-bag-3',
        'Close crop of the buckle hardware and the strap anchor',
        'detail',
        'jhelum-shoulder-bag',
        2,
      ),
      image(
        'img_jh_4',
        'jhelum-shoulder-bag-4',
        'The bag turned to show the D-ring and the stitched gusset',
        'label',
        'jhelum-shoulder-bag',
        3,
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_dl_flaw_1',
        'flaw-jhelum-1',
        'Close crop of the re-stitched left strap anchor in matching thread',
        'flaw',
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_dl_flaw_2',
        'flaw-jhelum-2',
        'Close crop of the base edge where the denim has rubbed pale',
        'flaw',
      ),
    ],
    passportId: 'psp_diesel_denim_shoulder_bag',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-05-11T07:20:00.000Z',
  },

  // 6 — NO passport, good, waistcoat
  {
    id: 'prd_zara_denim_waistcoat',
    slug: 'gomti-waistcoat',
    sku: 'VP-2607-1402',
    title: 'Gomti Waistcoat',
    brand: 'Vaapsi',
    category: 'tops',
    subcategory: 'Waistcoat',
    listingType: 'pre_loved',
    gender: 'women',
    color: DENIM_COLORS.lightWash,
    composition: '99% cotton, 1% elastane',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'good',
    conditionNotes:
      'Light wash, worn a season. All five buttons original, the back tie is intact, and the armholes have kept their shape.',
    flaws: [
      {
        description: 'Two small pulls in the weave near the left armhole.',
        imageId: 'img_zr_flaw_1',
        location: 'Left armhole',
      },
    ],
    measurements: { chest: 96, shoulder: 36, length: 52 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(1_450),
    originalRetailInr: rupees(4_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_go_1',
        'gomti-waistcoat-1',
        'Light wash denim waistcoat worn over white trousers, front, buttoned',
        'primary',
        'gomti-waistcoat',
        0,
      ),
      image(
        'img_go_2',
        'gomti-waistcoat-2',
        'The waistcoat worn open over a white shirt with a linen jacket',
        'worn',
        'gomti-waistcoat',
        1,
      ),
      image(
        'img_go_3',
        'gomti-waistcoat-3',
        'The waistcoat worn as a set, upper body, showing the shoulder line',
        'detail',
        'gomti-waistcoat',
        2,
      ),
      image(
        'img_go_4',
        'gomti-waistcoat-4',
        'The waistcoat worn with wide denim trousers, full length',
        'worn',
        'gomti-waistcoat',
        3,
      ),
      // Placeholder. See the note in restore_flaws — no flaw photography exists.
      image(
        'img_zr_flaw_1',
        'flaw-gomti-1',
        'Close crop of two small pulls in the weave near the left armhole',
        'flaw',
      ),
    ],
    // No passport. Three of the eight fixtures are like this on purpose.
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-20T13:50:00.000Z',
  },

  // 7 — NO passport, excellent, jumpsuit, original retail unknown
  {
    id: 'prd_cos_denim_jumpsuit',
    slug: 'narmada-jumpsuit',
    sku: 'VP-2607-1519',
    title: 'Narmada Jumpsuit',
    brand: 'Vaapsi',
    category: 'dresses',
    subcategory: 'Jumpsuit',
    listingType: 'pre_loved',
    gender: 'women',
    color: DENIM_COLORS.midWash,
    composition: '100% recycled cotton',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'excellent',
    conditionNotes:
      'Worn twice. Utility pockets still crisp, the belt is present, and the zip runs the full length without catching.',
    flaws: [],
    measurements: { chest: 98, waist: 88, hip: 106, shoulder: 40, inseam: 74, length: 148 },
    size: { label: 'S', system: 'IN', normalized: 's' },
    priceInr: rupees(7_500),
    // Genuinely unknown. Left null rather than estimated, because a made-up
    // original price manufactures a discount that is not real.
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_na_1',
        'narmada-jumpsuit-1',
        'Mid-wash denim jumpsuit with a wide leg, worn full length, front',
        'primary',
        'narmada-jumpsuit',
        0,
      ),
      image(
        'img_na_2',
        'narmada-jumpsuit-2',
        'The jumpsuit worn outdoors with a woven basket bag, full length',
        'worn',
        'narmada-jumpsuit',
        1,
      ),
      image(
        'img_na_3',
        'narmada-jumpsuit-3',
        'Close crop of the front seam and the zip pull at the placket',
        'detail',
        'narmada-jumpsuit',
        2,
      ),
      image(
        'img_na_4',
        'narmada-jumpsuit-4',
        'The jumpsuit worn on the street, showing the leg and the taper',
        'worn',
        'narmada-jumpsuit',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_ananya_r',
    listedAt: '2026-08-22T08:10:00.000Z',
  },

  // 8 — NO passport, very_good, straight-leg jeans. The one garment shot for real.
  {
    id: 'prd_uniqlo_wide_leg_jeans',
    slug: 'tapti-straight-leg-jean',
    sku: 'VP-2608-1633',
    title: 'Tapti Straight-Leg Jean',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Straight-leg jeans',
    listingType: 'pre_loved',
    gender: 'women',
    color: DENIM_COLORS.midWash,
    composition: '99% cotton, 1% elastane',
    // One physical garment. No colourways to pick between.
    colorVariants: [],
    condition: 'very_good',
    conditionNotes:
      'Worn in properly and evenly. The fade runs where a person puts it — soft whiskering at the front hip, a lighter panel down the thigh, the seat and knees a shade paler than the outseam. Copper rivets and the ecru topstitch are all present. Hem taken up once by a tailor and finished with the original chain stitch, so it reads as factory.',
    flaws: [],
    // Cropped straight, not wide: the hem sits above the ankle bone and the leg
    // opening is close to the knee measurement rather than flaring past it.
    measurements: { waist: 76, hip: 98, inseam: 68, rise: 29, thigh: 30, hem: 19 },
    size: { label: '32', system: 'IN', normalized: 'w32' },
    priceInr: rupees(1_900),
    originalRetailInr: rupees(3_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_tp_1',
        'tapti-straight-leg-jean-1',
        'Mid-wash straight-leg jeans alone on a light grey ground, front',
        'primary',
        'tapti-straight-leg-jean',
        0,
      ),
      image(
        'img_tp_2',
        'tapti-straight-leg-jean-2',
        'Model wearing the straight-leg jeans, full length, front',
        'worn',
        'tapti-straight-leg-jean',
        1,
      ),
      image(
        'img_tp_3',
        'tapti-straight-leg-jean-3',
        'Worn from the side, showing the straight leg and the cropped hem',
        'detail',
        'tapti-straight-leg-jean',
        2,
      ),
      image(
        'img_tp_4',
        'tapti-straight-leg-jean-4',
        'Model wearing the jeans, full length, back',
        'worn',
        'tapti-straight-leg-jean',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-22T15:25:00.000Z',
  },

  // ---------------------------------------------------------------------------
  // New retail stock.
  //
  // Vaapsi's own first-party denim, and the only listings on the site with
  // colourways and repeatable inventory. Everything above this line is one
  // physical second-hand garment.
  //
  // Three things separate these from the eight above, and each is load-bearing
  // in the UI:
  //   - `condition` and `conditionNotes` are null. Unworn stock has no grade,
  //     and a placeholder grade would be a claim about wear nobody made.
  //   - `flaws` is empty and `passportId` is null. A passport records where a
  //     garment has been; a new one has been nowhere yet.
  //   - `colorVariants` is populated, so the PDP shows a picker.
  //
  // `ColorVariant.images` is empty on every colourway below: the photography we
  // have is one set per style, not one set per colour. An empty array falls back
  // to `Product.images`, which is the honest behaviour — better a shopper sees
  // the mid indigo shot while the ecru is selected than a picture of a garment
  // that is not the one they picked. Per-colour frames drop in here when shot.
  // ---------------------------------------------------------------------------

  // 9 — new, jeans, four colourways. The colour-picker reference case.
  {
    id: 'prd_vaapsi_straight_jean_new',
    slug: 'indus-straight-jean',
    sku: 'VP-NEW-1001',
    title: 'Indus Straight Jean',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Straight jeans',
    listingType: 'new',
    gender: 'men',
    color: DENIM_COLORS.midIndigo,
    composition: '98% cotton, 2% elastane',
    colorVariants: [
      {
        color: DENIM_COLORS.raw,
        sizes: SIZES_W.filter((size) => size.normalized !== 'w36'),
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.midIndigo,
        sizes: SIZES_W,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.lightWash,
        // Two sizes left. Picking this colour must not offer W34.
        sizes: SIZES_W.filter((size) => ['w28', 'w30'].includes(size.normalized)),
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.black,
        // Sold out, and shown as such rather than hidden — see ColorPicker.
        sizes: [],
        availability: 'sold',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { waist: 76, hip: 98, inseam: 76, rise: 28, thigh: 58, hem: 18 },
    size: { label: 'W30', system: 'IN', normalized: 'w30' },
    priceInr: rupees(3_900),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_in_1',
        'indus-straight-jean-1',
        'Pale wash straight jeans worn full length, front, against a grey wall',
        'primary',
        'indus-straight-jean',
        0,
      ),
      image(
        'img_in_2',
        'indus-straight-jean-2',
        'The jeans worn full length, front, showing the straight leg to the ankle',
        'worn',
        'indus-straight-jean',
        1,
      ),
      image(
        'img_in_3',
        'indus-straight-jean-3',
        'Close crop of the waistband, belt loops and front rise',
        'detail',
        'indus-straight-jean',
        2,
      ),
      image(
        'img_in_4',
        'indus-straight-jean-4',
        'The jeans worn with the hem breaking over the shoe, side',
        'worn',
        'indus-straight-jean',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-28T09:00:00.000Z',
  },

  // 10 — new, jacket, three colourways, one priced differently.
  {
    id: 'prd_vaapsi_trucker_new',
    slug: 'kaveri-trucker-jacket',
    sku: 'VP-NEW-1002',
    title: 'Kaveri Trucker Jacket',
    brand: 'Vaapsi',
    category: 'outerwear',
    subcategory: 'Trucker jacket',
    listingType: 'new',
    gender: 'unisex',
    color: DENIM_COLORS.midWash,
    composition: '100% cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.midWash,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.ecru,
        sizes: SIZES_ALPHA.filter((size) => size.normalized !== 'xs'),
        availability: 'available',
        // Ecru is dyed differently and costs more. Priced per colourway.
        priceInr: rupees(5_200),
        images: [],
      },
      {
        color: DENIM_COLORS.washedBlue,
        sizes: SIZES_ALPHA.filter((size) => ['m', 'l'].includes(size.normalized)),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { chest: 108, shoulder: 46, length: 62, sleeveLength: 60 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(4_800),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_kv_1',
        'kaveri-trucker-jacket-1',
        'Mid-wash denim trucker jacket alone, front, zipped, showing four pockets',
        'primary',
        'kaveri-trucker-jacket',
        0,
      ),
      image(
        'img_kv_2',
        'kaveri-trucker-jacket-2',
        'The trucker jacket worn buttoned over a pale shirt, upper body, front',
        'worn',
        'kaveri-trucker-jacket',
        1,
      ),
      image(
        'img_kv_3',
        'kaveri-trucker-jacket-3',
        'Close crop of the chest pocket, the placket and the topstitch',
        'detail',
        'kaveri-trucker-jacket',
        2,
      ),
      image(
        'img_kv_4',
        'kaveri-trucker-jacket-4',
        'The jacket worn open, showing the collar and the shoulder seam',
        'worn',
        'kaveri-trucker-jacket',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-27T09:00:00.000Z',
  },

  // 11 — new, shirt, two colourways. Deliberately the plainest of the three.
  {
    id: 'prd_vaapsi_chambray_shirt_new',
    slug: 'yamuna-chambray-shirt',
    sku: 'VP-NEW-1003',
    title: 'Yamuna Chambray Shirt',
    brand: 'Vaapsi',
    category: 'tops',
    subcategory: 'Shirt',
    listingType: 'new',
    gender: 'men',
    color: DENIM_COLORS.lightWash,
    composition: '55% linen, 45% cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.lightWash,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.indigo,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { chest: 104, shoulder: 44, length: 74, sleeveLength: 62, neck: 39 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(2_600),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_ya_1',
        'yamuna-chambray-shirt-1',
        'Light wash chambray shirt worn buttoned with the sleeves rolled, front',
        'primary',
        'yamuna-chambray-shirt',
        0,
      ),
      image(
        'img_ya_2',
        'yamuna-chambray-shirt-2',
        'The chambray shirt worn open over white trousers, full length',
        'worn',
        'yamuna-chambray-shirt',
        1,
      ),
      image(
        'img_ya_3',
        'yamuna-chambray-shirt-3',
        'Close crop of the cuff, the placket and the topstitching',
        'detail',
        'yamuna-chambray-shirt',
        2,
      ),
      image(
        'img_ya_4',
        'yamuna-chambray-shirt-4',
        'The shirt worn under a jacket, upper body, showing the collar',
        'worn',
        'yamuna-chambray-shirt',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-26T09:00:00.000Z',
  },

  // ---------------------------------------------------------------------------
  // More new stock.
  //
  // The New listing shows first-party stock only, so it needs enough depth to
  // read as a shop rather than as three samples: nine styles across womenswear,
  // menswear and unisex, spanning every filter the panel offers so none of them
  // is a control with one option in it.
  // ---------------------------------------------------------------------------

  {
    id: 'prd_vaapsi_chandra_blazer',
    slug: 'chandra-denim-blazer',
    sku: 'VP-NEW-1004',
    title: 'Chandra Denim Blazer',
    brand: 'Vaapsi',
    category: 'suiting',
    subcategory: 'Blazer',
    listingType: 'new',
    gender: 'women',
    color: DENIM_COLORS.midIndigo,
    composition: '99% cotton, 1% elastane',
    colorVariants: [
      {
        color: DENIM_COLORS.midIndigo,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.raw,
        sizes: SIZES_ALPHA.filter((size) => size.normalized !== 'xs'),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { chest: 96, shoulder: 40, length: 66, sleeveLength: 58 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(6_200),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_chandr_1',
        'chandra-denim-blazer-1',
        'Mid indigo denim blazer worn open over a roll neck, upper body, front',
        'primary',
        'chandra-denim-blazer',
        0,
      ),
      image(
        'img_chandr_2',
        'chandra-denim-blazer-2',
        'The blazer worn buttoned with a scarf, full length, on a street',
        'worn',
        'chandra-denim-blazer',
        1,
      ),
      image(
        'img_chandr_3',
        'chandra-denim-blazer-3',
        'Close crop of the lapel, the chest pocket and the topstitch',
        'detail',
        'chandra-denim-blazer',
        2,
      ),
      image(
        'img_chandr_4',
        'chandra-denim-blazer-4',
        'The blazer worn double-breasted, upper body, three-quarter view',
        'worn',
        'chandra-denim-blazer',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-25T09:00:00.000Z',
  },

  {
    id: 'prd_vaapsi_saraswati_wide',
    slug: 'saraswati-wide-leg-jean',
    sku: 'VP-NEW-1005',
    title: 'Saraswati Wide-Leg Jean',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Wide-leg jeans',
    listingType: 'new',
    gender: 'women',
    color: DENIM_COLORS.midWash,
    composition: '100% recycled cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.midWash,
        sizes: SIZES_W,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.lightWash,
        sizes: SIZES_W.filter((size) => size.normalized !== 'w36'),
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.black,
        sizes: SIZES_W.filter((size) => ['w28', 'w30', 'w32'].includes(size.normalized)),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { waist: 74, hip: 100, inseam: 78, rise: 31, thigh: 62, hem: 26 },
    size: { label: 'W28', system: 'IN', normalized: 'w28' },
    priceInr: rupees(3_600),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_sarasw_1',
        'saraswati-wide-leg-jean-1',
        'Mid-wash wide-leg jeans worn full length, front, on a city street',
        'primary',
        'saraswati-wide-leg-jean',
        0,
      ),
      image(
        'img_sarasw_2',
        'saraswati-wide-leg-jean-2',
        'The wide-leg jeans worn with a sleeveless top, full length',
        'worn',
        'saraswati-wide-leg-jean',
        1,
      ),
      image(
        'img_sarasw_3',
        'saraswati-wide-leg-jean-3',
        'Close crop of the wide hem breaking over the shoe',
        'detail',
        'saraswati-wide-leg-jean',
        2,
      ),
      image(
        'img_sarasw_4',
        'saraswati-wide-leg-jean-4',
        'The jeans worn from the side, showing the full leg line',
        'worn',
        'saraswati-wide-leg-jean',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-24T09:00:00.000Z',
  },

  {
    id: 'prd_vaapsi_krishna_tote',
    slug: 'krishna-denim-tote',
    sku: 'VP-NEW-1006',
    title: 'Krishna Denim Tote',
    brand: 'Vaapsi',
    category: 'accessories',
    subcategory: 'Tote bag',
    listingType: 'new',
    gender: 'unisex',
    color: DENIM_COLORS.indigo,
    composition: '60% hemp, 40% cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.indigo,
        sizes: [{ label: 'One size', system: 'IN' as const, normalized: 'one_size' }],
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.ecru,
        sizes: [{ label: 'One size', system: 'IN' as const, normalized: 'one_size' }],
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { length: 38, hem: 42 },
    size: { label: 'One size', system: 'IN', normalized: 'one_size' },
    priceInr: rupees(2_400),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_krishn_1',
        'krishna-denim-tote-1',
        'Indigo denim tote with a woven panel and drawstring corners, front',
        'primary',
        'krishna-denim-tote',
        0,
      ),
      image(
        'img_krishn_2',
        'krishna-denim-tote-2',
        'The tote carried on the shoulder, showing the strap drop',
        'worn',
        'krishna-denim-tote',
        1,
      ),
      image(
        'img_krishn_3',
        'krishna-denim-tote-3',
        'Close crop of the buckle and the stitched gusset',
        'detail',
        'krishna-denim-tote',
        2,
      ),
      image(
        'img_krishn_4',
        'krishna-denim-tote-4',
        'The tote turned to show the interior label and lining',
        'label',
        'krishna-denim-tote',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-23T09:00:00.000Z',
  },

  {
    id: 'prd_vaapsi_sindhu_overshirt',
    slug: 'sindhu-denim-overshirt',
    sku: 'VP-NEW-1007',
    title: 'Sindhu Denim Overshirt',
    brand: 'Vaapsi',
    category: 'tops',
    subcategory: 'Overshirt',
    listingType: 'new',
    gender: 'men',
    color: DENIM_COLORS.midWash,
    composition: '70% lyocell, 30% cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.midWash,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.indigo,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.ecru,
        sizes: SIZES_ALPHA.filter((size) => ['m', 'l', 'xl'].includes(size.normalized)),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { chest: 112, shoulder: 47, length: 76, sleeveLength: 63 },
    size: { label: 'L', system: 'IN', normalized: 'l' },
    priceInr: rupees(3_100),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_sindhu_1',
        'sindhu-denim-overshirt-1',
        'Mid-wash denim overshirt worn open over a white tee, upper body',
        'primary',
        'sindhu-denim-overshirt',
        0,
      ),
      image(
        'img_sindhu_2',
        'sindhu-denim-overshirt-2',
        'The overshirt worn buttoned with the sleeves rolled, front',
        'worn',
        'sindhu-denim-overshirt',
        1,
      ),
      image(
        'img_sindhu_3',
        'sindhu-denim-overshirt-3',
        'Close crop of the chest pocket, placket and cuff',
        'detail',
        'sindhu-denim-overshirt',
        2,
      ),
      image(
        'img_sindhu_4',
        'sindhu-denim-overshirt-4',
        'The overshirt worn on the street, three-quarter view',
        'worn',
        'sindhu-denim-overshirt',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-22T09:00:00.000Z',
  },

  {
    id: 'prd_vaapsi_godavari_tapered',
    slug: 'godavari-tapered-jean',
    sku: 'VP-NEW-1008',
    title: 'Godavari Tapered Jean',
    brand: 'Vaapsi',
    category: 'bottoms',
    subcategory: 'Tapered jeans',
    listingType: 'new',
    gender: 'men',
    color: DENIM_COLORS.black,
    composition: '98% cotton, 2% elastane',
    colorVariants: [
      {
        color: DENIM_COLORS.black,
        sizes: SIZES_W,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.midIndigo,
        sizes: SIZES_W,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.raw,
        sizes: SIZES_W.filter((size) => size.normalized !== 'w28'),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { waist: 80, hip: 100, inseam: 76, rise: 27, thigh: 56, hem: 16 },
    size: { label: 'W32', system: 'IN', normalized: 'w32' },
    priceInr: rupees(3_400),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_godava_1',
        'godavari-tapered-jean-1',
        'Washed black tapered jeans worn full length, front',
        'primary',
        'godavari-tapered-jean',
        0,
      ),
      image(
        'img_godava_2',
        'godavari-tapered-jean-2',
        'The tapered jeans worn with white trainers, full length',
        'worn',
        'godavari-tapered-jean',
        1,
      ),
      image(
        'img_godava_3',
        'godavari-tapered-jean-3',
        'Close crop of the waistband, belt loops and front rise',
        'detail',
        'godavari-tapered-jean',
        2,
      ),
      image(
        'img_godava_4',
        'godavari-tapered-jean-4',
        'The jeans worn from the side, showing the taper to the ankle',
        'worn',
        'godavari-tapered-jean',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-21T09:00:00.000Z',
  },

  {
    id: 'prd_vaapsi_kaveri_chore',
    slug: 'kaveri-chore-jacket',
    sku: 'VP-NEW-1009',
    title: 'Kaveri Chore Jacket',
    brand: 'Vaapsi',
    category: 'outerwear',
    subcategory: 'Chore jacket',
    listingType: 'new',
    gender: 'unisex',
    color: DENIM_COLORS.raw,
    composition: '100% cotton',
    colorVariants: [
      {
        color: DENIM_COLORS.raw,
        sizes: SIZES_ALPHA,
        availability: 'available',
        priceInr: null,
        images: [],
      },
      {
        color: DENIM_COLORS.washedBlue,
        sizes: SIZES_ALPHA.filter((size) => size.normalized !== 'xs'),
        availability: 'available',
        priceInr: null,
        images: [],
      },
    ],
    condition: null,
    conditionNotes: null,
    flaws: [],
    measurements: { chest: 114, shoulder: 48, length: 70, sleeveLength: 62 },
    size: { label: 'L', system: 'IN', normalized: 'l' },
    priceInr: rupees(5_400),
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_kaveri_1',
        'kaveri-chore-jacket-1',
        'Raw indigo chore jacket worn open over a shirt, upper body, front',
        'primary',
        'kaveri-chore-jacket',
        0,
      ),
      image(
        'img_kaveri_2',
        'kaveri-chore-jacket-2',
        'The chore jacket worn buttoned, full length, front',
        'worn',
        'kaveri-chore-jacket',
        1,
      ),
      image(
        'img_kaveri_3',
        'kaveri-chore-jacket-3',
        'Close crop of the patch pockets and the printed inner facing',
        'detail',
        'kaveri-chore-jacket',
        2,
      ),
      image(
        'img_kaveri_4',
        'kaveri-chore-jacket-4',
        'The jacket held open to show the lining and the inside seams',
        'worn',
        'kaveri-chore-jacket',
        3,
      ),
    ],
    passportId: null,
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-20T09:00:00.000Z',
  },
]
