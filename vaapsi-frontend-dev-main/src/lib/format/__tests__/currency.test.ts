import { discountPercent, formatInr, groupIndianDigits, rupees } from '../currency'

describe('groupIndianDigits', () => {
  it('leaves three digits or fewer alone', () => {
    expect(groupIndianDigits('0')).toBe('0')
    expect(groupIndianDigits('99')).toBe('99')
    expect(groupIndianDigits('999')).toBe('999')
  })

  it('groups the last three, then pairs', () => {
    expect(groupIndianDigits('1000')).toBe('1,000')
    expect(groupIndianDigits('99999')).toBe('99,999')
    expect(groupIndianDigits('100000')).toBe('1,00,000')
    expect(groupIndianDigits('120000')).toBe('1,20,000')
    expect(groupIndianDigits('10000000')).toBe('1,00,00,000')
  })
})

describe('formatInr', () => {
  it('formats whole rupees without decimals', () => {
    expect(formatInr(129900)).toBe('₹1,299')
    expect(formatInr(0)).toBe('₹0')
  })

  it('uses lakh grouping, not thousands grouping', () => {
    expect(formatInr(12000000)).toBe('₹1,20,000')
    expect(formatInr(12000000)).not.toBe('₹120,000')
  })

  it('shows paise only when there are paise', () => {
    expect(formatInr(129950)).toBe('₹1,299.50')
    expect(formatInr(129905)).toBe('₹1,299.05')
  })

  it('honours the paise mode', () => {
    expect(formatInr(129900, { paise: 'always' })).toBe('₹1,299.00')
    expect(formatInr(129950, { paise: 'never' })).toBe('₹1,300')
    expect(formatInr(129940, { paise: 'never' })).toBe('₹1,299')
  })

  it('can drop the symbol', () => {
    expect(formatInr(129900, { symbol: false })).toBe('1,299')
  })

  it('handles negatives', () => {
    expect(formatInr(-129900)).toBe('-₹1,299')
  })

  it('rejects floats, because money is never a float', () => {
    expect(() => formatInr(1299.5)).toThrow(/integer paise/)
  })

  it('rejects non-finite values', () => {
    expect(() => formatInr(Number.NaN)).toThrow(/finite/)
    expect(() => formatInr(Number.POSITIVE_INFINITY)).toThrow(/finite/)
  })
})

describe('rupees', () => {
  it('converts rupees to paise without float drift', () => {
    expect(rupees(1299)).toBe(129900)
    expect(rupees(1299.99)).toBe(129999)
    expect(rupees(0.1)).toBe(10)
  })
})

describe('discountPercent', () => {
  it('floors the saving', () => {
    expect(discountPercent(5000, 10000)).toBe(50)
    expect(discountPercent(6700, 10000)).toBe(33)
  })

  it('returns null when there is nothing honest to compare', () => {
    expect(discountPercent(5000, null)).toBeNull()
    expect(discountPercent(5000, 0)).toBeNull()
    expect(discountPercent(10000, 10000)).toBeNull()
    expect(discountPercent(12000, 10000)).toBeNull()
  })
})
