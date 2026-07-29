# 🎯 Momentum Radar — Growth Strategy & Scaling Blueprint

**Status:** BETA → Commercialization  
**Owner:** Bharat Samant + Arun  
**Last Updated:** July 29, 2026  
**Document Type:** Strategic Plan (Share with stakeholders)

---

## 📌 EXECUTIVE SUMMARY

**The Opportunity:**  
MACD signal generation (scanning Nifty 500) is a valuable feature that can scale to 1000s of users. Current architecture blocks scanning on optional features (Telegram alerts). We're refactoring to decouple: scanning is always-on (core), alerts are optional (revenue).

**Strategic Insight:**  
Charge for **delivery speed & customization**, not for signals. Signals are free (build trust & user base). Alerts are paid (monetize engaged users).

**Next 90 Days:**
1. Fix bot architecture (decoupled scanning)
2. Launch free tier (1,000+ users)
3. Launch paid tier (₹299/mo real-time alerts)
4. Target: 5% free → paid conversion = ₹1.5-3L/mo revenue

**Key Metric:** % free users who upgrade to paid within 30 days (target: 5%)

---

## 🎯 THE STRATEGIC INSIGHT: Scanning ≠ Delivery

| Dimension | Scanning (Core) | Delivery (Revenue) |
|-----------|---|---|
| **Purpose** | Find MACD crossovers on 500 stocks | Send signals to users, customized |
| **Frequency** | Every 5 minutes, 24/7 | On-demand, real-time or digest |
| **Scales With** | Market data (constant) | Number of users (1 → 1M) |
| **Fails = What?** | All users lose signals | Only specific users miss alerts |
| **Revenue Driver** | NO — everyone gets it free | YES — charge for speed/features |

**The Key Insight:** You sell the delivery, not the signal. Free signals build users. Paid delivery builds revenue.

---

## 📊 THREE GROWTH LEVERS

### **1. ACQUISITION: Getting Users to Try**

**Free Tier Value Prop:**
- Live MACD crossovers on Nifty 500 (updated every 5 min)
- No login required
- No cost, no commitment

**User Avatar:**
- Indian retail traders (NSE intraday/swing)
- Already use Zerodha/other brokers
- Want technical edge (signal + targets + stops)
- Price-sensitive but quality-focused

**Market Size:** 500K+ active NSE day traders

**Acquisition Channel:** Product Hunt, Twitter, trading communities ("Free MACD scanner, better than TradingView")

**Metric to Track:** Users/day signup (target: 50/day in month 1)

---

### **2. RETENTION: Keeping Users Coming Back**

**Why They Stay:**
- Signals are objectively useful (accuracy matters)
- Targets + stops lower execution friction
- Free UI refresh keeps them engaged

**Paid Tier Pulls Them Up:**
- Real-time Telegram alerts (vs. website refresh)
- Custom rules (only daily, specific sectors, timeframes)
- Integration (Zerodha auto-order)

**Metric to Track:** DAU (Daily Active Users) as % of registered

**Target:** >30% DAU in month 1

---

### **3. EXPANSION: Revenue per User**

**Pricing Tiers:**

| Tier | Price | What's Included | Who It's For |
|------|-------|---|---|
| **Free** | ₹0 | Live web signals, daily email digest | Curious traders, price-sensitive |
| **Paid** | ₹299/mo | Real-time Telegram alerts, custom rules (sectors, timeframes) | Active traders, want alerts |
| **Premium** | ₹999/mo | Real-time alerts + auto-order placement (Zerodha), fundamental screening | Serious traders, hands-off |
| **Enterprise** | Custom | Webhook delivery, API, white-label | Trading firms, prop shops |

**Revenue Model Example (At 11K Users):**
- 10,000 free users → ₹0
- 1,000 paid users (10% conversion) → ₹299 × 1,000 = ₹2,99,000/mo
- 100 premium users (1% of paid) → ₹999 × 100 = ₹99,000/mo
- **Monthly Revenue:** ₹3,98,000 (~$4,800/mo)

---

## 🏗️ THE TWO-BOT ARCHITECTURE (Explained Simply)

**Why Two Bots?**

Imagine a radio station:

1. **Bot 1: The DJ (Scanning Bot)**
   - Job: Pick songs from the Nifty 500 playlist every 5 minutes
   - Works 24/7, doesn't care who listens
   - Never stops, never requires anything from listeners

2. **Bot 2: The Broadcast System (Alerts Bot)**
   - Job: Send that song to listeners via their preferred method
   - Some want real-time (Telegram)
   - Some want daily digest (email)
   - Some want only certain songs (custom rules)
   - Some want to auto-trade on it (Zerodha)

**Why This Matters:**

| Scenario | One Bot ❌ | Two Bots ✅ |
|----------|---|---|
| Bot needs credentials to start? | Signals blocked | Scanning always on |
| One user's Telegram fails? | All users affected | Only that user's alert fails |
| Scale to 10K users? | One bot drowns | Scanning unchanged, alerts scale separately |
| Change how alerts work? | Risky (affects scanning) | Safe (separate system) |

**The Architectural Truth:**
- Scanning is **reliable, static, never changes** → one bot, always on
- Alerts are **flexible, scalable, changes with pricing** → separate system, scales independently

---

## 💰 PHASE-BY-PHASE ROLLOUT

### **Phase 1: Fix Architecture (NOW → Week 1)**
- Refactor bot to decouple scanning from alerts
- Deploy to VPS
- Verify signals flow to UI WITHOUT credentials
- **Outcome:** Core feature works independently

**Metrics:**
- Signals appear on UI ✅
- No credential-blocking errors ✅
- Bot scans successfully every 5 min ✅

---

### **Phase 2: Free Beta Launch (Weeks 1-4)**
- Open `/momentum-radar` to public (no login)
- Share on Twitter, trading communities
- Gather feedback: which users would pay?
- Build user base to 1,000+

**Metrics:**
- 50+ new users/day
- 30%+ DAU
- >50% accuracy on signals (validate)

**Investment:** 1-2 weeks (marketing + feedback)

---

### **Phase 3: Paid Tier Launch (Weeks 5-8)**
- Real-time Telegram alerts (₹299/mo)
- Simple paywall (Stripe, payment link)
- Target: 5-10% free users upgrade

**Metrics:**
- ₹1.5-3L/mo revenue (if targets hit)
- 5%+ free → paid conversion
- Churn <5%/mo

**Investment:** 2-3 weeks (Stripe integration, Telegram sender)

---

### **Phase 4: Premium Tier (Weeks 9-12)**
- ₹999/mo with Zerodha auto-order
- Target: 1% of users (100 users paying ₹999)

**Metrics:**
- ₹99K/mo from premium
- Total revenue: ₹4L/mo

---

### **Phase 5: Enterprise (3-6 months)**
- Webhook delivery, API access, white-label
- Target: 5-10 prop shops / firms
- Custom contracts

---

## 🎯 TOP 3 PRIORITIES (90 Days)

### **Priority 1: Decouple Bot Architecture (Week 1)**
**Why:** Unblocks core feature, sets foundation for scaling

- ✅ Bot scans always (no credential requirement)
- ✅ Alerts optional (Telegram can fail, signals still flow)
- ✅ Signals appear on web immediately
- **Effort:** 2-3 hours
- **Outcome:** 1000s can test core feature

---

### **Priority 2: Free Launch (Weeks 1-4)**
**Why:** Build user base, validate unit economics

- ✅ Signal visibility on `/momentum-radar` (already done)
- ✅ Zero signup friction (optional login)
- ✅ Telegram alerts optional (for early adopters)
- **Effort:** 1-2 weeks marketing
- **Outcome:** 500-1,000 free users

---

### **Priority 3: Paid Launch (Weeks 5-8)**
**Why:** Prove monetization works before scale acquisition

- ✅ ₹299/mo Telegram alerts (real-time)
- ✅ Simple paywall (Stripe)
- ✅ Target: 5-10% free → paid
- **Effort:** 2-3 weeks
- **Outcome:** ₹1.5-3L/mo revenue

---

## 📈 THE ONE METRIC THAT MATTERS

**"What % of free users upgrade to paid within 30 days?"**

**Why This One Number?**
- ✅ Tells you if product is valuable (not just fun)
- ✅ Tells you if pricing is right
- ✅ Tells you if you have a real business
- ✅ Tells you what to focus on (if <1% → fix product; if >10% → scale acquisition)

**Target:** 5% within 30 days (SaaS benchmark)

---

## ⚡ QUICK WINS (Next 30 Days)

1. **Refactor bot** (decouple scanning) ✅
2. **Add "Try Premium" CTA** on `/momentum-radar` (when paid ready)
3. **Beta test alerts** with 10 friends (gather feedback)
4. **Survey: would you pay?** (validate ₹299 price point)

---

## 🚨 WATCH-OUTS (Things That Could Kill This)

### **Watch-Out 1: MACD Accuracy Drifts**
If win rate drops below 50%, paid tier becomes indefensible.
- **Prevention:** Track hit rate by stock. If INFY has 30% hit rate, don't recommend it.

### **Watch-Out 2: Alert Latency**
If alerts arrive 30 seconds late, users lose the move.
- **Prevention:** Build monitoring on alert delivery time. Keep <5 seconds.

### **Watch-Out 3: Competitor Pressure**
TradingView, Finviz, et al. have MACD scanners. Why pay for yours?
- **Prevention:** Own the Nifty 500 niche + Zerodha integration + NRI-focused.

---

## 🔄 SUCCESS METRICS (Dashboard)

| Metric | Target (Month 1) | Target (Month 3) |
|--------|---|---|
| Free users | 1,000 | 5,000 |
| DAU % | 30% | 40% |
| Accuracy % | >50% | >60% |
| Paid users | 50 | 500 |
| Free → paid % | 5% | 10% |
| Monthly revenue | ₹15K | ₹2L |
| Churn % | <10% | <5% |

---

## 📋 DECISION LOG

**Decision 1: Two Bots (Scanning + Alerts)**
- ✅ Approved (July 29)
- **Rationale:** Scanning independent, alerts scale separately
- **Implementation:** Start with simple structure, add complexity only when needed

**Decision 2: Free Tier → Paid Tier (Not Freemium)**
- ✅ Approved (July 29)
- **Rationale:** Free keeps everyone aligned, paid charges for speed/features
- **Pricing:** ₹299/mo for real-time alerts is entry point

**Decision 3: Charge for Delivery, Not Signals**
- ✅ Approved (July 29)
- **Rationale:** Signals are commodity (everyone can build MACD), delivery is differentiator
- **Outcome:** Build trust with free signals, monetize via alerts

---

## 🔮 LONG-TERM VISION (12+ months)

**Platform:** Fortress Intelligence becomes the OS for Indian retail traders

- ✅ **Signal Engine:** MACD (done), + Bollinger Bands, Volume Profile, Ichimoku, etc.
- ✅ **Fundamental Layer:** P/E, Growth rates, Insider tracking
- ✅ **Portfolio Layer:** Allocation, rebalancing, tax-loss harvesting
- ✅ **Integration Layer:** Zerodha, Interactive Brokers, Angels, Shoonya
- ✅ **Community Layer:** Leaderboards, idea sharing, fund-of-funds

**Revenue:** $100K/mo by end of 2026 (conservative)

---

## ✍️ NEXT REVIEW CHECKPOINT

**When:** 2 weeks (August 12, 2026)  
**Who:** Bharat + Arun  
**Check:** Free tier adoption, accuracy tracking, pricing feedback

---

## 👥 APPROVALS

- [ ] Bharat Samant (Product Owner) — Approve Strategy
- [ ] Arun (Co-Founder) — Approve Architecture
- [ ] CTO (Claude) — Approve Technical Plan

