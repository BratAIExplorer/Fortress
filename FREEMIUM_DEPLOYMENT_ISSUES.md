# Freemium Deployment Issues & Root Cause Analysis

**Date:** July 26-27, 2026  
**Status:** 🔴 **Login form not submitting** — identified root cause, solution found in Kyro project

---

## Issues Found in Session 28-29

### ✅ FIXED (4 issues)
| Issue | Fix | Commits |
|-------|-----|---------|
| Logout button shows when not logged in | Removed dead NextAuth code | 54d179a0 |
| useSession() scattered across codebase | Replaced with custom session checks | 4d1b1df7 |
| LoginForm sends `username` instead of `email` | Changed field name | 1a960d9e |
| Missing autoComplete attributes | Added attributes to inputs | cd2ae4ab |

### 🔴 CRITICAL BLOCKER (1 issue)
**Login form doesn't submit (NO POST request to `/api/auth/login`)**

**Symptoms:**
- Click submit button → nothing happens
- No network request appears
- Console shows no errors
- Form element exists but `onSubmit` handler is null
- No React event listeners attached to form element

**Root Cause:**
React hydration mismatch between server and client rendering.
- Server renders static HTML form (no handlers in HTML)
- Client-side React should attach event handlers during hydration
- Hydration fails → event handlers never attach → form doesn't work

**Attempted Fixes (all failed):**
1. Added `autoComplete` attributes ❌
2. Created LoginFormWrapper to isolate useSearchParams ❌
3. Used window.location.search instead of useSearchParams ❌

**Why they failed:**
- Issue was structural, not about dependencies
- Server component + Client component + Suspense created a hydration mismatch
- React couldn't reconcile server HTML with client component

---

## ✅ SOLUTION FOUND: Kyro's Working Pattern

After checking Kyro project (which has a WORKING login form), the fix is:

```typescript
// 1. Add "mounted" state to prevent hydration mismatch
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// 2. Don't render anything until mounted on client
if (!mounted) {
  return <SkeletonLoader />;
}

// 3. Render form in Suspense at page level
<Suspense fallback={<SkeletonLoader />}>
  <LoginForm />
</Suspense>

// 4. Use URLSearchParams for form data (not JSON)
const formBody = new URLSearchParams();
formBody.append('username', email);
formBody.append('password', password);

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formBody.toString(),
});
```

**Why this works:**
- The `mounted` state ensures server and client HTML match exactly
- No hydration mismatch → React can attach event handlers properly
- Suspense fallback prevents rendering while hydrating
- URLSearchParams is standard for OAuth2-style form submission

---

## Files to Update

1. `app/login/page.tsx` - Add mounted state + Suspense wrapper
2. `app/login/LoginForm.tsx` - Add mounted state + use URLSearchParams
3. Remove `LoginFormWrapper.tsx` (no longer needed)

---

## Next Steps

1. Apply Kyro pattern to Fortress LoginForm
2. Deploy to VPS
3. Test login flow end-to-end
4. Proceed with Freemium Phase 2 (trial tracking, feature gates)

---

## Why We Struggled

- Fortress used custom auth (Session 24 migration from NextAuth)
- Custom forms require careful hydration handling
- Multiple attempted workarounds instead of copying a proven pattern
- Kyro project provided the battle-tested solution

**Lesson**: Check similar working projects first before debugging edge cases.

---

## Kyro Reference

- **Location**: `/c/Antigravity/Kyro_Crypto_WealthGenerator/src/frontend/app/auth/login/page.tsx`
- **Pattern**: Page + mounted state + Suspense wrapper + LoginForm component
- **Form submission**: URLSearchParams (OAuth2 style)
- **Auth library**: Custom auth.ts (similar to Fortress approach)
- **Status**: WORKING ✅

---

**Time spent on debugging**: ~2 hours  
**Lines of code that actually fix it**: ~20 lines (mounted state + Suspense)  
**Lessons learned**: Debugging without a reference implementation is expensive.
