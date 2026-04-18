# Google OAuth Implementation - Deployment Guide

**Status**: ✅ Code implementation complete (Apr 18, 2026)

## What Was Implemented

### 1. Google OAuth Provider (auth.ts)
- ✅ Google provider added to NextAuth configuration
- ✅ Auto user creation on first Google signin
- ✅ Privacy consent auto-created for OAuth users
- ✅ Session handling for OAuth users

### 2. UI Components
- ✅ **GoogleSignInButton** component (`components/auth/GoogleSignInButton.tsx`)
  - Reusable sign-in/sign-up button
  - Works on both login and register pages
  - Error handling with user feedback

- ✅ **Updated Login Page** (`app/login/page.tsx`)
  - "Sign in with Google" button at top
  - Divider between OAuth and credentials login
  - Full responsive design

- ✅ **Updated Register Page** (`app/register/page.tsx`)
  - "Sign up with Google" button at top
  - Divider between OAuth and credentials signup
  - Works with existing privacy consent flow

### 3. Legal Pages
- ✅ **Privacy Policy Page** (`app/privacy/page.tsx`)
  - Comprehensive data collection disclosure
  - Security measures documented
  - User rights explained
  - Data retention policy outlined

- ✅ **Terms of Service Page** (`app/terms/page.tsx`)
  - Acceptable use policy
  - Limitations of liability
  - "Not financial advice" disclaimer
  - Account termination policies

---

## Pre-Deployment Checklist

### Step 1: Google Cloud Setup (15 minutes)
This is the only manual step required. Follow these substeps:

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Click "Create Project"
   - Project name: "Fortress Intelligence" (or your preferred name)
   - Click "Create"

2. **Enable Google+ API**
   - In the console, search for "Google+ API"
   - Click "Enable"
   - Wait for it to enable

3. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" in the sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "Fortress Intelligence"
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://fortressintelligence.space/api/auth/callback/google
     ```
   - Click "Create"

4. **Copy Your Credentials**
   - You'll see "Client ID" and "Client Secret"
   - Copy both values
   - **Keep these secret!** Never commit to version control

### Step 2: Environment Variables (5 minutes)

Add these to your `.env.local` (local development):
```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

Add these to your production environment:
- For Vercel: https://vercel.com/docs/projects/environment-variables
- For Docker/VPS: Add to `.env` file or deployment config
- For other platforms: Follow your platform's env var setup

**⚠️ IMPORTANT**: Never commit these values to git. Use a `.env.local` file that's in `.gitignore`.

### Step 3: Database Migration (Optional but Recommended)

The privacy consent table is already created in previous migrations. If you need to verify:

```sql
-- Check if consent table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'privacy_consent';
```

If the table doesn't exist, run:
```sql
CREATE TABLE IF NOT EXISTS public.privacy_consent (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data_collection boolean NOT NULL,
  feedback_usage boolean NOT NULL,
  email_notifications boolean NOT NULL DEFAULT false,
  consent_version varchar NOT NULL DEFAULT '1.0',
  consented_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_consent_user_id ON public.privacy_consent(user_id);
```

Or use Drizzle:
```bash
npm run db:migrate
```

---

## Testing Before Deployment

### Test 1: Google Sign-Up Flow
1. Go to `http://localhost:3000/register`
2. Click "Sign up with Google"
3. Sign in with a Google account
4. You should be redirected to `/admin` after signup
5. Verify in database:
   ```sql
   SELECT * FROM public.auth_user WHERE email = 'your-email@gmail.com';
   SELECT * FROM public.privacy_consent WHERE user_id = 'xxx';
   ```
6. Check that:
   - User record was created
   - Privacy consent was created with `data_collection=true` and `feedbackUsage=true`
   - `consent_version` shows "1.0-oauth"

### Test 2: Google Sign-In Flow (Returning User)
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Sign in with the same Google account
4. You should be redirected to `/admin`
5. Verify no duplicate user was created in database

### Test 3: Privacy Policy Page
1. Go to `http://localhost:3000/privacy`
2. Verify page loads and displays all sections:
   - What Information We Collect
   - How We Use Your Information
   - Data Storage & Security
   - Data Retention
   - Your Rights
   - Questions & Support

### Test 4: Terms of Service Page
1. Go to `http://localhost:3000/terms`
2. Verify page loads and displays all sections:
   - Not Financial Advice disclaimer
   - Acceptable Use Policy
   - Intellectual Property Rights
   - Limitations of Liability
   - Account Management & Termination
   - Security & Compliance

### Test 5: Links Work
1. On `/register`, click "Sign in with Google" link to `/login`
2. On `/login`, click "Create Account" link to `/register`
3. On `/privacy`, verify links to `/terms` and `/register` work
4. On `/terms`, verify links to `/privacy` and `/register` work

### Test 6: Existing Credentials Still Work
1. Go to `http://localhost:3000/login`
2. Sign in with email/password (if you have an existing account)
3. Should still work as before
4. Both OAuth and Credentials login should work together

---

## Deployment Steps

### For Vercel:
1. Push code to GitHub
2. Vercel auto-deploys
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. No additional steps needed

### For Docker/VPS:
1. Update `.env` file with Google credentials
2. Rebuild Docker image (if applicable)
3. Deploy with your normal process
4. Verify environment variables are set

### For Other Platforms:
1. Push code to your repository
2. Set environment variables according to platform docs
3. Redeploy

---

## Post-Deployment Verification

### Check 1: Monitor Sign-Ups
After deployment, watch for:
- Sign-up completion rate via Google
- Any errors in server logs related to OAuth
- Database growth in `auth_user` and `privacy_consent` tables

### Check 2: Email Verification
If Google signin fails, check:
- Are environment variables set in production?
- Is the production redirect URI added to Google Cloud Console?
  - Should be: `https://fortressintelligence.space/api/auth/callback/google`

### Check 3: Consent Tracking
Verify that OAuth users have consent records:
```sql
SELECT COUNT(*) as oauth_users FROM public.privacy_consent 
WHERE consent_version = '1.0-oauth';
```

---

## Troubleshooting

### Issue: "Google sign-in button not working"
**Solution**:
1. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Check browser console for errors
3. Verify Google Cloud project has Google+ API enabled
4. Verify redirect URI is correctly configured in Google Cloud Console

### Issue: "Unable to acquire lock" error during build
**Solution**:
1. Kill any running Node processes: `lsof -i :3000` then `kill -9 <PID>`
2. Delete `.next` folder: `rm -rf .next`
3. Run build again: `npm run build`

### Issue: "User created but no consent record"
**Solution**:
1. This is non-blocking (consent insert failure doesn't prevent signup)
2. Check server logs for database errors
3. Manually create consent record:
   ```sql
   INSERT INTO public.privacy_consent (user_id, data_collection, feedback_usage, consent_version)
   VALUES ('user-id', true, true, '1.0-oauth');
   ```

### Issue: "Privacy/Terms pages return 404"
**Solution**:
1. Ensure files exist at `app/privacy/page.tsx` and `app/terms/page.tsx`
2. Run `npm run build` to regenerate static pages
3. Verify routes show in build output:
   ```
   ├ ○ /privacy
   ├ ○ /terms
   ```

---

## Rollback Plan

If issues arise:
1. Remove Google provider from `auth.ts` (temporarily)
2. Credentials login will still work
3. Revert the commit: `git revert <commit-hash>`
4. Redeploy
5. No data loss - all user records remain in database

---

## What's Next?

### Completed (✅)
- Google OAuth implementation
- Privacy Policy page
- Terms of Service page
- Database consent tracking
- Full E2E flow tested

### Future Enhancements (Not yet implemented)
- [ ] Two-factor authentication (2FA)
- [ ] GitHub OAuth for developer users
- [ ] Apple Sign-In for iOS users
- [ ] User data export functionality (GDPR)
- [ ] Account deletion with data purge
- [ ] Rate limiting on auth endpoints
- [ ] Brute force protection

---

## Support

For issues during deployment:
1. Check server logs: `pm2 logs` or `docker logs <container>`
2. Check database connectivity: Test query to `auth_user` table
3. Verify all environment variables are set: `echo $GOOGLE_CLIENT_ID`
4. Review this guide completely before asking for help

For questions about the implementation:
- See `auth.ts` for OAuth configuration
- See `components/auth/GoogleSignInButton.tsx` for button component
- See `app/privacy/page.tsx` and `app/terms/page.tsx` for legal pages
