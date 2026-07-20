import React from 'react';

type AssetType = 'stock' | 'etf' | 'unknown';

interface AssetTypeBadgeProps {
  assetType: AssetType;
}

export function AssetTypeBadge({ assetType }: AssetTypeBadgeProps) {
  const styles: Record<AssetType, { bg: string; text: string; label: string }> = {
    stock: {
      bg: 'bg-amber-500',
      text: 'text-slate-900',
      label: 'STOCK'
    },
    etf: {
      bg: 'bg-slate-400',
      text: 'text-slate-900',
      label: 'ETF'
    },
    unknown: {
      bg: 'bg-slate-600',
      text: 'text-slate-100',
      label: 'UNKNOWN'
    }
  };

  const style = styles[assetType];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${style.bg} ${style.text}`}
      title={`Asset Type: ${style.label}`}
    >
      {style.label}
    </span>
  );
}
