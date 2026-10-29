import type { Provenance } from '@/lib/types'

/**
 * Trust ordering for provenance. Lower is more trustworthy.
 *
 * Kept here rather than inferred from the union's declaration order, so that
 * order is not load-bearing and reordering the type cannot silently change how
 * the UI ranks a claim.
 */
const RANK: Record<Provenance, number> = {
  verified: 0,
  supplier: 1,
  self_declared: 2,
  ai_extracted: 3,
  ai_suggested: 4,
}

export function provenanceRank(provenance: Provenance): number {
  return RANK[provenance]
}

/** Checked by a person or a named party, rather than inferred. */
export function isHumanChecked(provenance: Provenance): boolean {
  return provenance === 'verified' || provenance === 'supplier'
}

/** Anything a model produced. Drives the generated-content disclosure. */
export function isMachineGenerated(provenance: Provenance): boolean {
  return provenance === 'ai_extracted' || provenance === 'ai_suggested'
}
