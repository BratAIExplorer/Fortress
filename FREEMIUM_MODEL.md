# Freemium Model & Trial System — Fortress Intelligence

**Version:** 1.0  
**Date:** July 26, 2026  
**Status:** Documented (awaiting implementation)

---

## 🎯 Product Vision

**Goal:** Convert 30% of trial users to paid subscribers within 90 days.

**Model:**
- Free trial: 30 days, full access
- Free tier (after trial): Limited features, forever free
- Paid tier: $9.99/month (or $99/year), unlimited + alerts + sync

---

## 📊 Feature Matrix

| Feature | Free (Forever) | Free Trial (30 days) | Premium ($9.99/mo) |
|---------|---|---|---|
| **Fortress 30** | ✅ Full | ✅ Full | ✅ Full |
| **Investment Genie** | ✅ Full | ✅ Full | ✅ Full |
| **Hidden Gem Finder** | ⚠️ 2/week limit | ✅ Unlimited | ✅ Unlimited |
| **Portfolio Tracker** | ❌ Cannot create | ✅ Full access | ✅ Full + sync |
| **Trading Specialist** | ✅ View only | ✅ Full | ✅ Full |
| **Alerts (price/drift)** | ❌ | ✅ (trial only) | ✅ |
| **Export & Reports** | ❌ | ❌ | ✅ |
| **Macro Dashboard** | ✅ Read-only | ✅ Full | ✅ Full |
| **API Access** | ❌ | ❌ | ✅ Phase 3 |

---

## 🔄 User Journey (Persona: Rajesh, 32)

### Stage 1: Awareness → Signup
- Discovers via Google search, Twitter, Reddit
- Lands on homepage → sees "Free for 30 days, no CC required"
- Clicks "Create one" → minimal signup form

### Stage 2: Onboarding (Day 0-3) — **CRITICAL FOR CONVERSION**
- Redirects to Investment Genie (quick win: allocation for their risk profile)
- Shows Fortress 30 (value: real data, ranked stocks)
- Suggests first Hidden Gem scan (e.g., "Find your next stock in 60 seconds")
- Email: "Welcome! Your 30-day trial starts now"

### Stage 3: Engagement (Day 4-20)
- Creates portfolio, marks trades (BOUGHT/SKIPPED/LOSS)
- Searches gems 2-3x/week
- Watches allocation drift

### Stage 4: Trial Decision (Day 24-28) — **CONVERSION MOMENT**
- Email on Day 24: "Your trial ends in 6 days. Here's what you'll lose..."
- In-app banner on Day 28: "Trial ends TODAY. Subscribe now to keep your portfolio."
- Conversion modal: Shows personalized value ("You tracked 5 stocks. Don't lose them.")

### Stage 5: Post-Trial
- **Converts to paid:** Full access, alerts, export, sync (roadmap)
- **Declines:** Downgraded to free tier (2 Gem searches/week, view-only portfolio)

---

## 🗄️ Database Schema Changes

### Add to `authUser` table

```sql
ALTER TABLE "auth_user" ADD COLUMN "trial_started_at" TIMESTAMP DEFAULT NOW();
ALTER TABLE "auth_user" ADD COLUMN "trial_ends_at" TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE "auth_user" ADD COLUMN "subscription_status" VARCHAR(50) DEFAULT 'trial'; -- trial, free, paid, cancelled
ALTER TABLE "auth_user" ADD COLUMN "subscription_tier" VARCHAR(50) DEFAULT 'free'; -- free, premium
ALTER TABLE "auth_user" ADD COLUMN "stripe_customer_id" VARCHAR(255);
ALTER TABLE "auth_user" ADD COLUMN "stripe_subscription_id" VARCHAR(255);
```

### New table: `subscription_events`

```sql
CREATE TABLE "subscription_events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "auth_user"(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- trial_started, trial_ending_soon, trial_expired, subscribed, downgraded, cancelled
  event_date TIMESTAMP DEFAULT NOW(),
  metadata JSONB, -- { stripe_event_id, amount_paid, plan_id, ... }
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);
```

---

## 🔐 Feature Gates (Middleware)

### Middleware: `validateSubscriptionTier`

```typescript
// lib/auth/subscription-guard.ts
export async function getSubscriptionTier(userId: string) {
  const user = await db.query.authUser.findFirst({
    where: eq(authUser.id, userId),
  });
  
  if (!user) return 'guest';
  
  // Check if trial is expired
  if (user.subscription_status === 'trial' && new Date() > user.trial_ends_at) {
    // Update status to free
    await db.update(authUser).set({ subscription_status: 'free' }).where(eq(authUser.id, userId));
    return 'free';
  }
  
  return user.subscription_tier; // 'free', 'premium'
}

export async function checkFeatureAccess(userId: string, feature: string) {
  const tier = await getSubscriptionTier(userId);
  
  const featureAccess = {
    'fortress_30': { free: true, premium: true },
    'investment_genie': { free: true, premium: true },
    'gem_finder': { free: true, premium: true }, // But rate-limited for free
    'portfolio_create': { free: false, premium: true }, // Free: view-only
    'alerts': { free: false, premium: true },
    'export': { free: false, premium: true },
  };
  
  return featureAccess[feature]?.[tier] ?? false;
}
```

### Route: `/api/auth/check-tier` (Frontend can call this to gate UI)

Returns:
```json
{
  "tier": "free",
  "days_remaining_in_trial": null,
  "trial_expired_at": "2026-08-25T12:00:00Z",
  "features_available": {
    "portfolio_create": false,
    "alerts": false
  }
}
```

---

## 📧 Email Sequences (Phase 2.2)

### Day 0: Welcome Email
```
Subject: Welcome to Fortress! Your 30-day free trial starts now ✨

Hi Rajesh,

You're all set. Here's what's included in your free trial:
✅ Real Fortress 30 rankings (India + US stocks)
✅ Portfolio tracking & analysis
✅ Hidden Gem Finder (unlimited searches)
✅ 30-day trial, no credit card needed

[Get Started] → Investment Genie

Questions? Reply to this email.
— Fortress Team
```

### Day 7: First Win Email
```
Subject: Rajesh, you found a gem 💎

Hi Rajesh,

You searched for AAPL with Gem Finder yesterday and it scored 82/100. That's in our top 10%.

Here's the best part: You're tracking this stock in your portfolio. That's exactly what paid subscribers do to find winners.

Explore more stocks → [Gem Finder]

— Fortress Team
```

### Day 24: Trial Ending Email
```
Subject: Your trial ends in 6 days (and here's what you'll lose)

Hi Rajesh,

Your Fortress trial ends on August 25 at 5 PM IST.

Without Premium, you lose:
❌ Portfolio tracking (your 5 stocks disappear)
❌ Price alerts (miss the spike)
❌ Drift alerts (allocation slips without warning)

But here's the thing: You can keep using Fortress for free.

[View Free Tier Features]
[Upgrade to Premium - $9.99/mo] ← 30% off first 3 months

— Fortress Team
```

### Day 28: Trial Expired Email
```
Subject: Your trial ended. Here's how to get it back.

Hi Rajesh,

Your Fortress trial expired today. You now have:
✅ Fortress 30 (unlimited)
✅ Gem Finder (2 searches per week)
❌ Portfolio tracking (but you can view your old strategies)

Miss unlimited access? Resubscribe now for just $6.99/mo (first 3 months).

[Resubscribe] | [Questions?]

— Fortress Team
```

---

## ✅ Validation Checklist (Testing)

Before deployment, validate:

- [ ] Auth flow: Login → Session persists → Portfolio accessible
- [ ] Trial banner: Shows correct days remaining (recalculates daily)
- [ ] Feature gates: Gem Finder limits to 2/week for free users
- [ ] Portfolio creation: Free users see paywall modal, trial users see full feature
- [ ] Email: Day 0 welcome email sent after signup
- [ ] Trial expiry: Day 28 transitions user to free tier
- [ ] Downgrade UX: Free user tries to create portfolio → sees paywall, not error
- [ ] Stripe ready: Test payment flow works (test API keys)

---

## 🚀 Deployment Checklist

- [ ] Database migrations applied (`drizzle:push`)
- [ ] New routes tested locally
- [ ] Email sequences verified (check logs)
- [ ] Stripe keys configured in `.env.production`
- [ ] Feature gates tested in production
- [ ] Payment flow tested with test card
- [ ] Rollback plan documented (if needed)

---

## 📈 Metrics to Track

| Metric | Target | Check |
|--------|--------|-------|
| Trial signup rate | 100% of visitors | Google Analytics |
| Trial → paid conversion | 30% by Day 30 | Stripe dashboard |
| Trial → free tier retention | 20% by Day 90 | Subscription table |
| Churn (paid → cancelled) | <5%/month | Stripe dashboard |
| Feature gate violations | 0 errors | Sentry |

---

## 🔗 Dependencies

1. ✅ **Auth working** (Session 28) — MUST FIX FIRST
2. ✅ **SMTP configured** (Phase 3) — needed for emails
3. ✅ **Stripe account** (Phase 2.3) — for payment processing
4. ⏳ **Payment UI** (Phase 2.3) — Checkout modal

---

**Next:** Test auth flow, identify blocker, deploy freemium foundation.
