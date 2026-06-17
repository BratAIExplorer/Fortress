# Data Protection & Compliance Validation Checklist

**Project:** Fortress Intelligence  
**Date:** June 17, 2026  
**Status:** AUDIT IN PROGRESS  

---

## USER DATA CLASSIFICATION

### PII (Personally Identifiable Information) — PROTECTED

| Data | Location | Current Protection | Required Protection | Status |
|------|----------|-------------------|-------------------|--------|
| Email | `authUser.email` | ❌ Plaintext in DB | 🔄 Encrypt at rest | ⏳ TODO |
| Password | `authUser.password` | ✅ bcrypt-12 | ✅ bcrypt-12 | ✅ OK |
| Name | `authUser.name` | ❌ Plaintext | 🔄 Encrypt or anonymize | ⏳ TODO |
| IP Address | Logs | ❌ Plaintext | 🔄 Hash or mask | ⏳ TODO |

### Financial Data — HIGHLY PROTECTED

| Data | Location | Current Protection | Required Protection | Status |
|------|----------|-------------------|-------------------|--------|
| Portfolio Holdings | `strategy_holdings` | ⚠️ Access control only | 🔄 Encrypt + audit log | ⏳ TODO |
| Allocation History | `feedback` | ⚠️ Access control only | 🔄 Encrypt + audit log | ⏳ TODO |
| Trade History (Crypto) | `trades` (Kyro DB) | ⚠️ Access control only | 🔄 Encrypt + audit log | ⏳ TODO |

### Analytics Data — MINIMALLY PROTECTED

| Data | Location | Current Protection | Retention | Status |
|------|----------|-------------------|-----------|--------|
| Page Views | `page_views` | None | Delete after 90d | ⏳ TODO |
| Live Activity | `live_activity` | None | Delete after 7d | ⏳ TODO |

---

## ACCESS CONTROL MATRIX

### User Access (Self-Service)
```
✅ Portfolio: Can view/edit own portfolio
✅ Allocation history: Can view own allocations
✅ Account: Can change own password
❌ Other users' data: Cannot access
❌ Admin panel: Cannot access
```

**Verification SQL:**
```sql
-- Verify users can only access own data
SELECT * FROM strategies WHERE userId = auth.uid();  -- Should only return own strategies
SELECT * FROM feedback WHERE userId = auth.uid();    -- Should only return own feedback
```

**Status:** ✅ Partially implemented via NextAuth  
**Gaps:** Need RLS (Row Level Security) enforcement in database

---

### Admin Access (Fortress Admins)
```
✅ All user data: Can view (with audit logging)
✅ User deletion: Can delete (with audit logging)
✅ Feedback: Can view all feedback
❌ Bot operations: Cannot trigger trades (separate system)
```

**Implementation Needed:**
```sql
-- Enable RLS on admin tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Admin role bypasses RLS
CREATE ROLE admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin_user;
```

**Status:** ⏳ NOT IMPLEMENTED

---

### Service Account Access (Crypto Bots)
```
✅ Bot trade execution: Own bot only
✅ Market data: Read all (yfinance, NSE APIs)
❌ User portfolio: Cannot access
❌ Other bot operations: Cannot access
```

**Verification:**
```typescript
// Verify bot can only execute own trades
const bot = await db.query(
  'SELECT * FROM bots WHERE id = ? AND auth_key = ?',
  [botId, authKey]
)
if (!bot) throw new Error('Unauthorized bot')
```

**Status:** ⚠️ Partially implemented (auth_key verification needed)

---

## ENCRYPTION REQUIREMENTS

### At Rest (Database)
**Current:** ❌ Plaintext  
**Required:** Transparent Data Encryption (TDE)

```sql
-- Enable PostgreSQL encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET encrypt_data_at_rest = on;

-- Migrate existing data
SELECT pgcrypto_enable();
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE authUser ADD COLUMN email_encrypted BYTEA;
UPDATE authUser SET email_encrypted = pgp_sym_encrypt(email, 'password-key');
-- Drop plaintext column after migration
ALTER TABLE authUser DROP COLUMN email;
ALTER TABLE authUser RENAME COLUMN email_encrypted TO email;
```

**Status:** ⏳ TODO (2-3 day migration)

---

### In Transit (Network)
**Current:** ✅ HTTPS enforced  
**Required:** TLS 1.3

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'  // 2 years
  }
]
```

**Verification:**
```bash
# Test SSL/TLS
curl -I https://fortressintelligence.space
# Should show: TLS 1.3
```

**Status:** ✅ Likely OK (needs verification)

---

### At Rest (Backups)
**Current:** Unknown  
**Required:** Encrypted backups

```bash
# Backup with encryption
pg_dump -h localhost fortress_db | gzip | openssl enc -aes-256-cbc > backup.sql.gz.enc

# Restore
openssl enc -d -aes-256-cbc -in backup.sql.gz.enc | gunzip | psql
```

**Status:** ⏳ TODO

---

## CONSENT & PRIVACY

### User Consent Tracking
**Table:** `privacyConsent`  
**Fields:**
- `dataCollection` — Can we store usage data?
- `feedbackUsage` — Can we use feedback to improve?
- `emailNotifications` — Can we send emails?

**Current State:** ✅ Collected during registration  
**Issue:** ❌ No way for users to revoke consent

**Fix Required:**
```typescript
// Add endpoint to update consent
PUT /api/user/consent
{
  "dataCollection": false,
  "feedbackUsage": false,
  "emailNotifications": true
}

// Implement consent-based data handling
async function storeAnalytics(userId, data) {
  const consent = await getConsent(userId)
  if (!consent.dataCollection) return  // Don't store if user opted out
  
  await db.insert(analytics).values({
    userId,
    ...data,
    createdAt: new Date()
  })
}
```

**Status:** ⏳ TODO

---

## GDPR COMPLIANCE

### Six GDPR Rights Implementation

#### 1. Right to Access
**Requirement:** Users can export all their data  
**Current:** ❌ Not implemented

**Implementation:**
```typescript
// GET /api/user/export-data
export async function GET(req: NextRequest) {
  const session = await auth()
  
  // Collect all user data
  const user = await getUser(session.user.id)
  const strategies = await getStrategies(session.user.id)
  const feedback = await getFeedback(session.user.id)
  const audit = await getAuditLogs(session.user.id)
  
  // Return as JSON
  return NextResponse.json({
    user,
    strategies,
    feedback,
    audit_logs: audit
  })
}
```

**Status:** ⏳ TODO

---

#### 2. Right to Rectification
**Requirement:** Users can correct wrong data  
**Current:** ✅ Partially (email/name only)

**Gaps:** 
- Portfolio data can't be edited retroactively
- Audit logs are immutable (correct!)

**Status:** ✅ Mostly OK

---

#### 3. Right to Erasure ("Right to be Forgotten")
**Requirement:** Users can request complete data deletion  
**Current:** ❌ Not implemented

**Implementation:**
```typescript
// POST /api/user/request-deletion
export async function POST(req: NextRequest) {
  const session = await auth()
  
  // Create deletion request (not immediate)
  await db.insert(deletionRequests).values({
    userId: session.user.id,
    requestedAt: new Date(),
    status: 'pending'
  })
  
  // Send confirmation email
  await sendEmail(session.user.email, {
    subject: 'Data Deletion Request',
    body: 'Your request will be processed in 30 days. Click here to cancel.'
  })
  
  // After 30 days, execute deletion
  // DELETE FROM authUser WHERE id = userId
  // DELETE FROM strategies WHERE userId = userId
  // etc.
}
```

**Status:** ⏳ TODO

---

#### 4. Right to Restrict Processing
**Requirement:** Users can stop processing (but keep data)  
**Current:** ❌ Not implemented

**Implementation:**
```typescript
// Add restrictProcessing flag
ALTER TABLE authUser ADD COLUMN restrictProcessing BOOLEAN DEFAULT false;

// In all queries, add filter
WHERE NOT restrictProcessing OR userId = currentUserId
```

**Status:** ⏳ TODO

---

#### 5. Right to Data Portability
**Requirement:** Users can get data in standard format  
**Current:** ✅ Same as "Right to Access" above

**Status:** ✅ Same endpoint

---

#### 6. Right to Object
**Requirement:** Users can opt out of processing  
**Current:** ⚠️ Partially (through consent)

**Gap:** No way to object to specific use cases

**Status:** ✅ Consent system covers this

---

## CCPA COMPLIANCE (California)

### Four CCPA Rights

| Right | Current | Status |
|-------|---------|--------|
| Know what data we collect | ❌ No privacy policy | ⏳ TODO |
| Access data | ✅ Via export endpoint | ✅ OK |
| Delete data | ❌ No deletion mechanism | ⏳ TODO |
| Opt-out of sale | ✅ No data sold | ✅ OK |

**Status:** 50% compliant (not selling data is good!)

---

## BREACH NOTIFICATION

**Requirement:** Notify users within 72 hours of data breach

**Process to Implement:**
```markdown
1. Incident detection (security alerts)
2. Assessment (affected users, data type)
3. Notification:
   - Email to all affected users
   - Email to regulatory bodies (if required)
   - Public statement
4. Documentation (what happened, why, how fixed)
```

**Status:** ⏳ TODO (create incident response plan)

---

## DATA RETENTION POLICIES

### Fortress Intelligence

| Data Type | Retention | Delete After | Status |
|-----------|-----------|--------------|--------|
| User Account | Until deletion | User request | ⏳ TODO |
| Portfolio Data | Indefinite | User request | ✅ OK |
| Feedback | Indefinite | User request | ✅ OK |
| Audit Logs | 7 years | Fixed schedule | ⏳ TODO |
| Analytics | 90 days | Auto-delete | ⏳ TODO |
| Session Tokens | 24 hours max | Fixed schedule | ✅ OK |
| Passwords | Never | N/A | ✅ OK |

---

### Kyro Crypto Bot Fleet

| Data Type | Retention | Delete After | Status |
|-----------|-----------|--------------|--------|
| Trade History | Indefinite | User request | ⏳ TODO |
| Bot Decisions | Indefinite | Auto-archive? | ⏳ TODO |
| Market Data | 30 days | Auto-delete | ⏳ TODO |
| Audit Logs | 7 years | Fixed schedule | ⏳ TODO |

---

## IMPLEMENTATION CHECKLIST

### PHASE 1: IMMEDIATE (This Week)
- [ ] Create privacy policy
- [ ] Create data deletion request endpoint
- [ ] Create user data export endpoint
- [ ] Add consent revocation mechanism
- [ ] Document data retention policies

### PHASE 2: ENCRYPTION (Week 2)
- [ ] Database encryption at rest
- [ ] Encrypted backups
- [ ] Column-level encryption for PII
- [ ] Verify TLS 1.3 in production

### PHASE 3: RLS & ACCESS CONTROL (Week 3)
- [ ] Enable Row Level Security in PostgreSQL
- [ ] Implement admin role access
- [ ] Implement service account access
- [ ] Audit all access patterns

### PHASE 4: COMPLIANCE (Week 4)
- [ ] Finalize GDPR compliance
- [ ] Finalize CCPA compliance
- [ ] Breach notification process
- [ ] External audit

---

## COMPLIANCE SCORECARD

**Overall Score:** 35/100 (NEEDS WORK)

| Area | Score | Status |
|------|-------|--------|
| Access Control | 50% | Partial |
| Encryption | 10% | Minimal |
| Consent | 70% | Good |
| GDPR Compliance | 20% | Gaps |
| CCPA Compliance | 50% | Partial |
| Audit Logging | 0% | Missing |
| Data Deletion | 0% | Missing |
| Breach Response | 0% | Missing |

**Target:** 95/100 (before production scale-up)

---

## SIGN-OFF REQUIREMENTS

Before accepting users' financial data at scale:

- [ ] All CRITICAL security issues resolved
- [ ] All encryption implemented
- [ ] RLS enabled in database
- [ ] Audit logging operational
- [ ] GDPR/CCPA compliance verified
- [ ] External security audit passed
- [ ] Incident response plan documented
- [ ] Legal review completed

---

**Document Status:** Ready for implementation  
**Next Review:** After Phase 1 completion
