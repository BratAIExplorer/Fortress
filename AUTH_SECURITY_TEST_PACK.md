# Fortress Intelligence — Authentication & Security Test Pack

**Status:** 🔴 CRITICAL GAP | 51 test cases needed | 9-12 days to implement  
**Created:** July 10, 2026 | **Owner:** QA Lead + Product Manager  
**Impact:** These tests are BLOCKING public beta (users won't trust app without auth)

---

## 📋 EXECUTIVE SUMMARY

### What's Missing
- ✗ **Signup workflow** (users can't create accounts yet)
- ✗ **Login/logout** (no session management)
- ✗ **Password reset** (no recovery mechanism)
- ✗ **Data isolation** (User A could theoretically access User B's data)
- ✗ **Security boundaries** (CSRF, XSS, rate limiting not tested)
- ✗ **Multi-user scenarios** (email verification, concurrent sessions)
- ✗ **Error handling** (network failures, expired tokens)
- ✗ **Account management** (profile, preferences, password change)

### Why This Is Critical
**Current state:** Fortress app works IF user is already logged in. But:
1. Users can't sign up (no signup page)
2. Users can't login (no auth endpoint)
3. Users can't be verified (no email verification)
4. **App is completely unusable for new users**

**Before public beta:** MUST have working auth + security tests

---

## 🚪 PHASE 0: UNAUTHENTICATED USER FLOWS

### Journey 0.1: New User Signup

#### Test 0.1.1: Visit Signup Page
```
Persona: First-time user
Platform: Desktop
Flow:
  Visit https://fortressintelligence.space/signup
  
Expected:
  - Signup form loads (email, password, confirm password)
  - Terms of Service link visible
  - "Already have account? Login" link visible
  - Submit button disabled until form valid
  
Status: ✗ BLOCKING — No signup page exists
```

#### Test 0.1.2: Enter Valid Email & Password
```
Persona: New user
Platform: Desktop
Flow:
  Email: newuser@gmail.com
  Password: SecurePass123!
  Confirm: SecurePass123!
  Click Submit

Expected:
  - Form validates locally (email format, password strength)
  - Submit button disabled during submission
  - POST /api/auth/signup request made
  - Response: { success: true, userId: "...", message: "Verification email sent" }
  - User redirected to /verify-email page
  - Toast: "Check your inbox for verification link"
  
Status: ✗ BLOCKING — No signup endpoint
```

#### Test 0.1.3: Validation Errors
```
Persona: Careless user
Platform: Desktop
Flow:
  Test 3a: Email = "invalid-email" (no @)
  Test 3b: Password = "weak" (too short)
  Test 3c: Passwords don't match
  Test 3d: Email already exists

Expected (3a):
  - Error: "Enter valid email (user@domain.com)"
  - Submit button disabled
  
Expected (3b):
  - Error: "Password must be 8+ characters, include uppercase, number, symbol"
  - Submit button disabled
  
Expected (3c):
  - Error: "Passwords don't match"
  - Confirm password field highlighted
  
Expected (3d):
  - After submit: Error toast "Email already registered. Try login instead."
  
Status: ✗ BLOCKING — Validation not built
```

#### Test 0.1.4: Email Verification Link
```
Persona: Newly signed up user
Platform: Email client + web
Flow:
  1. Signup → Email sent to inbox
  2. User opens email → Finds "Verify Your Account" link
  3. Click link → Redirected to /verify?token=xyz123
  4. Token validated on server
  5. Account marked as verified
  6. Redirected to /login with message "Email verified! You can now login"
  
Expected:
  - Email contains: subject line, company branding, clear CTA
  - Link includes unique token (JWT or UUID)
  - Token valid for 24 hours only
  - Link expires after 1 use
  - Can request new link if first one expired
  
Status: ✗ BLOCKING — Email service not integrated
```

#### Test 0.1.5: Duplicate Account Prevention
```
Persona: User trying to create second account with same email
Platform: Desktop
Flow:
  User 1: Sign up with john@example.com
  User 2 (malicious): Sign up with john@example.com
  
Expected:
  - Backend: Unique constraint on users.email
  - API returns 409 Conflict: "Email already registered"
  - User sees error: "Account with this email already exists. Login instead."
  - No account created
  
Status: ✗ BLOCKING — DB constraint not enforced
```

---

### Journey 0.2: Existing User Login

#### Test 0.2.1: Visit Login Page
```
Persona: Returning user
Platform: Desktop
Flow:
  Visit https://fortressintelligence.space/login
  
Expected:
  - Login form loads (email, password, "Remember me" checkbox)
  - "Forgot password?" link visible
  - "Create account" link visible
  - Submit button visible
  
Status: ✗ BLOCKING — No login page
```

#### Test 0.2.2: Successful Login
```
Persona: Verified user
Platform: Desktop
Flow:
  Email: john@example.com
  Password: SecurePass123!
  Click Submit

Expected:
  - POST /api/auth/login request
  - Server validates email + password
  - JWT token created
  - HTTP-only cookie set: auth_token=jwt...
  - Response: { success: true, user: { id, email, name } }
  - Redirected to /dashboard
  - Can now access /portfolio, /fortress-30, etc.
  
Status: ✗ BLOCKING — No login endpoint
```

#### Test 0.2.3: Remember Me
```
Persona: User on home computer
Platform: Desktop
Flow:
  Check "Remember me" checkbox
  Enter email + password
  Click Submit
  Close browser
  Reopen browser → Visit /portfolio

Expected:
  - Cookie set with 30-day expiration
  - Session persists across browser restart
  - User still logged in (no login page shown)
  - Logout clears cookie
  
Status: ✗ BLOCKING — Session persistence not built
```

#### Test 0.2.4: Login Errors
```
Persona: User with wrong password
Platform: Desktop
Flow:
  Test 4a: Email = correct, Password = wrong
  Test 4b: Email = wrong, Password = anything
  Test 4c: Account not verified yet

Expected (4a):
  - After submit: Error toast "Invalid password"
  - No user data returned
  - Session not created
  
Expected (4b):
  - After submit: Error toast "No account found with that email"
  
Expected (4c):
  - After submit: Error "Email not verified yet. Check inbox for link."
  - Link to "Resend verification email"
  
Status: ✗ BLOCKING — Error messages not implemented
```

#### Test 0.2.5: Account Lockout
```
Persona: Attacker trying brute force
Platform: Desktop + Bash
Flow:
  Submit login with wrong password 5 times in 60 seconds

Expected:
  - Attempt 1-4: Error message "Invalid password"
  - Attempt 5: Error message "Too many failed attempts. Account locked for 15 minutes."
  - Subsequent requests: 429 Too Many Requests
  - Email sent to user: "Someone tried to login to your account"
  - After 15 min: Account unlocked
  
Status: ✗ BLOCKING — Rate limiting not implemented
```

---

### Journey 0.3: Password Reset

#### Test 0.3.1: Forgot Password Link
```
Persona: User forgot password
Platform: Desktop
Flow:
  Click "Forgot Password" on /login page
  
Expected:
  - Redirected to /forgot-password
  - Form with email field visible
  - Submit button + "Back to login" link
  
Status: ✗ BLOCKING — No forgot password page
```

#### Test 0.3.2: Request Password Reset
```
Persona: Verified user
Platform: Desktop + Email
Flow:
  Enter email: john@example.com
  Click Submit

Expected:
  - API validates email exists
  - Generate password reset token
  - Email sent with "Reset Password" link
  - Message shown: "Check your inbox for reset link (valid 2 hours)"
  - Link format: /reset-password?token=xyz123
  
Status: ✗ BLOCKING — Email sending not integrated
```

#### Test 0.3.3: Reset Password
```
Persona: User clicking reset link
Platform: Desktop
Flow:
  1. Click email link → /reset-password?token=xyz
  2. Form: new password + confirm
  3. Submit

Expected:
  - Token validated (exists, not expired, matches user)
  - New password hashed, stored in DB
  - Old password no longer works
  - Redirect to /login with message "Password reset successful"
  - Old session invalidated (force re-login)
  
Status: ✗ BLOCKING — Reset endpoint not built
```

#### Test 0.3.4: Reset Token Expiration
```
Persona: User with old reset link
Platform: Desktop
Flow:
  Reset email sent 2 hours ago
  User clicks link → /reset-password?token=old123

Expected:
  - Error message: "This reset link has expired"
  - "Request new reset link" button shown
  - Form not usable
  
Status: ✗ BLOCKING — Token TTL not enforced
```

---

## 🔒 PHASE 1: SECURITY BOUNDARIES

### Journey 1.1: User Data Isolation

#### Test 1.1.1: Can't Access Other User's Strategy
```
Persona: Attacker (User B)
Platform: Browser DevTools
Flow:
  User A creates strategy ID: "strategy_abc123"
  User A shares ID in forum (public)
  User B tries: GET /api/portfolio/strategy_abc123 (without User A login)

Expected:
  - Response: 401 Unauthorized
  - Message: "Authentication required"
  - No strategy data leaked
  
Variant 2:
  User B logs in with own account
  User B tries: GET /api/portfolio/strategy_abc123
  
Expected:
  - Response: 403 Forbidden
  - Message: "You don't have access to this strategy"
  - Verify userId in token matches strategy owner
  
Status: ✗ CRITICAL SECURITY GAP
```

#### Test 1.1.2: Trade Data Isolation
```
Persona: User B querying User A's trades
Platform: API
Flow:
  GET /api/analysis/feedback?userId=user_a_id

Expected:
  - Response: 403 Forbidden
  - Each trade includes userId
  - Server-side check: Requesting userId === trade.userId
  
Status: ✗ CRITICAL SECURITY GAP
```

#### Test 1.1.3: Portfolio Holdings Isolation
```
Persona: Competitor trying to steal User A's allocation
Platform: API
Flow:
  GET /api/portfolio/[strategy_id]/holdings

Expected:
  - Authenticate user
  - Check strategy ownership
  - Only return if requester == owner
  - Otherwise: 403 Forbidden
  
Status: ✗ CRITICAL SECURITY GAP
```

---

### Journey 1.2: CSRF Protection

#### Test 1.2.1: Form Submission Requires CSRF Token
```
Persona: Attacker hosting phishing site
Platform: Browser
Flow:
  User logs into Fortress (session created)
  User visits attacker.com
  Page contains hidden form: POST /api/portfolio (create strategy)
  Form auto-submits without CSRF token

Expected:
  - Request rejected: 403 Forbidden
  - Message: "Invalid CSRF token"
  - Strategy not created
  - Session log recorded (suspicious activity)
  
Status: ✗ CRITICAL SECURITY GAP
```

#### Test 1.2.2: CSRF Token Rotation
```
Persona: User making multiple requests
Platform: Desktop
Flow:
  1. Load /portfolio → Get CSRF token A
  2. Create strategy → Use token A
  3. Edit holdings → Receive token B (rotated)
  4. Try delete with token A (old)

Expected:
  - Request 3 succeeds (token A valid once)
  - Request 4 rejected (token A no longer valid)
  - Each successful request issues new token
  
Status: ✗ CRITICAL SECURITY GAP
```

---

### Journey 1.3: XSS Prevention

#### Test 1.3.1: Malicious Input in Strategy Name
```
Persona: Attacker
Platform: Browser
Flow:
  Create strategy with name: <script>alert('hacked')</script>
  Save to DB
  Load /portfolio → Strategy card displayed

Expected:
  - Input sanitized on save (HTML entities escaped)
  - Displays as literal text: "&lt;script&gt;alert('hacked')&lt;/script&gt;"
  - No alert() executed
  - No XSS vulnerability
  
Status: ✗ CRITICAL SECURITY GAP
```

#### Test 1.3.2: XSS in API Response
```
Persona: Backend returns user-generated data
Platform: API
Flow:
  POST /api/portfolio (save strategy with name containing <img src=x onerror=alert()>)
  GET /api/portfolio (retrieve same strategy)
  Frontend displays name in card

Expected:
  - API escapes output: name field contains &lt;img ...&gt;
  - Frontend uses textContent (not innerHTML)
  - Script never executes
  
Status: ✗ CRITICAL SECURITY GAP
```

---

### Journey 1.4: SQL Injection Prevention

#### Test 1.4.1: SQL Injection in Search
```
Persona: Attacker
Platform: Browser console
Flow:
  Search ticker: '; DROP TABLE trades; --
  API call: GET /api/search?ticker=...

Expected:
  - Parameterized query used (not string concatenation)
  - Drizzle ORM prevents injection
  - Treated as literal string
  - Search returns 0 results (ticker doesn't exist)
  - Database remains intact
  
Status: ✓ LIKELY SAFE (Drizzle ORM handles this)
Verification Needed: Audit query construction in codebase
```

---

### Journey 1.5: Rate Limiting

#### Test 1.5.1: Login Rate Limit
```
Persona: Attacker
Platform: Bash script
Flow:
  Submit 5 login attempts in 10 seconds
  Each with different password

Expected:
  - Attempt 1-4: 401 Unauthorized
  - Attempt 5+: 429 Too Many Requests
  - Account locked 15 minutes
  - Email: "Multiple failed login attempts detected"
  
Status: ✗ NOT IMPLEMENTED
```

#### Test 1.5.2: API Rate Limit
```
Persona: Bot scraping data
Platform: API
Flow:
  Make 100 requests to /api/analysis/gem-score in 1 minute

Expected:
  - Request 1-50: 200 OK
  - Request 51+: 429 Too Many Requests
  - Response header: Retry-After: 60
  - IP-based throttling
  
Status: ✗ NOT IMPLEMENTED
```

---

### Journey 1.6: CORS Headers

#### Test 1.6.1: Cross-Origin Request
```
Persona: Attacker on different domain
Platform: Browser
Flow:
  From attacker.com, fetch('/api/portfolio', credentials: 'include')

Expected:
  - Browser sends Origin: attacker.com
  - Server checks CORS header
  - Only fortressintelligence.space allowed
  - Response: 403 Forbidden (CORS error)
  - No data leaked
  
Status: ✗ CORS HEADERS NOT CONFIGURED
```

#### Test 1.6.2: Same-Site Cookies
```
Persona: User on Fortress + attacker.com in other tab
Platform: Browser
Flow:
  Cookie attribute: SameSite=Strict
  Attacker.com tries to send request with auth cookie

Expected:
  - Cookie not sent cross-site
  - Request rejected: 401 Unauthorized
  - Only sent if same-site
  
Status: ✗ COOKIE POLICY NOT SET
```

---

## 👥 PHASE 2: MULTI-USER SCENARIOS

### Journey 2.1: Email Verification

#### Test 2.1.1: Unverified User Can't Access Dashboard
```
Persona: New signup
Platform: Desktop
Flow:
  1. Signup → Email sent
  2. Don't click verification link
  3. Try to access /portfolio directly

Expected:
  - Redirect to /verify-email
  - Message: "Email not verified. Check inbox."
  - Link to "Resend verification email"
  
Status: ✗ VERIFICATION FLOW NOT BUILT
```

#### Test 2.1.2: Resend Verification Email
```
Persona: User with expired verification link
Platform: Desktop
Flow:
  Click "Resend verification email"
  Check inbox again

Expected:
  - New email sent with new token
  - Old token invalidated
  - New link valid for 24 hours
  
Status: ✗ RESEND FLOW NOT BUILT
```

---

### Journey 2.2: Concurrent Sessions

#### Test 2.2.1: Same User on Desktop + Mobile
```
Persona: User
Platform: Desktop + iPhone
Flow:
  1. Login on Desktop → Session A created
  2. Login on iPhone → Session B created
  3. Both sessions active simultaneously
  4. Create strategy on Desktop
  5. Refresh /portfolio on iPhone

Expected:
  - Both sessions valid concurrently
  - New strategy visible on iPhone immediately
  - Can logout Desktop independently (Mobile still logged in)
  
Status: ✗ SESSION HANDLING NOT TESTED
```

#### Test 2.2.2: Logout One Device
```
Persona: User
Platform: Desktop + iPhone
Flow:
  Logout on Desktop (click logout button)
  Try to access /portfolio on iPhone

Expected:
  - Desktop: Redirected to /login, session destroyed
  - iPhone: Still logged in, /portfolio accessible
  - Can logout iPhone independently
  
Status: ✗ LOGOUT NOT TESTED
```

---

### Journey 2.3: Session Timeout

#### Test 2.3.1: Idle Timeout
```
Persona: User
Platform: Desktop
Flow:
  Login → Session TTL set to 1 hour
  Leave page idle for 1 hour
  Try to access /portfolio

Expected:
  - Session expired (checked server-side)
  - Redirect to /login with message "Session expired. Please login again."
  - Token in cookie cleared
  
Status: ✗ SESSION EXPIRATION NOT IMPLEMENTED
```

#### Test 2.3.2: Refresh Token
```
Persona: User
Platform: Desktop
Flow:
  Login → JWT access token (30 min) + refresh token (7 days)
  After 35 minutes: Try to access /portfolio
  Access token expired, refresh token valid

Expected:
  - Automatically request new access token
  - Continue using app without interruption
  - User never sees login page
  - New access token issued
  
Status: ✗ REFRESH TOKEN FLOW NOT BUILT
```

---

## ⚙️ PHASE 3: ACCOUNT MANAGEMENT

### Journey 3.1: User Profile

#### Test 3.1.1: View Profile
```
Persona: Logged-in user
Platform: Desktop
Flow:
  Click profile icon → /profile page

Expected:
  - User info displayed: email, name, created date
  - Edit buttons for email, name, password
  - Delete account option
  
Status: ✗ PROFILE PAGE NOT BUILT
```

#### Test 3.1.2: Change Email
```
Persona: User
Platform: Desktop
Flow:
  Click edit email → Enter new email: newemail@gmail.com
  Submit

Expected:
  - Verification email sent to NEW email
  - Old email still valid until new email verified
  - Message: "Verification link sent to newemail@gmail.com"
  - Click link → Email changed, session continues
  
Status: ✗ EMAIL CHANGE NOT BUILT
```

### Journey 3.2: Password Management

#### Test 3.2.1: Change Password (Logged In)
```
Persona: User
Platform: Desktop
Flow:
  /profile → Change password section
  Enter: old password, new password, confirm new

Expected:
  - Verify old password correct
  - Hash and save new password
  - Message: "Password changed successfully"
  - All other sessions invalidated (force re-login)
  
Status: ✗ PASSWORD CHANGE NOT BUILT
```

---

## ⚠️ PHASE 4: EDGE CASES & ERROR HANDLING

### Journey 4.1: Network Failures

#### Test 4.1.1: Signup Timeout
```
Persona: User on slow 3G connection
Platform: Mobile
Flow:
  Fill signup form
  Click Submit
  Network drops after 5 seconds

Expected:
  - Show loading spinner / "Creating account..."
  - After 10s: "Connection timeout. Try again?"
  - Retry button available
  - Don't auto-submit again
  
Status: ✗ TIMEOUT HANDLING NOT BUILT
```

#### Test 4.1.2: Network Restored During Request
```
Persona: User
Platform: Mobile with flaky WiFi
Flow:
  Submit form → Network drops
  Network reconnects after 3s
  Request retries automatically

Expected:
  - Retry logic implemented (exponential backoff)
  - Show "Retrying..." message
  - On success: Complete flow
  - On failure after 3 retries: Show error + manual retry
  
Status: ✗ RETRY LOGIC NOT BUILT
```

---

### Journey 4.2: Server Errors

#### Test 4.2.1: Database Error During Signup
```
Persona: User
Platform: Desktop
Flow:
  Submit signup → DB connection fails

Expected:
  - Don't expose error details (no SQL errors to user)
  - Show generic message: "Unable to create account. Try again later."
  - Log real error server-side (for debugging)
  - Status: 500 Internal Server Error
  
Status: ✗ ERROR HANDLING NOT TESTED
```

#### Test 4.2.2: Email Service Down
```
Persona: User
Platform: Desktop
Flow:
  Signup → Email provider unreachable

Expected:
  - Account still created (don't block signup)
  - Show message: "Account created but verification email failed. We'll retry shortly."
  - Queue email for retry (background job)
  - User can manually request email
  
Status: ✗ EMAIL RETRY QUEUE NOT BUILT
```

---

## 🛠️ IMPLEMENTATION ROADMAP

### Week 1 (Priority: CRITICAL)
- [ ] Setup NextAuth (OAuth + JWT)
- [ ] Implement `/api/auth/signup` endpoint
- [ ] Implement `/api/auth/login` endpoint
- [ ] Implement `/api/auth/logout` endpoint
- [ ] Setup email verification (nodemailer or similar)
- [ ] Add database schema: users, sessions, email_tokens

### Week 2 (Priority: HIGH)
- [ ] Implement `/api/auth/forgot-password` + reset flow
- [ ] Add CSRF protection (cookies + tokens)
- [ ] Add rate limiting (5 failed logins → lockout)
- [ ] Implement session management (TTL, refresh tokens)
- [ ] Add data isolation checks (userId in all queries)

### Week 3 (Priority: HIGH)
- [ ] Implement XSS prevention (input sanitization)
- [ ] Configure CORS headers (allow only fortressintelligence.space)
- [ ] Setup SameSite cookies
- [ ] Add error handling (network timeouts, server errors)
- [ ] Test all flows end-to-end

### Week 4 (Priority: MEDIUM)
- [ ] Implement `/profile` page
- [ ] Add change password flow
- [ ] Add account preferences (dark mode, currency, etc.)
- [ ] Email verification resend
- [ ] Account deletion flow

---

## ✅ TESTING CHECKLIST

### Before Beta Launch
- [ ] All 51 auth/security tests passing
- [ ] No CRITICAL security gaps
- [ ] Data isolation verified for all API endpoints
- [ ] CSRF + XSS + SQL injection tested
- [ ] Rate limiting on auth endpoints
- [ ] Email verification working end-to-end
- [ ] Session timeout tested
- [ ] Password reset tested
- [ ] Error messages user-friendly (no stack traces)
- [ ] CORS headers configured
- [ ] SameSite cookies set
- [ ] Security headers set (X-Frame-Options, X-Content-Type-Options, etc.)

### Deployment Checklist
- [ ] Secrets (email password, JWT secret) in environment variables (NOT in git)
- [ ] Database encrypted in transit (SSL/TLS)
- [ ] HTTPS enforced (no HTTP)
- [ ] Logs don't contain sensitive data (passwords, tokens)
- [ ] Backup / disaster recovery tested
- [ ] Rate limiting monitored (adjust if needed)

---

**Version:** 1.0 | **Status:** GAP ANALYSIS COMPLETE, READY FOR DEVELOPMENT | **Blocker for Beta:** YES
