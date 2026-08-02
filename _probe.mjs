import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance({ suppressNotices: ["ripHistorical"] });
try {
  const q = await yf.quoteSummary("KAYNES.NS", { modules: ["price","summaryDetail","defaultKeyStatistics","financialData"] });
  console.log("OK", q.price?.shortName, q.price?.regularMarketPrice, "mcap:", q.price?.marketCap);
  console.log("PE:", q.summaryDetail?.trailingPE, "fwdPE:", q.summaryDetail?.forwardPE);
  console.log("revGrowth:", q.financialData?.revenueGrowth, "ROE:", q.financialData?.returnOnEquity, "grossMargin:", q.financialData?.grossMargins, "opMargin:", q.financialData?.operatingMargins);
  console.log("avgVol10d:", q.price?.averageDailyVolume10Day, "avgVol3m:", q.summaryDetail?.averageVolume);
} catch(e){ console.log("ERR", e.message); }
