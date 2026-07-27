# Account Creation: Bare Minimum Information Required

**Document:** Comparison of signup flows across Fortress and Kyro projects

---

## 📋 FORTRESS SIGNUP (Current)

**Location:** `app/register/page.tsx`

### Form Fields Required:
1. **Email** - User email address
2. **Password** - Minimum 8 characters, max 128 characters
3. **Confirm Password** - Must match password field
4. **Consents** (3 checkboxes) - BLOCKING:
   - ☑️ Data Collection Consent
   - ☑️ Feedback Usage Consent
   - ☐ Email Notifications (optional)

### Additional Features:
- Password strength meter (visual feedback)
- Google OAuth signup option
- Success confirmation screen before redirect to login

### Backend Endpoint:
```
POST /api/auth/register
Body: {
  email: string,
  password: string,
  consents: {
    dataCollection: boolean,
    feedbackUsage: boolean,
    emailNotifications: boolean
  }
}
```

---

## 🚀 KYRO SIGNUP (Simpler)

**Location:** `src/frontend/app/auth/signup/page.tsx`

### Form Fields Required:
1. **Email** - Must be valid format (regex: `\S+@\S+\.\S+`)
2. **Password** - Minimum 8 characters, must include:
   - Uppercase letter
   - Lowercase letter
   - Number
3. **Confirm Password** - Must match password field
4. **Terms Checkbox** - BLOCKING:
   - ☑️ Agree to Terms (required)

### Additional Features:
- NO extra consents (just one checkbox)
- NO password strength meter
- NO Google OAuth
- "Mounted" state for hydration safety
- Cleaner, minimal design

### Backend Endpoint:
```
POST /api/v1/auth/signup
Body: {
  email: string,
  password: string,
  confirm_password: string
}
```

---

## 📊 COMPARISON

| Aspect | Fortress | Kyro | Winner |
|--------|----------|------|--------|
| **Form Fields** | 5 (3 consents) | 4 (1 checkbox) | Kyro (simpler) |
| **Password Rules** | 8-128 chars | 8+ chars + uppercase/lowercase/number | Kyro (clearer) |
| **Consents** | 3 checkboxes | 1 checkbox | Kyro (fewer barriers) |
| **Email Validation** | Basic type="email" | Regex validation | Kyro (stricter) |
| **Auth Method** | Custom + OAuth | Custom only | Fortress (more options) |
| **Onboarding Flow** | Success screen + redirect | Redirect with param | Fortress (better UX) |

---

## ✅ BARE MINIMUM RECOMMENDATION

For a **freemium model**, the absolute minimum is:

```
Email + Password + Confirm Password + 1 Terms Checkbox
```

**Why this works:**
1. Lower friction = higher signup conversion
2. One checkbox doesn't block users
3. Email + password are security essentials
4. Can add consent tracking AFTER signup (during onboarding)

---

## 🎯 FORTRESS OPTIMIZATION PROPOSAL

### Current State (5 fields required):
- Email ✓
- Password ✓
- Confirm Password ✓
- Data Collection Consent ✓ (blocking)
- Feedback Usage Consent ✓ (blocking)

### Proposed State (3 fields required):
- Email ✓
- Password ✓
- Confirm Password ✓
- ☑️ **Agree to Terms & Privacy** (single checkbox, replaces 3 separate consents)

### Why optimize:
1. **Freemium conversion**: Lower signup friction = more trials
2. **Consent tracking**: Move granular consents to onboarding (after login)
3. **User experience**: 2 fewer decisions during signup

### Implementation:
1. Combine 3 consent checkboxes into 1 "Agree to Terms"
2. Store granular consent choices in user profile (after account created)
3. Show consent options during first login / onboarding

### Timeline:
- **Quick win**: Combine checkboxes (10 minutes, Phase 2.0)
- **Phase 2**: Move granular consents to onboarding flow

---

## Code Comparison

### Fortress (5 fields = complex)
```typescript
const [consents, setConsents] = useState<ConsentState>({
  dataCollection: false,    // ← 3 separate states
  feedbackUsage: false,
  emailNotifications: false,
});

// Validation requires ALL 3 passed
if (!consents.dataCollection || !consents.feedbackUsage) {
  setError("You must agree...");
  return;
}
```

### Kyro (1 field = simple)
```typescript
const [agreedToTerms, setAgreedToTerms] = useState(false);

// Validation is trivial
if (!agreedToTerms) {
  newErrors.terms = 'You must agree';
  return;
}
```

---

## 📞 DECISION NEEDED

Should we:

**Option A:** Keep current (3 consents) - gives more control
- ✅ Users know exactly what they're consenting to
- ❌ More form fields = lower conversion
- ❌ Takes longer to signup

**Option B:** Simplify to 1 checkbox (like Kyro) - maximize signup
- ✅ Lower friction = higher trial conversion
- ✅ Move granular consents to onboarding
- ❌ Less explicit at signup time

**Recommendation for freemium:** **Option B** (Kyro pattern)
- Align with freemium goal (maximize trials)
- Move detailed consent to onboarding (Phase 3)
- Can always add back if needed

---

## Next Steps

1. ✅ Fix login form (use Kyro's mounted pattern)
2. ⏳ **Simplify signup** (combine 3 checkboxes into 1)
3. ⏳ Move granular consents to onboarding flow
4. ⏳ Track conversion improvement

**Time estimate:** 30 minutes to optimize signup form
