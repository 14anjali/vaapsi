import { sourced } from '@/lib/types'
import type { CareInstruction, Passport } from '@/lib/types'

/**
 * Five fixture passports, for five of the eight fixture garments.
 *
 * They vary along every axis the UI has to survive:
 *
 * - `isVoluntary` false on exactly one (the Acne skirt — a European brand with a
 *   real regulatory passport). Every other one is published by choice, and the
 *   UI must say so rather than implying regulatory backing it does not have.
 * - One passport (`nicobar`) carries **no** `impact` block, because there is no
 *   defensible basis for the numbers. The UI must render a passport without it.
 * - One passport (`levis`) carries **corrections**. The original declaration is
 *   still there, wrong, alongside the fix.
 * - One passport (`nicobar`) has `authentication.method === 'none'`.
 * - Provenance is mixed throughout, including `ai_extracted` and
 *   `self_declared`, so the source badges have something honest to show.
 *
 * Denim makes the chain more interesting than a general catalogue would, and
 * that is a fair reflection of the category: denim is the garment type people
 * keep longest, repair most and hand on most often. The lifecycle events are the
 * point rather than a formality.
 */

const REGISTRY = { name: 'EuFSI', url: 'https://registry.eufsi.example/lookup' }

/** Washed denim. The common case. */
const CARE_DENIM: readonly CareInstruction[] = [
  { code: 'wash_30_inside', label: 'Machine wash cold, inside out', icon: 'wash-30' },
  { code: 'no_bleach', label: 'Do not bleach', icon: 'no-bleach' },
  { code: 'no_tumble', label: 'Do not tumble dry', icon: 'no-tumble' },
  { code: 'iron_medium', label: 'Iron on medium heat', icon: 'iron-medium' },
]

/** Raw, unwashed denim. Different rules, and worth stating properly. */
const CARE_RAW_DENIM: readonly CareInstruction[] = [
  { code: 'wash_rarely', label: 'Wash rarely, cold, inside out', icon: 'wash-cold' },
  { code: 'no_bleach', label: 'Do not bleach', icon: 'no-bleach' },
  { code: 'dry_flat', label: 'Hang dry in shade', icon: 'dry-flat' },
  { code: 'expect_fade', label: 'Indigo will crock and fade with wear', icon: 'fade' },
]

/** Denim with hardware — bags, heavily riveted pieces. */
const CARE_DENIM_HARDWARE: readonly CareInstruction[] = [
  { code: 'spot_clean', label: 'Spot clean only', icon: 'spot-clean' },
  { code: 'no_bleach', label: 'Do not bleach', icon: 'no-bleach' },
  { code: 'no_machine', label: 'Do not machine wash', icon: 'no-machine' },
  { code: 'keep_dry', label: 'Keep the hardware dry', icon: 'keep-dry' },
]

export const passports: readonly Passport[] = [
  // ------------------------------------------------------------------ 1
  {
    id: 'psp_bhaane_trucker_indigo',
    productId: 'prd_bhaane_trucker_indigo',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-BH-2024-0009812',
    productNo: 'BH-TRK-OS-IND-M',
    dppVersion: '1.2',
    signedAt: '2026-08-14T06:12:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-14T06:12:00.000Z',

    placeOfOrigin: sourced('Kaithal, Haryana, India', 'supplier'),
    manufacturingCountry: sourced('India', 'supplier'),
    manufacturer: sourced('Arvind Mills, Ahmedabad', 'supplier'),

    materials: [
      {
        name: sourced('Organic cotton', 'supplier'),
        percentage: sourced(98, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced('Vidarbha, Maharashtra, India', 'supplier'),
      },
      {
        name: sourced('Elastane', 'supplier'),
        percentage: sourced(2, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced(null, 'self_declared'),
      },
    ],
    careInstructions: CARE_RAW_DENIM,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/denim',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-08-14T06:12:00.000Z',
      declaredBy: 'Vaapsi Studio, New Delhi',
      snapshot: {
        materials: [
          { name: 'Organic cotton', percentage: 98 },
          { name: 'Elastane', percentage: 2 },
        ],
        placeOfOrigin: 'Kaithal, Haryana, India',
        condition: 'pristine',
      },
    },
    corrections: [],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_bh_1',
        type: 'made',
        date: '2024-09-02',
        actor: 'Arvind Mills, Ahmedabad',
        note: 'Woven as selvedge on a shuttle loom. Left raw and unwashed at manufacture.',
        verification: sourced('Mill production record', 'supplier'),
      },
      {
        id: 'evt_bh_2',
        type: 'first_sold',
        date: '2024-11-18',
        actor: 'Bhaane, Khan Market, New Delhi',
        note: null,
        verification: sourced(
          'Original retail invoice supplied by the seller',
          'verified',
          '2026-08-13T10:04:00.000Z',
        ),
      },
      {
        id: 'evt_bh_3',
        type: 'owned',
        date: '2024-11-18',
        actor: 'First owner, New Delhi',
        note: 'Never worn. Bought a size down and never got round to exchanging it.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_bh_4',
        type: 'inspected',
        date: '2026-08-13',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Tags intact. No fade at the elbows or seat, no crocking on the interior — genuinely unworn.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-08-13T11:20:00.000Z',
        ),
      },
      {
        id: 'evt_bh_5',
        type: 'relisted',
        date: '2026-08-14',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-08-14T06:30:00.000Z'),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-08-13T11:20:00.000Z',
    },
    impact: {
      waterLitresSaved: 5_400,
      co2KgSaved: 14.2,
      basis:
        'Ellen MacArthur Foundation, A New Textiles Economy (2017) — cotton outerwear baseline, adjusted for Indian production. Compared against manufacturing one new equivalent jacket.',
    },
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'psp_levis_501_indigo',
    productId: 'prd_levis_501_indigo',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-LV-2021-0447190',
    productNo: '00501-3421-W30-L32',
    dppVersion: '1.2',
    signedAt: '2026-08-19T10:44:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-20T07:02:00.000Z',

    placeOfOrigin: sourced('Unknown — label removed before intake', 'self_declared'),
    manufacturingCountry: sourced('Bangladesh', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Cotton', 'ai_extracted'),
        percentage: sourced(99, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
      {
        name: sourced('Elastane', 'ai_extracted'),
        percentage: sourced(1, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_DENIM,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/denim',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-08-19T10:44:00.000Z',
      declaredBy: 'Meher, Bengaluru',
      snapshot: {
        // Wrong at first publication. Corrected below, not overwritten — this is
        // the whole reason the original declaration is immutable.
        materials: [{ name: 'Cotton', percentage: 100 }],
        manufacturingCountry: 'India',
        condition: 'very_good',
      },
    },
    corrections: [
      {
        id: 'cor_lv_1',
        correctedAt: '2026-08-20T07:02:00.000Z',
        correctedBy: 'Vaapsi Studio, New Delhi',
        field: 'materials',
        previousValue: [{ name: 'Cotton', percentage: 100 }],
        newValue: [
          { name: 'Cotton', percentage: 99 },
          { name: 'Elastane', percentage: 1 },
        ],
        reason:
          'Composition label read at intake shows 1% elastane. The seller had declared 100% cotton from memory.',
      },
      {
        id: 'cor_lv_2',
        correctedAt: '2026-08-20T07:04:00.000Z',
        correctedBy: 'Vaapsi Studio, New Delhi',
        field: 'condition',
        previousValue: 'very_good',
        newValue: 'good',
        reason:
          'Regraded down after inspection. Hem fraying and a paint fleck are documented as flaws.',
      },
    ],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_lv_1',
        type: 'made',
        date: '2021-03-01',
        actor: 'Contract manufacturer, Bangladesh',
        note: 'Month of manufacture read off the interior stamp. Day not legible.',
        verification: sourced('Interior stamp, photographed at intake', 'ai_extracted'),
      },
      {
        id: 'evt_lv_2',
        type: 'first_sold',
        date: '2021-06-12',
        actor: 'Retailer, Bengaluru',
        note: 'No invoice. The date is the owner recollection.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_lv_3',
        type: 'owned',
        date: '2021-06-12',
        actor: 'First owner, Bengaluru',
        note: 'Five years of regular wear. The fade is the result.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_lv_5',
        type: 'relisted',
        date: '2026-08-19',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-08-19T11:05:00.000Z'),
      },
      {
        id: 'evt_lv_4',
        type: 'inspected',
        date: '2026-08-20',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Regraded from very good to good. Two flaws documented and photographed.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-08-20T07:00:00.000Z',
        ),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-08-20T07:00:00.000Z',
    },
    impact: {
      waterLitresSaved: 3_781,
      co2KgSaved: 33.4,
      basis:
        'Levi Strauss & Co. Life Cycle Assessment of a Pair of 501 Jeans (2015), full-lifecycle figures. Compared against manufacturing one new equivalent pair.',
    },
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'psp_acne_denim_maxi_skirt',
    productId: 'prd_acne_denim_maxi_skirt',
    uniqueProductId: 'https://registry.eufsi.example/dpp/SE-ACN-2024-0918334',
    productNo: 'AC-DNM-SKT-WSH-38',
    dppVersion: '1.4',
    signedAt: '2024-08-30T00:00:00.000Z',
    // Brand-issued rather than Vaapsi-issued. The storefront must be able to
    // show that the record predates Vaapsi and was not written by us.
    issuer: 'Acne Studios',
    registry: REGISTRY,
    lastUpdated: '2026-07-30T09:00:00.000Z',

    placeOfOrigin: sourced('Okayama, Japan', 'supplier'),
    manufacturingCountry: sourced('Italy', 'supplier'),
    manufacturer: sourced('Manifattura Rossi, Vicenza', 'supplier'),

    materials: [
      {
        name: sourced('Organic cotton', 'supplier'),
        percentage: sourced(70, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced('Okayama, Japan', 'supplier'),
      },
      {
        name: sourced('Recycled cotton', 'supplier'),
        percentage: sourced(30, 'supplier'),
        isRecycled: sourced(true, 'supplier'),
        provenance: sourced('Post-industrial denim offcuts, Italy', 'supplier'),
      },
    ],
    careInstructions: CARE_DENIM,
    endOfLife: {
      recyclerLookupUrl: 'https://registry.eufsi.example/recyclers?material=cotton-denim',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2024-08-30T00:00:00.000Z',
      declaredBy: 'Acne Studios',
      snapshot: {
        materials: [
          { name: 'Organic cotton', percentage: 70 },
          { name: 'Recycled cotton', percentage: 30 },
        ],
        manufacturingCountry: 'Italy',
        placeOfOrigin: 'Okayama, Japan',
      },
    },
    corrections: [],
    // The one non-voluntary passport in the set: issued under EU regulation by
    // the brand, not published by choice by Vaapsi.
    isVoluntary: false,

    chain: [
      {
        id: 'evt_ac_1',
        type: 'made',
        date: '2024-08-30',
        actor: 'Manifattura Rossi, Vicenza, Italy',
        note: null,
        verification: sourced('Brand-issued passport at manufacture', 'supplier'),
      },
      {
        id: 'evt_ac_2',
        type: 'first_sold',
        date: '2024-11-06',
        actor: 'Acne Studios, Palladium, Mumbai',
        note: null,
        verification: sourced(
          'Original retail invoice supplied by the seller',
          'verified',
          '2026-07-29T09:30:00.000Z',
        ),
      },
      {
        id: 'evt_ac_3',
        type: 'owned',
        date: '2024-11-06',
        actor: 'First owner, Mumbai',
        note: 'Worn four or five times across one summer.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_ac_4',
        type: 'repaired',
        date: '2026-07-24',
        actor: 'Sunshine Dry Cleaners, Bandra, Mumbai',
        note: 'Professionally cleaned and pressed. No structural repair needed.',
        verification: sourced(
          'Cleaner receipt, photographed at intake',
          'verified',
          '2026-07-29T09:34:00.000Z',
        ),
      },
      {
        id: 'evt_ac_5',
        type: 'inspected',
        date: '2026-07-29',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Even wash, no rub-through at the seat, zip and button intact. Graded excellent.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-07-29T10:10:00.000Z',
        ),
      },
      {
        id: 'evt_ac_6',
        type: 'relisted',
        date: '2026-07-30',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-07-30T09:15:00.000Z'),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'brand_partner',
      verifiedBy: 'Acne Studios — passport signature validated against registry',
      verifiedAt: '2026-07-29T09:20:00.000Z',
    },
    impact: {
      waterLitresSaved: 6_800,
      co2KgSaved: 22.5,
      basis:
        'Textile Exchange Preferred Fiber & Materials Market Report (2023) — cotton denim baseline. Compared against manufacturing one new equivalent skirt.',
    },
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'psp_nicobar_chambray_shirtdress',
    productId: 'prd_nicobar_chambray_shirtdress',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-NB-2025-0221765',
    productNo: 'NB-SD-CHM-IND-L',
    dppVersion: '1.2',
    signedAt: '2026-08-21T04:20:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-21T04:20:00.000Z',

    placeOfOrigin: sourced('Tamil Nadu, India', 'ai_suggested'),
    manufacturingCountry: sourced('India', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Cotton chambray', 'ai_extracted'),
        percentage: sourced(100, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_DENIM,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/cotton',
      collectionPointUrl: null,
    },

    originalDeclaration: {
      declaredAt: '2026-08-21T04:20:00.000Z',
      declaredBy: 'Meher, Bengaluru',
      snapshot: {
        materials: [{ name: 'Cotton chambray', percentage: 100 }],
        manufacturingCountry: 'India',
        condition: 'very_good',
      },
    },
    corrections: [],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_nb_1',
        type: 'first_sold',
        date: '2025-04-19',
        actor: 'Nicobar online',
        note: 'Order confirmation supplied. Manufacture date not recorded anywhere on the garment.',
        verification: sourced('Order confirmation supplied by the seller', 'self_declared'),
      },
      {
        id: 'evt_nb_2',
        type: 'owned',
        date: '2025-04-19',
        actor: 'First owner, Bengaluru',
        note: 'One summer of regular wear.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_nb_3',
        type: 'relisted',
        date: '2026-08-21',
        actor: 'Vaapsi',
        note: 'Seller-listed. Not yet physically inspected by Vaapsi.',
        verification: sourced('Platform listing record', 'verified', '2026-08-21T04:40:00.000Z'),
      },
    ],
    ownersCount: 1,
    // Nobody has authenticated this one. The passport still has value — it has a
    // chain and a composition — but the UI must not imply verification.
    authentication: { method: 'none', verifiedBy: null, verifiedAt: null },
    // No `impact` block. There is no defensible basis for a chambray dress of
    // unknown origin, so no number is shown at all.
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'psp_diesel_denim_shoulder_bag',
    productId: 'prd_diesel_denim_shoulder_bag',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IT-DSL-2019-0663201',
    productNo: 'X09821-P5473-T6067',
    dppVersion: '1.1',
    signedAt: '2026-05-11T06:50:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-05-11T06:50:00.000Z',

    placeOfOrigin: sourced('Guangdong, China', 'ai_suggested'),
    manufacturingCountry: sourced('China', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Cotton denim', 'ai_extracted'),
        percentage: sourced(88, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
      {
        name: sourced('Cotton lining', 'ai_extracted'),
        percentage: sourced(12, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_DENIM_HARDWARE,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/denim',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-05-11T06:50:00.000Z',
      declaredBy: 'Vaapsi Studio, New Delhi',
      snapshot: {
        materials: [
          { name: 'Cotton denim', percentage: 88 },
          { name: 'Cotton lining', percentage: 12 },
        ],
        condition: 'well_loved',
        repairs: 1,
      },
    },
    corrections: [],
    isVoluntary: true,

    // The longest chain in the set: two owners, a return, a repair and a relist.
    // This is the shape that makes a passport worth reading.
    chain: [
      {
        id: 'evt_dl_1',
        type: 'first_sold',
        date: '2019-10-30',
        actor: 'Diesel, DLF Promenade, New Delhi',
        note: null,
        verification: sourced('Stated by the first owner at intake', 'self_declared'),
      },
      {
        id: 'evt_dl_2',
        type: 'owned',
        date: '2019-10-30',
        actor: 'First owner, Gurugram',
        note: 'Daily carry for five years.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_dl_3',
        type: 'returned',
        date: '2025-02-08',
        actor: 'Vaapsi collection, Gurugram',
        note: 'Returned to Vaapsi for repair and resale rather than discarded.',
        verification: sourced('Collection record', 'verified', '2025-02-08T00:00:00.000Z'),
      },
      {
        id: 'evt_dl_4',
        type: 'repaired',
        date: '2025-02-21',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Left strap anchor re-stitched in a matching thread. Deliberately visible rather than hidden.',
        verification: sourced(
          'Repair log, photographed before and after',
          'verified',
          '2025-02-21T00:00:00.000Z',
        ),
      },
      {
        id: 'evt_dl_5',
        type: 'owned',
        date: '2025-03-14',
        actor: 'Second owner, Pune',
        note: 'One year.',
        verification: sourced('Platform order record', 'verified', '2025-03-14T00:00:00.000Z'),
      },
      {
        id: 'evt_dl_6',
        type: 'returned',
        date: '2026-04-28',
        actor: 'Vaapsi collection, Pune',
        note: null,
        verification: sourced('Collection record', 'verified', '2026-04-28T00:00:00.000Z'),
      },
      {
        id: 'evt_dl_7',
        type: 'inspected',
        date: '2026-05-09',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Repair sound. Denim rubbed pale along the base edge. Graded well loved and priced for it.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-05-09T00:00:00.000Z',
        ),
      },
      {
        id: 'evt_dl_8',
        type: 'relisted',
        date: '2026-05-11',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-05-11T07:20:00.000Z'),
      },
    ],
    ownersCount: 2,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-05-09T00:00:00.000Z',
    },
    impact: {
      waterLitresSaved: 2_400,
      co2KgSaved: 9.6,
      basis:
        'Textile Exchange Preferred Fiber & Materials Market Report (2023) — cotton denim accessory baseline, plus one repair avoiding replacement. Compared against manufacturing one new equivalent bag.',
    },
  },
]
