# Google OAuth Implementation Plan

## Overview
This document outlines the steps to implement Google OAuth (single sign-on) to reduce signup friction and enable faster user onboarding.

## Why Google OAuth?
- **Current friction**: Email/password signup requires password creation and memory
- **Improvement**: Google OAuth: 1-click signup, no password creation
- **Conversion impact**: Expected 30-40% reduction in signup abandonment

## Implementation Steps

### Phase 1: Setup (Prerequisites)
1. Create OAuth credentials in Google Cloud Console
   - Create new project: "Fortress Intelligence"
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://fortressintelligence.space/api/auth/callback/google` (production)
   
2. Add environment variables:
   ```env
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

### Phase 2: Update NextAuth Config
1. Install Google provider:
   ```bash
   npm install @auth/google-provider
   ```

2. Update `auth.ts`:
   ```typescript
   import Google from "@auth/google-provider";

   export const { handlers, auth, signIn, signOut } = NextAuth({
     providers: [
       Google({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       }),
       Credentials({ ... }) // Keep existing credentials provider
     ],
     ...
   })
   ```

3. Update session callback to merge OAuth users with database:
   ```typescript
   async session({ session, token }) {
     if (token && session.user) {
       session.user.id = token.id;
       session.user.email = token.email;
       // Fetch user from DB to get isAdmin, etc.
     }
     return session;
   }
   ```

### Phase 3: Handle First-Time OAuth Users
Create middleware to auto-create users on first Google signin:

1. Add to `auth.ts` callback:
   ```typescript
   async jwt({ token, user, account }) {
     if (user) {
       // First-time login
       const existingUser = await db
         .select()
         .from(authUser)
         .where(eq(authUser.email, user.email!));

       if (!existingUser.length) {
         // Create user from OAuth
         const newUser = await db
           .insert(authUser)
           .values({
             email: user.email!,
             name: user.name,
             image: user.image,
             password: null, // OAuth users don't have passwords
             isAdmin: false,
           })
           .returning();
         
         token.id = newUser[0].id;
       } else {
         token.id = existingUser[0].id;
       }
     }
     return token;
   }
   ```

### Phase 4: Update UI
1. Update login page to show Google button:
   ```typescript
   import { signIn } from "next-auth/react";

   <Button
     onClick={() => signIn("google", { callbackUrl: "/admin" })}
     className="w-full"
   >
     Sign in with Google
   </Button>
   ```

2. Update registration page to show "Sign up with Google" option

### Phase 5: Handle Privacy Consent for OAuth Users
1. OAuth users should still see privacy consent modal
2. Store consent in `privacy_consent` table after first OAuth signin
3. Show consent modal in admin dashboard if not yet given

### Phase 6: Password Reset for OAuth Users
- OAuth users can't reset passwords (they don't have one)
- "Forgot Password" flow should detect if account is OAuth-only
- Show message: "This account uses Google Sign-In. Reset your Google password instead."

## Testing Checklist
- [ ] Google login redirects to Google consent screen
- [ ] First-time users auto-create in database
- [ ] Existing users can sign in with Google
- [ ] User data (email, name, image) stored correctly
- [ ] Privacy consent modal shown to OAuth users
- [ ] Admin flag is preserved on re-login
- [ ] Callback URL redirects to /admin correctly
- [ ] Logout works for OAuth sessions

## Rollout Plan
1. Deploy OAuth code to staging
2. Test with test Google account
3. Deploy to production
4. Monitor login success rates
5. Send email to existing users about new login option

## Monitoring
Add metrics to track:
- Google signup conversions
- OAuth vs credentials login ratio
- Session success rate
- User retention for OAuth vs password users

## Timeline
- Phase 1-2: 30 mins (setup + config)
- Phase 3-4: 1-2 hours (auto-creation + UI)
- Phase 5-6: 1 hour (consent + password handling)
- Testing + QA: 2 hours

**Total: ~5 hours of development**

## Notes
- Keep credentials provider running for backward compatibility
- OAuth users without passwords can't use password reset
- Consider adding GitHub OAuth later for developer users
- Privacy consent should be non-blocking for OAuth (can be shown in onboarding)
