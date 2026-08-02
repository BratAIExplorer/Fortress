# Research Brief: The "Boring Parameter That Always Works"

**Date:** August 1, 2026
**Requested by:** Bharat Samant
**Question:** Is there a simple, boring rule (like the MACD bot) that always makes money in US markets and liquid ETFs?
**Short answer:** No. But four boring things come close, and one of them is nearly a law of physics.
**Confidence:** High on the evidence. Low on any claim of "always."

---

## 1. The Blunt Part First

Your premise has a hole. **Nothing "always works."** Every published rule has:

- A **worst decade** where it loses to doing nothing
- **Decay after publication** — McLean & Pontiff found ~50% of anomaly alpha disappears once a paper is published, as traders arbitrage it away ([source](https://arxiv.org/pdf/2512.11913))
- The momentum factor returned ~10%/yr in the 1990s. Today it's closer to ~2%/yr. Same rule. Crowded.

If a rule always worked, everyone would do it, and it would stop working. That's the whole game.

**What DOES exist:** rules that work *most of the time over long horizons*, and rules that reduce pain rather than raise returns. Those are worth building. "Always" is not.

---

## 2. The Four Candidates, Ranked by How Boring and Reliable They Are

### 🥇 #1 — COST. The only thing that works 100% of the time.
**Rule:** Pick the cheapest fund tracking the same index.

Morningstar (Kinnel, 2016) tested every variable they had. **Expense ratio beat every other predictor of future returns — including past performance.**

| Category | Success rate, cheapest 20% | Success rate, priciest 20% |
|---|---|---|
| International equity | 51% | 21% |
| Taxable bonds | 59% | 17% |

Why it's unbeatable: it's arithmetic, not a prediction. A 0.03% fee vs 1.0% fee is a **guaranteed** 0.97%/yr head start, forever. No backtest required.

**This is the answer to your literal question.** It's the most boring parameter in finance and it never stops working.

---

### 🥈 #2 — TIME IN MARKET. Boring, near-certain, needs patience.
**Rule:** Buy a broad index, hold 20+ years, add monthly.

Every 20-year rolling window in S&P 500 history has ended **positive in nominal terms** — including windows starting right before 1929, 2000, and 2008.

⚠️ **Honest caveat I have to flag:** that's *nominal*. Sources disagree on the worst window — some cite +6.4%/yr as the floor, others cite a 1948-ending window at just **2.4% nominal / 0.6% real**. After inflation, 20-year windows have come close to zero. "Never lost money" is a marketing line, not a fact. Real returns have been near-flat in the worst stretches.

---

### 🥉 #3 — TREND (200-day SMA). Doesn't make more money. Makes less pain.
**Rule:** Hold SPY when price > 200-day SMA. Move to cash/T-bills when below.

This is the closest thing to your MACD bot, and it's the most-studied simple rule in existence (Faber 2006, Siegel on the Dow 1886–2006, Moskowitz/Ooi/Pedersen 2012 across equities, FX, commodities, bonds).

**But here's the number that matters — since 2010:**

| | 200-SMA timing | Buy & hold |
|---|---|---|
| CAGR | 8.5% | **12.8%** |
| Max drawdown | **19%** | 34% |

It **lost to doing nothing by 4.3%/yr for 15 years.** Why? The S&P has been above its 200-day ~85% of the time since 2010. You get whipsawed. Since 1960 only **~28% of the 187 crossover trades were winners**.

**Verdict:** trend-following is drawdown insurance, not an alpha engine. You pay a premium (lower returns in bull markets) to get a payout (smaller crashes). That's a legitimate product — just don't sell it as "outperforms."

---

### #4 — MOMENTUM (12-1). Real signal. Dangerous implementation.
**Rule:** Buy what went up over the last 12 months (skipping the most recent month).

The academic 12-1 long/short strategy on S&P 500, March 2006–Dec 2024: **–2.79%/yr, Sharpe –0.23, max drawdown –81%.**

But decompose it:
- **Long leg (buy winners): +7.9%/yr** ✅
- **Short leg (short losers): –9.1%/yr** ❌

**The signal is real. The shorting kills you** during momentum crashes (violent bear-market rebounds).

**Takeaway for Fortress:** long-only momentum is defensible. Never short losers.

**Dual Momentum (Antonacci GEM)** — combines relative + absolute momentum. Backtest 1974–2013: 17.4%/yr, 0.87 Sharpe. Live, out-of-sample **2014–2021: underperformed buy-and-hold.** Classic in-sample-glory / out-of-sample-shrug.

---

## 3. What Actually Holds Up Across Markets

Factor replication studies across **93 countries, 153 factors: ~82% replicate** globally — though Hou/Xue/Zhang's stricter test put it at only 35%. Profitability, investment, and size were the *weakest* replicators.

Translation: momentum and value travel internationally. Profitability/quality is shakier than the marketing suggests.

---

## 4. ETF Mapping — US vs Ireland (relevant for your NRI/Malaysia audience)

**Structure beats strategy for your users.** This is a bigger, more certain edge than any signal above.

| | US-domiciled (SPY, VOO) | Irish UCITS (CSPX, VUAA, VWRA) |
|---|---|---|
| US dividend withholding | **30%** for non-treaty non-residents | **15%** (US–Ireland treaty) |
| US estate tax | Yes — exemption only **~$60,000** | **No** — not US-situs assets |
| Accumulating share class | Rare | Yes (auto-reinvests, no dividend leakage) |

For a Malaysia-based NRI holding a US S&P 500 ETF, a 15-percentage-point withholding difference on a ~1.3% dividend yield ≈ **~0.2%/yr recovered, guaranteed**, plus removal of a real estate-tax exposure above $60k.

**Liquid Irish UCITS tickers (LSE, USD):** CSPX (S&P 500, acc), VUAA (S&P 500, acc), VWRA (FTSE All-World, acc), IWDA (Developed World, acc).

---

## 5. Recommendation for Fortress Intelligence

Don't build another signal bot. Build the **boring layer** — it's differentiated *because* nobody markets it.

| Priority | Feature | Why |
|---|---|---|
| 1 | **Cost & Structure Checker** — user enters holdings, tool shows fee drag + withholding-tax leakage + US/Irish domicile fix | 100% reliable edge. Zero backtest risk. Nobody else does this for NRIs. Directly on-brand with your transparency principle. |
| 2 | **Trend as a risk badge, not a buy signal** — show "above/below 200-SMA" as a drawdown-risk indicator on Fortress 30 | Honest framing. Uses data you already fetch. No new infra. |
| 3 | **Long-only momentum tilt** in Fortress 30 ranking | 12-1 long leg is +7.9%/yr. You already compute SMA/RSI. Never add a short leg. |
| 4 | ❌ **Do NOT** ship a "this always wins" bot | Regulatory and reputational suicide, and it's false. |

---

## 6. Gaps & Unknowns

- The worst-20-year-window figure is **contradictory across sources** (2.4% vs 6.4% nominal). Needs a primary-source check against Shiller's dataset before publishing to users.
- No live, audited track record found for any retail MACD bot outperforming SPY net of costs and taxes.
- Post-2024 factor data is thin; decay may have continued.
- Malaysia-specific tax treatment of Irish UCITS distributions not verified here — needs a tax professional.

⚠️ **Not financial advice.** I'm not a licensed advisor. Everything above is historical research; past performance does not predict future results. Verify tax treatment with a qualified professional before acting.

---

## Sources

1. [Morningstar — Fund Fees Predict Future Success or Failure](https://www.morningstar.com/funds/fund-fees-predict-future-success-or-failure) — expense ratio as top predictor
2. [Morningstar — Predictive Power of Fees (PDF)](https://assets.contentstack.io/v3/assets/blt4eb669caa7dc65b2/blt70866588660aea5a/60416664f9638443346d4e9b/predictive-power-of-fees.pdf) — success-ratio quintile data
3. [Faber — A Quantitative Approach to Tactical Asset Allocation (PDF)](https://mebfaber.com/wp-content/uploads/2016/05/SSRN-id962461.pdf) — 10-month/200-day trend model
4. [QuantifiedStrategies — 200-Day MA Trading Strategy Backtest](https://www.quantifiedstrategies.com/200-day-moving-average-trading-strategy/) — post-2010 CAGR and win-rate data
5. [Alvarez Quant Trading — Reducing Whipsaws with the 200-day MA](https://alvarezquanttrading.com/blog/reducing-whipsaws-when-using-200-day-moving-average-for-market-timing/) — whipsaw frequency
6. [SSRN — Evaluating a 12-1 Month Momentum Strategy (2005–2024)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5367656) — long/short leg decomposition
7. [arXiv — Not All Factors Crowd Equally: Alpha Decay](https://arxiv.org/pdf/2512.11913) — post-publication decay, momentum 10%→2%
8. [Antonacci — Extended Backtest of Global Equities Momentum](https://www.optimalmomentum.com/extended-backtest-of-global-equities-momentum/) — GEM in-sample results
9. [ThinkNewfound — Fragility Case Study: Dual Momentum GEM](https://blog.thinknewfound.com/2019/01/fragility-case-study-dual-momentum-gem/) — parameter fragility
10. [Alpha Architect — Factors are Global, Respectable and Repeatable](https://alphaarchitect.com/factors-are-global-respectable-and-repeatable/) — 93-country replication
11. [Hou, Xue & Zhang — Replicating Anomalies (PDF)](https://www.ivey.uwo.ca/media/3776713/zhang_.pdf) — the stricter 35% replication finding
12. [State Street — US-domiciled ETFs vs Irish UCITS for non-US investors](https://www.ssga.com/us/en/institutional/insights/considerations-for-non-us-investors-us-etfs-vs-irish-ucits) — withholding tax
13. [Bogleheads — Nonresident alien investors and Ireland domiciled ETFs](https://www.bogleheads.org/wiki/Nonresident_alien_investors_and_Ireland_domiciled_ETFs) — estate tax, $60k exemption
14. [Fidelity — S&P 500 average return](https://www.fidelity.com/learning-center/trading-investing/sp-500-average-return) — rolling-period context
