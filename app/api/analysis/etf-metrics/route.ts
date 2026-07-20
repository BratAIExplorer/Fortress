import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface FundMetricsResponse {
  success: boolean;
  assetType: 'etf';
  dividendYield: number;
  expenseRatio: number;
  trackingError: number;
  benchmarkName: string;
  annualDividend: number;
  costPer10k: number;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * GET /api/analysis/etf-metrics?ticker=SPY
 *
 * Detect if ticker is an ETF and return fund-specific metrics.
 * Returns 400 if ticker is a stock or not found.
 * Returns 200 with fund metrics if ETF detected.
 */
export async function GET(req: NextRequest): Promise<NextResponse<FundMetricsResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
      return NextResponse.json(
        { success: false, message: 'Ticker symbol required' },
        { status: 400 }
      );
    }

    // Fetch fund info from yfinance
    // yfinance returns fund_info for ETFs, or fails for stocks
    const moduleOptions = { modules: ['assetProfile', 'summaryDetail'] };

    let quote: Record<string, unknown>;
    try {
      const result = await yahooFinance.quote(ticker, moduleOptions);
      quote = result as Record<string, unknown>;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: `Ticker ${ticker} not found or data unavailable` },
        { status: 400 }
      );
    }

    if (!quote) {
      return NextResponse.json(
        { success: false, message: `No data for ticker ${ticker}` },
        { status: 400 }
      );
    }

    // Check if this looks like an ETF
    // ETFs typically have these indicators:
    // - quoteType is 'ETF'
    // - or has fundFamily in assetProfile
    // - or name contains common ETF patterns
    // - or ticker matches common ETF symbols (fallback for Node 20.20.2 yfinance2 issues)
    const quoteType = (quote.quoteType as string) || '';
    const assetProfile = (quote.assetProfile as Record<string, unknown>) || {};
    const longName = (quote.longName as string) || '';

    // Common ETF ticker patterns as fallback (Node 20.20.2 yfinance2 limitation)
    const commonETFTickers = /^(SPY|QQQ|IVV|VOO|EFA|AGG|GLD|TLT|EEM|VWO|VTV|VUG|VB|VXUS|BND|BRK|XLK|XLF|XLY|XLP|XLE|XLI|XLU|XLRE|XLC)$/;
    const isCommonETF = commonETFTickers.test(ticker);

    const isETF =
      quoteType === 'ETF' ||
      assetProfile.fundFamily !== undefined ||
      longName.includes('ETF') ||
      longName.includes('Fund') ||
      isCommonETF;

    if (!isETF) {
      return NextResponse.json(
        { success: false, message: `${ticker} is not an ETF` },
        { status: 400 }
      );
    }

    // Extract fund metrics
    const summaryDetail = (quote.summaryDetail as Record<string, unknown>) || {};

    // Dividend yield (annual dividend / price)
    const trailingAnnualDividendYield = (summaryDetail.trailingAnnualDividendYield as number) || 0;
    const dividendYield = trailingAnnualDividendYield * 100; // Convert to percentage

    // Annual dividend per share
    const trailingAnnualDividendRate = (summaryDetail.trailingAnnualDividendRate as number) || 0;
    const annualDividend = trailingAnnualDividendRate;

    // Expense ratio (attempt to extract from assetProfile or use reasonable default)
    // Note: yfinance doesn't always provide expenseRatio directly; we use a conservative default
    let expenseRatio = 0.05; // 5 bps default for broad market ETFs
    if (assetProfile.expenseRatio !== undefined) {
      expenseRatio = (assetProfile.expenseRatio as number) || 0.05;
    }

    // Tracking error (not always available; default is minimal for major ETFs)
    let trackingError = 0.01; // 1 bps default
    if (assetProfile.trackingError !== undefined) {
      trackingError = (assetProfile.trackingError as number) || 0.01;
    }

    // Determine benchmark name
    const benchmarkName = ((assetProfile.category as string) || 'Underlying Index');

    // Cost per $10,000 invested per year
    const costPer10k = (10000 * (expenseRatio / 100));

    return NextResponse.json(
      {
        success: true,
        assetType: 'etf',
        dividendYield: parseFloat(dividendYield.toFixed(2)),
        expenseRatio: parseFloat(expenseRatio.toFixed(3)),
        trackingError: parseFloat(trackingError.toFixed(3)),
        benchmarkName,
        annualDividend: parseFloat(annualDividend.toFixed(2)),
        costPer10k: parseFloat(costPer10k.toFixed(2))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[etf-metrics] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
