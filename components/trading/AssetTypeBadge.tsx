import React from 'react';

type AssetType = 'stock' | 'etf' | 'unknown';

interface AssetTypeBadgeProps {
  assetType: AssetType;
}

export function AssetTypeBadge({ assetType }: AssetTypeBadgeProps) {
  const styles: Record<AssetType, { bg: string; text: string; label: string }> = {
    stock: {
      bg: 'bg-primary',
      text: 'text-primary-foreground',
      label: 'STOCK'
    },
    etf: {
      bg: 'bg-accent',
      text: 'text-accent-foreground',
      label: 'ETF'
    },
    unknown: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
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
