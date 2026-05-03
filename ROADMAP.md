# Fortress Intelligence - Product Roadmap

**Current:** Beta Live (v0.4.0) | **Audience:** Internal team, Beta users

---

## 📅 Timeline

### ✅ Phase 1-3: COMPLETE (April 2026)
- ✅ Investment Genie frontend & backend
- ✅ Fortress 30 stock screening (US data)
- ✅ Dark Luxury theme
- ✅ PostgreSQL schema & data pipelines
- ✅ Production deployment (VPS)
- ✅ CI/CD automation (GitHub Actions)

**Status:** Beta launched April 19, production recovered May 1 ✅

---

## 🚀 Phase 4: Now - Month 1 (May 2026)

### Focus: Beta Stability & User Feedback

**What's Live**
- ✅ Investment Genie (US + India markets)
- ✅ Fortress 30 (US stocks: 346 candidates)
- ✅ Responsive design (all devices)
- ✅ NSE placeholder (ready for data)

**In Progress (No Blockers)**
- 🔄 NSE data population (auto-retry, yfinance recovery expected 24-48h)
- 🔄 Minor Fortress 30 UI polish (market-switch state sync)

**No Development Work Needed** - Monitor production, gather user feedback

---

## ⏳ Phase 5: Month 2+ (Late May - June 2026)

### Focus: User Feedback Loop & Market Expansion

**Genie Feedback Loop** (5-7 hours) 
- Trigger: 50+ active users + 3+ months allocation history
- Build AI feedback system for portfolio performance
- New tables: `genieAllocations`, `genieTracking`, `genieInsights`
- New endpoint: `POST /api/genie/learn`
- Reuse patterns from Fortress Alpha learning loop
- Documentation ready: [backlog_genie_feedback_loop.md](backlog_genie_feedback_loop.md)

**NSE Market Expansion** (Ongoing)
- Trigger: yfinance recovery + 50+ NSE candidates indexed
- Update Fortress 30 India tab with real data
- Populate Growth allocation with actual candidates
- Monitor & maintain cron jobs

**Advanced Features** (TBD, based on user feedback)
- [ ] Portfolio analytics dashboard
- [ ] Performance tracking vs. benchmarks
- [ ] Rebalancing recommendations
- [ ] Export/download functionality
- [ ] Real-time alerts

---

## 📊 Success Metrics

### Month 1 (Beta)
- [ ] 50+ active users
- [ ] 0 critical production incidents
- [ ] NSE data live (auto-recovered from yfinance)
- [ ] User feedback collected & categorized

### Month 2+
- [ ] Investment Genie feedback loop deployed
- [ ] 100+ active users
- [ ] India market competitive with US
- [ ] Advanced features prioritized based on feedback

---

## 🎯 Feature Priorities

### High (User Impactful)
1. NSE market data (auto-recovery in progress)
2. Genie feedback loop (Month 2+)
3. Performance analytics
4. Export functionality

### Medium (Nice-to-have)
1. Advanced filtering
2. Custom alerts
3. Portfolio comparison
4. Backtesting tools

### Low (Future)
1. Multi-currency support
2. Other markets (EU, Asia)
3. Social features
4. Mobile app

---

## 🛑 Known Issues & Blockers

### Minor (Non-Blocking)
- Fortress 30 market-switch UI state cosmetic sync
- **Resolution:** Low priority, data works correctly, fix in next sprint

### Auto-Resolving
- NSE scan yfinance rate limit
- **Expected Resolution:** 24-48 hours (auto-retry enabled)
- **Impact:** No action needed, monitor

---

## 📝 Decision Log

**Why Genie Feedback Deferred?**
- Requires 50+ users & 3+ months of actual allocation data
- Feedback loop needs real historical performance to be useful
- Premature loop implementation would be training on noise
- **Decision:** Build after product validation & user base

**Why Separate Feedback Loops?**
- Fortress (stocks): 90-day feedback cycle, stock-level metrics
- Genie (portfolio): 12-month feedback cycle, portfolio-level metrics
- Different timescales, metrics, and user value
- **Decision:** Keep separate, cleaner architecture

---

## 🔄 Continuous

### Monitoring (All Phases)
- ✅ Production uptime
- ✅ Database health
- ✅ Cron job success rates
- ✅ User engagement metrics
- ✅ API error rates

### Maintenance
- Keep dependencies updated (npm, Python)
- Monitor security advisories
- Maintain documentation
- Review & optimize queries

---

## 🚀 Long-term Vision (6+ months)

1. **Fortress Intelligence Suite**
   - Investment allocation (done)
   - Stock screening (done)
   - Portfolio feedback (Month 2+)
   - Macro-analysis & sector rotation
   - Global market coverage

2. **User Growth**
   - India: 100+ users
   - US: 100+ users
   - Revenue: TBD (freemium model, advisory)

3. **Platform Evolution**
   - API for third-party integration
   - Advanced analytics dashboard
   - Mobile-first experience
   - Real-time market data

---

**Last Updated:** May 3, 2026 | **Owner:** Bharat Samant
