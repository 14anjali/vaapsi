import type { Provenance } from '@/lib/types'
import { isHumanChecked, isMachineGenerated, provenanceRank } from '../provenance'

const all: Provenance[] = ['verified', 'supplier', 'self_declared', 'ai_extracted', 'ai_suggested']

describe('provenanceRank', () => {
  it('ranks verified most trustworthy and ai_suggested least', () => {
    const sorted = [...all].sort((a, b) => provenanceRank(a) - provenanceRank(b))
    expect(sorted[0]).toBe('verified')
    expect(sorted.at(-1)).toBe('ai_suggested')
  })

  it('gives every provenance a distinct rank', () => {
    expect(new Set(all.map(provenanceRank)).size).toBe(all.length)
  })
})

describe('isHumanChecked', () => {
  it('is true only for verified and supplier', () => {
    expect(all.filter(isHumanChecked)).toEqual(['verified', 'supplier'])
  })
})

describe('isMachineGenerated', () => {
  it('is true only for the AI provenances', () => {
    expect(all.filter(isMachineGenerated)).toEqual(['ai_extracted', 'ai_suggested'])
  })
})
