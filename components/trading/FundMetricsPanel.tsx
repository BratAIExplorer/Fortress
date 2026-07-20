'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface FundMetrics {
  success: boolean;
  assetType: 'etf';
  dividendYield: number;
  expenseRatio: number;
  trackingError: number;
  benchmarkName: string;
  annualDividend: number;
  costPer10k: number;
}

interface FundMetricsPanelProps {
  ticker: string;
}

function MetricCard({
  label,
  value,
  context,
  status,
  statusType = 'neutral'
}: {
  label: string;
  value: string;
  context: string;
  status: string;
  statusType?: 'positive' | 'warning' | 'neutral';
}) {
  const statusColors = {
    positive: 'text-emerald-400',
    warning: 'text-amber-400',
    neutral: 'text-slate-400'
  };

  return (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-xs text-slate-500 mb-2">{context}</p>
      <p className={`text-xs font-medium ${statusColors[statusType]}`}>✓ {status}</p>
    </div>
  );
}

export function FundMetricsPanel({ ticker }: FundMetricsPanelProps) {
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/analysis/etf-metrics?ticker=${encodeURIComponent(ticker)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load fund metrics');
          setMetrics(null);
          return;
        }

        const data = (await response.json()) as FundMetrics;
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('[FundMetricsPanel] Error fetching ETF metrics:', err);
        setError('Unable to load fund metrics. Please try again.');
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchMetrics();
    }
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 animate-pulse">
        <p className="text-slate-400">Loading fund metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Fund Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Dividend Yield"
          value={`${metrics.dividendYield.toFixed(2)}%`}
          context={`Annual: $${metrics.annualDividend.toFixed(2)}/share`}
          status={metrics.dividendYield > 1.5 ? 'Above average' : 'Modest yield'}
          statusType={metrics.dividendYield > 1.5 ? 'positive' : 'neutral'}
        />

        <MetricCard
          label="Expense Ratio"
          value={`${metrics.expenseRatio.toFixed(3)}%`}
          context={`$${metrics.costPer10k.toFixed(0)} per $10K/year`}
          status={metrics.expenseRatio < 0.1 ? 'Ultra-low cost' : 'Reasonable cost'}
          statusType={metrics.expenseRatio < 0.1 ? 'positive' : 'neutral'}
        />

        <MetricCard
          label="Tracking Error"
          value={`${metrics.trackingError.toFixed(3)}%`}
          context={`vs. ${metrics.benchmarkName}`}
          status={metrics.trackingError < 0.05 ? 'Precise replication' : 'Minor drift'}
          statusType={metrics.trackingError < 0.05 ? 'positive' : 'neutral'}
        />
      </div>

      <p className="text-xs text-slate-500 italic mt-4">
        Fund metrics are refreshed periodically. Data sourced from fund provider disclosures.
      </p>
    </div>
  );
}
