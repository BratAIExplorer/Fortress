import { scoreEmergingGrowth, getEmergingGrowthStocks, Stock } from './emerging-growth-scorer'

describe('scoreEmergingGrowth', () => {
  // Valid Cases - Should Score High

  test('ZEN: scores 8.0 QS with strong growth metrics', () => {
    const stock: Stock = {
      symbol: 'ZEN',
      name: 'ZEN Technologies',
      growth_rate: 0.32,
      roce: 0.18,
      pe_ratio: 18,
      margin_delta: 150,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(8.0)
  })

  test('KAYNES: scores 8.5 QS with best-in-class quality', () => {
    const stock: Stock = {
      symbol: 'KAYNES',
      name: 'Kaynes Technology',
      growth_rate: 0.35,
      roce: 0.20,
      pe_ratio: 17,
      margin_delta: 180,
      market_cap_crores: 2000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(8.5)
  })

  test('JUPITER: scores 7.5 QS with marginal margin but good other metrics', () => {
    const stock: Stock = {
      symbol: 'JUPWAG',
      name: 'Jupiter Wagons',
      growth_rate: 0.28,
      roce: 0.16,
      pe_ratio: 14,
      margin_delta: 80,
      market_cap_crores: 500,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(7.5)
  })

  // Edge Cases - Boundary Testing

  test('At minimum thresholds: growth=25%, ROCE=15%, P/E=20, margin=0 → 6.5 QS', () => {
    const stock: Stock = {
      symbol: 'BOUNDARY',
      name: 'Boundary Test',
      growth_rate: 0.25,
      roce: 0.15,
      pe_ratio: 20,
      margin_delta: 0,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(6.5)
  })

  test('Growth below minimum: 24.9% growth fails to hit 25% threshold', () => {
    const stock: Stock = {
      symbol: 'LOWGROWTH',
      name: 'Low Growth',
      growth_rate: 0.249,
      roce: 0.20,
      pe_ratio: 10,
      margin_delta: 200,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(7.0) // 0 + 25 + 25 + 20 = 70 → 7.0
  })

  test('ROCE below minimum: 14.9% ROCE fails 15% threshold', () => {
    const stock: Stock = {
      symbol: 'LOWROCE',
      name: 'Low ROCE',
      growth_rate: 0.30,
      roce: 0.149,
      pe_ratio: 15,
      margin_delta: 100,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(6.5) // 25 + 0 + 25 + 15 = 65 → 6.5
  })

  test('P/E above maximum: 21 P/E gets zero valuation points', () => {
    const stock: Stock = {
      symbol: 'EXPENSIVE',
      name: 'Expensive Stock',
      growth_rate: 0.35,
      roce: 0.20,
      pe_ratio: 21,
      margin_delta: 200,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(7.0) // 25 + 25 + 0 + 20 = 70 → 7.0
  })

  test('Negative margin: -50bps compression gets zero margin points', () => {
    const stock: Stock = {
      symbol: 'MARGINCOMPRESS',
      name: 'Margin Compression',
      growth_rate: 0.30,
      roce: 0.15,
      pe_ratio: 15,
      margin_delta: -50,
      market_cap_crores: 1000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(7.0) // 25 + 20 + 25 + 0 = 70 → 7.0
  })

  // Negative Cases - Should NOT Qualify (Below 6.5)

  test('HDFC: mature stock scores 1.0 QS (below min_qs_score)', () => {
    const stock: Stock = {
      symbol: 'HDFC',
      name: 'HDFC Bank',
      growth_rate: 0.08,
      roce: 0.14,
      pe_ratio: 28,
      margin_delta: 10,
      market_cap_crores: 50000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(1.0) // 0 + 0 + 0 + 10 = 10 → 1.0
    expect(score).toBeLessThan(6.5)
  })

  test('TCS: mature IT services scores 2.5 QS despite excellent ROCE', () => {
    const stock: Stock = {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      growth_rate: 0.12,
      roce: 0.45,
      pe_ratio: 22,
      margin_delta: -30,
      market_cap_crores: 150000,
    }

    const score = scoreEmergingGrowth(stock)
    expect(score).toBe(2.5) // 0 + 25 + 0 + 0 = 25 → 2.5
    expect(score).toBeLessThan(6.5)
  })
})

describe('getEmergingGrowthStocks', () => {
  test('filters stocks by min_qs_score and returns top 10 sorted descending', () => {
    const stocks: Stock[] = [
      {
        symbol: 'ZEN',
        name: 'ZEN Technologies',
        growth_rate: 0.32,
        roce: 0.18,
        pe_ratio: 18,
        margin_delta: 150,
        market_cap_crores: 1000,
      },
      {
        symbol: 'KAYNES',
        name: 'Kaynes Technology',
        growth_rate: 0.35,
        roce: 0.20,
        pe_ratio: 17,
        margin_delta: 180,
        market_cap_crores: 2000,
      },
      {
        symbol: 'HDFC',
        name: 'HDFC Bank',
        growth_rate: 0.08,
        roce: 0.14,
        pe_ratio: 28,
        margin_delta: 10,
        market_cap_crores: 50000,
      },
      {
        symbol: 'JUPWAG',
        name: 'Jupiter Wagons',
        growth_rate: 0.28,
        roce: 0.16,
        pe_ratio: 14,
        margin_delta: 80,
        market_cap_crores: 500,
      },
    ]

    const result = getEmergingGrowthStocks(stocks)

    // Should filter out HDFC (1.0 QS < 6.5)
    expect(result.length).toBe(3)
    expect(result.map(s => s.symbol)).toEqual(['KAYNES', 'ZEN', 'JUPWAG'])

    // Should be sorted descending by score
    expect(result[0].qs_score).toBe(8.5) // KAYNES
    expect(result[1].qs_score).toBe(8.0) // ZEN
    expect(result[2].qs_score).toBe(7.5) // JUPITER
  })

  test('respects top_n limit (returns max 10 stocks)', () => {
    const stocks: Stock[] = Array.from({ length: 20 }, (_, i) => ({
      symbol: `STOCK${i}`,
      name: `Stock ${i}`,
      growth_rate: 0.30 + (i * 0.001),
      roce: 0.16,
      pe_ratio: 15,
      margin_delta: 100,
      market_cap_crores: 1000 + (i * 100),
    }))

    const result = getEmergingGrowthStocks(stocks)

    expect(result.length).toBeLessThanOrEqual(10)
  })

  test('filters by market cap constraints (300-10000 Cr)', () => {
    const stocks: Stock[] = [
      {
        symbol: 'SMALL',
        name: 'Too Small',
        growth_rate: 0.30,
        roce: 0.16,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 200, // Below 300 min
      },
      {
        symbol: 'GOOD',
        name: 'Good Cap',
        growth_rate: 0.30,
        roce: 0.16,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 1000, // In range
      },
      {
        symbol: 'HUGE',
        name: 'Too Huge',
        growth_rate: 0.30,
        roce: 0.16,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 15000, // Above 10000 max
      },
    ]

    const result = getEmergingGrowthStocks(stocks)

    expect(result.length).toBe(1)
    expect(result[0].symbol).toBe('GOOD')
  })

  test('empty array returns empty result', () => {
    const stocks: Stock[] = []
    const result = getEmergingGrowthStocks(stocks)
    expect(result).toEqual([])
  })

  test('all stocks below min_qs_score returns empty result', () => {
    const stocks: Stock[] = [
      {
        symbol: 'BAD1',
        name: 'Bad Stock 1',
        growth_rate: 0.10,
        roce: 0.10,
        pe_ratio: 30,
        margin_delta: -50,
        market_cap_crores: 1000,
      },
      {
        symbol: 'BAD2',
        name: 'Bad Stock 2',
        growth_rate: 0.12,
        roce: 0.12,
        pe_ratio: 25,
        margin_delta: 0,
        market_cap_crores: 1000,
      },
    ]

    const result = getEmergingGrowthStocks(stocks)
    expect(result).toEqual([])
  })
})
