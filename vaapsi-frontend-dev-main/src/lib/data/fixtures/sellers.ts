import type { Seller } from '@/lib/types'

/**
 * Fixture sellers. Private to `lib/data` — an ESLint rule blocks imports of
 * this file from anywhere else.
 */
export const sellers: readonly Seller[] = [
  {
    id: 'sel_vaapsi_studio',
    handle: 'vaapsi-studio',
    displayName: 'Vaapsi Studio',
    location: { city: 'New Delhi', state: 'Delhi' },
    avatarUrl: null,
    isVerified: true,
    memberSince: '2025-11-04T00:00:00.000Z',
    listingsCount: 214,
    isVaapsi: true,
  },
  {
    id: 'sel_meher_k',
    handle: 'meher-k',
    displayName: 'Meher',
    location: { city: 'Bengaluru', state: 'Karnataka' },
    avatarUrl: null,
    isVerified: true,
    memberSince: '2026-01-19T00:00:00.000Z',
    listingsCount: 11,
    isVaapsi: false,
  },
  {
    id: 'sel_ananya_r',
    handle: 'ananya-r',
    displayName: 'Ananya',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    avatarUrl: null,
    isVerified: true,
    memberSince: '2025-12-02T00:00:00.000Z',
    listingsCount: 6,
    isVaapsi: false,
  },
  {
    id: 'sel_devika_s',
    handle: 'devika-s',
    displayName: 'Devika',
    location: { city: 'Kolkata', state: 'West Bengal' },
    avatarUrl: null,
    // Unverified on purpose — the seller-level verification mark has to have an
    // off state, or it reads as decoration rather than as information.
    isVerified: false,
    memberSince: '2026-06-28T00:00:00.000Z',
    listingsCount: 2,
    isVaapsi: false,
  },
]
