type AssetType = 'stock' | 'etf' | 'unknown';

const ASSET_TYPE_CACHE = new Map<string, { type: AssetType; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function detectAssetType(ticker: string): Promise<AssetType> {
  const normalized = ticker.toUpperCase();

  // Check cache first
  const cached = ASSET_TYPE_CACHE.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.type;
  }

  try {
    // Try ETF detection first
    const etfResponse = await fetch(`/api/analysis/etf-metrics?ticker=${normalized}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (etfResponse.ok) {
      const result: AssetType = 'etf';
      ASSET_TYPE_CACHE.set(normalized, { type: result, timestamp: Date.now() });
      return result;
    }

    // Fallback to stock detection (existing gem-score endpoint)
    const stockResponse = await fetch(`/api/analysis/gem-score?ticker=${normalized}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (stockResponse.ok) {
      const result: AssetType = 'stock';
      ASSET_TYPE_CACHE.set(normalized, { type: result, timestamp: Date.now() });
      return result;
    }

    // Neither endpoint succeeded
    const result: AssetType = 'unknown';
    ASSET_TYPE_CACHE.set(normalized, { type: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.warn(`[detectAssetType] Error detecting asset type for ${normalized}:`, error);
    return 'unknown';
  }
}

export function clearAssetTypeCache() {
  ASSET_TYPE_CACHE.clear();
}
