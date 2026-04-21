# Backlog Card: Investment Genie — Personalised Research Brief
**ID:** GENIE-BRIEF-001  
**Status:** Ready for Development  
**Sprint Target:** Sprint 10 (parallel track, Month 2)  
**Owner:** Google Antigravity ID Agent (frontend) + Claude Code (data layer)  
**Created:** 2026-04-20  
**Reviewed by:** Bharat Samant (Product Owner)

---

## The Problem

The Investment Genie currently outputs a portfolio allocation — percentages, tickers, amounts.  
It does NOT explain *why*, *what the user will lose if they ignore tax structure*, or *what
could break the thesis*.

A user with a $10K bonus leaves the Genie with a number. They need to leave with **conviction**.

---

## The Solution

After the existing Genie output, surface a **"View Your Research Brief →"** CTA that expands
into a generated, profile-aware investment research document.

**Architecture decision:** Augment, don't replace. The quick allocation output stays. The brief
is a deeper layer for users who want context before executing.

```
[Current Genie Output — allocation table, unchanged]
        ↓
[View Your Research Brief →]  ← new CTA
        ↓
[Generated Brief — Sections A–F below]
```

---

## Competitive Context

Direct competitors in the NRI investment advisory space:
- **WealthMunshi** — DTAA compliance + India routing, 2–3 week onboarding, human advisory
- **iNRI** — India-only routing (PAN, NRE/NRO, India tax filing)
- **SBNRI** — India mutual funds, no US/MY/EM intelligence

**The gap Fortress occupies:** No platform today combines live multi-market intelligence
(US + India + Malaysia + EM + Gold) with nationality × residence tax profiling to generate
an instant, personalised investment research brief. This is unoccupied.

---

## Brief Structure (Sections A–F)

### Section A — Your Thesis (3 lines, always visible)
Generated from: UserProfile + MacroState + Signal[]

> "You're betting on: AI infrastructure continuation, India's mid-cap growth cycle, and gold
> as geopolitical insurance. Your edge as Malaysian-resident NRI: zero CGT in Malaysia + NRE
> tax-free routing in India. Your biggest risk: US recession + China/Taiwan escalation."

**Data inputs:** risk appetite, countries selected, macro signals from existing `queryMacroSnapshot()`

---

### Section B — Allocation (existing output, enhanced)
Current allocation table stays. Each row adds:
- 1-line "why this, for you" specific to their nationality/residence
- 5-year base target range pulled from static return model

**No new data needed.** Enhancement of existing `allocatePortfolio()` output.

---

### Section C — Your Tax Reality (NEW — highest trust impact)
Compact table, max 5 rows, driven by `nationality × residence` profile:

| Action | Your Rate | Fix | 5-Year Savings |
|--------|-----------|-----|----------------|
| US dividends | 30% → 15% | File W-8BEN | ~$180 |
| India LTCG | 12.5% | NRE Demat, hold 12m+ | ~$650 |
| EM fund choice | 0.68% (EEM) | Switch to VWO (0.08%) | ~$375 |
| **Total leakage unfixed** | | | **~$1,700** |

*Source: CBDT 2025–26 · IRS W-8BEN · LHDN Malaysia 2024 | Last verified: Feb 2026*

**Data requirement:** Curated static tax matrix (see Data Requirements section below)

---

### Section D — Execution Path (NEW)
Static template per risk profile, amounts injected from UserProfile:

```
Week 1:   Deploy 50% ($X,XXX) — test position
Week 2–4: DCA remaining 50% ($X,XXX)
Monthly:  Review macro signals (do not panic trade)
Quarterly: Rebalance if any position drifts ±5%
Exit trigger: Shown per active geopolitical signal
```

**Data inputs:** `amount` from UserProfile, exit triggers from `Signal[]`

---

### Section E — Reality Check (NEW)
3 stat boxes only. Static logic, no new data:

- 🔴 10x = 58% CAGR — VC territory, not a plan
- 🟡 5x = 38% CAGR — if 1–2 bets hit, not a strategy
- 🟢 2x–3x = 15–25% CAGR — this is the real target

**Anchors user expectations before they execute. Builds long-term trust.**

---

### Section F — What Could Break This (NEW)
3 bullets max. Live from existing `queryIntelligence()` signal feed:

- Top geopolitical risk signal → portfolio implication (e.g., "Taiwan risk: ELEVATED → SOXX capped at 10%")
- Recession probability → cash/dry powder note
- Earnings cycle signal → hold or wait note

**No new data needed.** Reads from existing `Signal[]` already in the Genie data flow.

---

## Data Requirements

### Existing (no new work needed)
| Source | Used in Section |
|--------|----------------|
| `allocatePortfolio()` output | B, D |
| `queryMacroSnapshot()` | A, E |
| `queryIntelligence()` Signal[] | A, F, D (exit triggers) |
| UserProfile (amount, risk, horizon, countries) | A, B, C, D |

### New: Tax Data Layer (curated, static, version-controlled)

A JSON/TS config file: `lib/data/tax-profiles.ts`

Structure:
```typescript
{
  "IN-MY": {                          // Indian passport, Malaysia resident
    "us_dividend_default": "30%",
    "us_dividend_treaty": "15%",
    "us_dividend_fix": "File W-8BEN",
    "us_dividend_savings_5yr": 180,
    "india_ltcg_rate": "12.5%",
    "india_ltcg_fix": "NRE Demat, hold >12 months",
    "india_ltcg_savings_5yr": 650,
    "malaysia_cgt": "0%",
    "malaysia_foreign_income_note": "Remitted foreign income taxable from Jan 2024",
    "us_estate_risk_threshold": 60000,
    "sources": [
      { "label": "CBDT 2025–26", "url": "https://incometaxindia.gov.in" },
      { "label": "IRS W-8BEN", "url": "https://irs.gov/forms-pubs/about-form-w-8-ben" },
      { "label": "LHDN Malaysia 2024", "url": "https://hasil.gov.my" }
    ],
    "last_verified": "2026-02-01"
  },
  "IN-SG": { ... },                   // Indian passport, Singapore resident
  "IN-AE": { ... }                    // Indian passport, UAE resident
}
```

**Phase 1 profiles (3 only):**
1. `IN-MY` — Indian passport, Malaysia resident
2. `IN-SG` — Indian passport, Singapore resident
3. `IN-AE` — Indian passport, UAE resident

**Freshness strategy:**
- Each profile has a `last_verified` date
- Annual refresh triggers: India Budget (Feb), Malaysia Budget (Oct), IRS updates (Jan)
- UI surfaces: *"Tax data verified Feb 2026 · Source: [CBDT]"* with a link
- No dynamic scraping. Curated and signed off by product owner before each refresh.

---

## UI Treatment

- Brief is collapsed by default after Genie output
- `View Your Research Brief →` CTA button (gold, consistent with Dark Luxury theme)
- Brief expands inline (no new page, no tab switch)
- Each section has a thin gold left border (consistent with existing card treatment)
- Tax section: red left border (urgency/loss framing)
- Reality Check: 3 stat boxes (reuse existing `.stat-box` component)
- Execution Path: code-block style (monospace, dark bg)
- All source citations: small muted text with external link icon

---

## What This Is NOT (Scope Guard)

- ❌ Not a live tax calculator
- ❌ Not a replacement for the current allocation output
- ❌ Not real-time scraped tax data
- ❌ No Hidden Gems teardowns in v1
- ❌ No Legends/philosophy quotes in v1
- ❌ No investment timeline/roadmap section in v1

These are Month 2+ backlog items after core brief is trusted.

---

## Acceptance Criteria

1. [ ] `View Your Research Brief →` CTA appears after existing Genie allocation output
2. [ ] Sections A–F render correctly for `IN-MY` profile
3. [ ] Tax table shows correct figures for Indian-Malaysian NRI with $10K
4. [ ] Each tax row links to its government source document
5. [ ] `last_verified` date is displayed on Section C
6. [ ] Sections A and F pull live data from existing `queryMacroSnapshot()` and `queryIntelligence()`
7. [ ] Brief is collapsed by default (not forced on user)
8. [ ] Works on mobile (existing responsive grid)
9. [ ] `IN-SG` and `IN-AE` profiles also render correctly
10. [ ] No regression on existing Genie allocation output

---

## Effort Estimate (rough)

| Component | Owner | Estimate |
|-----------|-------|----------|
| `tax-profiles.ts` data file (3 profiles) | Claude Code | 1 session |
| Section A–F UI components | Google Antigravity | 2–3 sessions |
| `allocatePortfolio()` enhancement (Section B why-text) | Claude Code | 1 session |
| Integration + testing | Both | 1 session |
| Tax data research + verification (government sources) | Product Owner sign-off | 1 review cycle |

---

## How This Serves the Mission

**Antigravity = escaping financial gravity**

The Tax Reality section (Section C) does this literally — it shows the user exactly how much
money is escaping their portfolio in preventable leaks, and how to stop it.

**MOAT layer added:**
- WealthMunshi: India-routing advisory, 2–3 weeks, human-intensive
- Fortress: Instant, multi-market, personalized, self-serve, live intelligence

The Fortress brief is what WealthMunshi charges $2,000+ for a human advisor to produce.
We generate it in seconds from profile completion.

---

*Card owner: Bharat Samant | Reviewed: 2026-04-20*
