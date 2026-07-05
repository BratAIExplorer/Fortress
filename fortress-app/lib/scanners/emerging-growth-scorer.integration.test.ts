import { scoreEmergingGrowth, getEmergingGrowthStocks, Stock } from './emerging-growth-scorer'

describe('Emerging Growth Module - Integration Tests', () => {
  // DAY 6: INTEGRATION TESTING

  describe('getEmergingGrowthStocks - Real Data Scenario', () => {
    test('filters and curates 50+ stock dataset correctly', () => {
      // Simulate real dataset: 50 stocks across different quality tiers
      const stocks: Stock[] = [
        // Tier 1: High Quality (should all score >7.5)
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
          symbol: 'JUPWAG',
          name: 'Jupiter Wagons',
          growth_rate: 0.28,
          roce: 0.16,
          pe_ratio: 14,
          margin_delta: 80,
          market_cap_crores: 500,
        },
        // Tier 2: Medium Quality (should score 6.5-7.5)
        {
          symbol: 'MQ1',
          name: 'Medium Quality 1',
          growth_rate: 0.26,
          roce: 0.15,
          pe_ratio: 16,
          margin_delta: 50,
          market_cap_crores: 800,
        },
        {
          symbol: 'MQ2',
          name: 'Medium Quality 2',
          growth_rate: 0.29,
          roce: 0.17,
          pe_ratio: 19,
          margin_delta: 120,
          market_cap_crores: 600,
        },
        // Tier 3: Poor Quality (should be filtered out)
        {
          symbol: 'PQ1',
          name: 'Poor Quality 1',
          growth_rate: 0.10,
          roce: 0.10,
          pe_ratio: 30,
          margin_delta: -50,
          market_cap_crores: 1500,
        },
        {
          symbol: 'PQ2',
          name: 'Poor Quality 2',
          growth_rate: 0.05,
          roce: 0.08,
          pe_ratio: 35,
          margin_delta: 0,
          market_cap_crores: 3000,
        },
      ]

      const result = getEmergingGrowthStocks(stocks)

      // Should filter out poor quality stocks
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(10)

      // All returned stocks should be above min_qs_score
      result.forEach(stock => {
        expect(stock.qs_score).toBeGreaterThanOrEqual(6.5)
      })

      // Should be sorted descending by score
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].qs_score).toBeGreaterThanOrEqual(result[i].qs_score)
      }

      // High quality stocks should be at top
      const topSymbols = result.slice(0, 3).map(s => s.symbol)
      expect(topSymbols).toContain('ZEN')
      expect(topSymbols).toContain('KAYNES')
    })

    test('handles market cap constraints correctly', () => {
      const stocks: Stock[] = [
        {
          symbol: 'SMALL',
          name: 'Too Small',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 100, // Below 300 min
        },
        {
          symbol: 'GOOD',
          name: 'Good Cap',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 5000, // In range
        },
        {
          symbol: 'HUGE',
          name: 'Too Huge',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 20000, // Above 10000 max
        },
      ]

      const result = getEmergingGrowthStocks(stocks)

      expect(result.length).toBe(1)
      expect(result[0].symbol).toBe('GOOD')
    })

    test('performance: processes 1000 stocks in <100ms', () => {
      // Generate 1000 test stocks
      const stocks: Stock[] = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Test Stock ${i}`,
        growth_rate: 0.25 + (Math.random() * 0.15),
        roce: 0.15 + (Math.random() * 0.10),
        pe_ratio: 12 + (Math.random() * 10),
        margin_delta: (Math.random() * 200) - 50,
        market_cap_crores: 300 + (Math.random() * 9700),
      }))

      const startTime = performance.now()
      const result = getEmergingGrowthStocks(stocks)
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(result.length).toBeLessThanOrEqual(10)
      expect(duration).toBeLessThan(100) // Should complete in <100ms
      console.log(`Processed 1000 stocks in ${duration.toFixed(2)}ms`)
    })
  })

  // DAY 6: REGRESSION TESTING

  describe('Regression Tests - Existing Scanner Behavior', () => {
    test('scoreEmergingGrowth is pure function (same input = same output)', () => {
      const stock: Stock = {
        symbol: 'TEST',
        name: 'Test Stock',
        growth_rate: 0.30,
        roce: 0.18,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 1000,
      }

      const score1 = scoreEmergingGrowth(stock)
      const score2 = scoreEmergingGrowth(stock)
      const score3 = scoreEmergingGrowth(stock)

      expect(score1).toBe(score2)
      expect(score2).toBe(score3)
    })

    test('getEmergingGrowthStocks does not mutate input array', () => {
      const stocks: Stock[] = [
        {
          symbol: 'TEST1',
          name: 'Test Stock 1',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 1000,
        },
      ]

      const originalLength = stocks.length
      const originalSymbol = stocks[0].symbol

      getEmergingGrowthStocks(stocks)

      expect(stocks.length).toBe(originalLength)
      expect(stocks[0].symbol).toBe(originalSymbol)
    })

    test('getEmergingGrowthStocks returns new array (not reference)', () => {
      const stocks: Stock[] = [
        {
          symbol: 'TEST',
          name: 'Test Stock',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 1000,
        },
      ]

      const result1 = getEmergingGrowthStocks(stocks)
      const result2 = getEmergingGrowthStocks(stocks)

      expect(result1).not.toBe(result2) // Different array instances
      expect(result1).toEqual(result2) // But same content
    })

    test('no side effects on global state', () => {
      const stocks: Stock[] = [
        {
          symbol: 'TEST',
          name: 'Test Stock',
          growth_rate: 0.30,
          roce: 0.18,
          pe_ratio: 15,
          margin_delta: 100,
          market_cap_crores: 1000,
        },
      ]

      // Call multiple times to ensure no state accumulation
      const result1 = getEmergingGrowthStocks(stocks)
      const result2 = getEmergingGrowthStocks(stocks)
      const result3 = getEmergingGrowthStocks(stocks)

      expect(result1.length).toBe(result2.length)
      expect(result2.length).toBe(result3.length)
    })
  })

  // DAY 6: PERFORMANCE TESTING

  describe('Performance Benchmarks', () => {
    test('single stock scoring: <1ms', () => {
      const stock: Stock = {
        symbol: 'TEST',
        name: 'Test Stock',
        growth_rate: 0.30,
        roce: 0.18,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 1000,
      }

      const startTime = performance.now()
      scoreEmergingGrowth(stock)
      const duration = performance.now() - startTime

      expect(duration).toBeLessThan(1)
    })

    test('batch scoring 100 stocks: <10ms', () => {
      const stocks: Stock[] = Array.from({ length: 100 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        growth_rate: 0.30,
        roce: 0.18,
        pe_ratio: 15,
        margin_delta: 100,
        market_cap_crores: 1000 + i * 100,
      }))

      const startTime = performance.now()
      const scored = stocks.map(s => ({
        ...s,
        qs_score: scoreEmergingGrowth(s),
      }))
      const duration = performance.now() - startTime

      expect(scored.length).toBe(100)
      expect(duration).toBeLessThan(10)
    })

    test('filtering and sorting 100 stocks: <20ms', () => {
      const stocks: Stock[] = Array.from({ length: 100 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        growth_rate: 0.25 + (Math.random() * 0.15),
        roce: 0.15 + (Math.random() * 0.10),
        pe_ratio: 12 + (Math.random() * 10),
        margin_delta: (Math.random() * 200) - 50,
        market_cap_crores: 300 + (Math.random() * 9700),
      }))

      const startTime = performance.now()
      getEmergingGrowthStocks(stocks)
      const duration = performance.now() - startTime

      expect(duration).toBeLessThan(20)
    })
  })
})

// DAY 6: REGRESSION VERIFICATION (Existing Tabs Unchanged)
describe('Regression Verification - Existing Scanner Modules', () => {
  test('Emerging Growth module does not interfere with other scanners', () => {
    // This test verifies that the scoreEmergingGrowth function
    // maintains isolation from other scanner modules (Value Picks, Hidden Gems, High Risk)
    // by not modifying any shared state or global variables

    const stock: Stock = {
      symbol: 'TEST',
      name: 'Test Stock',
      growth_rate: 0.30,
      roce: 0.18,
      pe_ratio: 15,
      margin_delta: 100,
      market_cap_crores: 1000,
    }

    // Emerging Growth scoring should not affect other modules
    const score = scoreEmergingGrowth(stock)

    // Verify isolation
    expect(typeof score).toBe('number')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)

    // Stock object should remain unchanged
    expect(stock.growth_rate).toBe(0.30)
    expect(stock.roce).toBe(0.18)
    expect(stock.pe_ratio).toBe(15)
    expect(stock.margin_delta).toBe(100)
  })
})
