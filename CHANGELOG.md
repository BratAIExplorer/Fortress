# Fortress Intelligence — Changelog

## 2026-03-25

### Fixed
- **Scan reliability**: Added timeout guard on ThreadPoolExecutor —
  as_completed(timeout=120) + future.result(timeout=30). Prevents
  infinite hang when yfinance stalls on an NSE stock. Was causing 86%
  scan failure rate (6 of 7 scans stuck or crashed).

- **Data layer — FCF**: Added get_fcf_from_cashflow() helper.
  Calculates FCF = OCF minus CapEx directly from cashflow statement.
  yfinance freeCashflow field returns null for ~90% of NSE stocks.
  CapEx=None guard prevents overstating FCF when CapEx label missing.

- **Data layer — ROCE**: Added get_roce_from_statements() helper.
  Calculates ROCE = EBIT / (Total Assets minus Current Liabilities)
  from statements. Consistent with Coffee Can ROCE logic.

- **Info dict override**: Calculated values always override yfinance.
  yfinance values are unreliable even when present, not just missing.

### Known Issues / Next Sprint
- Sovereign Alpha (alpha_predictions table) not yet created.
  Learning loop is conceptual — zero historical outcome data collected.
- Sovereign Alpha outcome metric must track alpha vs benchmark (Nifty 50),
  not raw positive return. Current design will learn from noise.
- Promoter pledge / delivery % data unavailable (needs Trendlyne or NSE Bhavcopy).
- L3 labelled "Macro Tailwind" but measures Relative Strength (momentum).
  Rename pending.
- TAM table uses USD for domestic Indian stocks — distorts runway scores
  for NBFCs, local consumption, banking businesses.
- HDFC Bank compounding score = 0 — banking business model not captured
  by ROCE x reinvestment rate formula. Known limitation.
- No thesis invalidation signals — users have no signal when to exit.

### Audit Findings Status (external review 2026-03-24)
| Finding                          | Status                                      |
|----------------------------------|---------------------------------------------|
| yfinance data fragility          | Partially fixed — FCF/ROCE from statements  |
| Scan hang / reliability          | Fixed                                       |
| L3 misnaming                     | Noted, not yet renamed                      |
| Sovereign Alpha measurement flaw | Noted, not yet addressed                    |
| TAM currency mismatch            | Noted, not yet addressed                    |
| Missing thesis invalidation      | Not yet built                               |
| Sovereign Alpha table missing    | Not yet created                             |
