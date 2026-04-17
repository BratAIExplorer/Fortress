export interface SectorWeights {
  [key: string]: number;
}

export function normalizeWeights(weights: SectorWeights): SectorWeights {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized: SectorWeights = {};
  for (const k in weights) {
    normalized[k] = weights[k] / sum;
  }
  return normalized;
}

export function calculateSectorWeights(
  userPreferences: string[],
  macro: any,
  intelligence: any,
  totalEquityAllocation: number
): SectorWeights {
  let weights: SectorWeights = {};
  
  if (userPreferences && userPreferences.length > 0) {
    userPreferences.forEach(sector => {
      weights[sector] = totalEquityAllocation / userPreferences.length;
    });
  } else {
    weights = {
      "tech": 0.20,
      "healthcare": 0.15,
      "finance": 0.15,
      "industrials": 0.12,
      "consumer": 0.12,
      "energy": 0.08,
      "utilities": 0.08,
      "materials": 0.10
    };
  }
  
  if (intelligence.sectorRotation?.trend === "into_growth") {
    weights["tech"] = (weights["tech"] || 0) + 5;
    weights["utilities"] = (weights["utilities"] || 0) - 5;
  } else if (intelligence.sectorRotation?.trend === "into_defensives") {
    weights["utilities"] = (weights["utilities"] || 0) + 5;
    weights["tech"] = (weights["tech"] || 0) - 5;
  }
  
  if (macro.vixIndex?.current > 25) {
    weights["healthcare"] = (weights["healthcare"] || 0) + 3;
    weights["utilities"] = (weights["utilities"] || 0) + 3;
    weights["tech"] = (weights["tech"] || 0) - 3;
    weights["consumer"] = (weights["consumer"] || 0) - 3;
  }
  
  // ensure no negative weights before normalisation
  for (let k in weights) {
      if (weights[k] < 0) weights[k] = 0;
  }
  
  return normalizeWeights(weights);
}
