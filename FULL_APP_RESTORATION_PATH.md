# Full App Restoration Path (July 5, 2026)

## Current State
- ✅ Minimal Node.js server deployed and live
- ✅ CI/CD pipeline fixed and ready
- ⏳ Full Next.js app blocked by dependency installation

## Missing Dependencies (Blocking Full Restoration)

### Already Installed
- next@15, react@19, typescript, next-auth, lucide-react, framer-motion
- drizzle-orm, react-hook-form, zod, axios

### Still Missing (Found During Build)
```
@/hooks/useOnboarding (custom file)
@/context/MarketContext (custom file)
class-variance-authority (UI lib)
@radix-ui/react-slot (UI lib)
+ many more custom hooks, contexts, components
```

## To Restore Full App

**Session 2 checklist:**
1. Run `npm audit` to identify all vulnerable/missing deps
2. Check git history for original package-lock.json (if it exists on an earlier branch)
3. Alternatively: Manually trace imports in app/*.tsx and components/*.tsx to build complete list
4. Install full dependency tree
5. Build locally: `npm run build`
6. Verify: `.next/standalone/server.js` exists
7. Push to main → GitHub Actions deploys

**Timeline:** 30-45 min with full dependency list  
**Confidence:** High (Next.js 15 will build clean once all deps present)

## Why We Didn't Do It This Session

- Turbopack symlink was a rabbit hole (4+ hours debugging)
- Minimal server is already live and working (shipped faster)
- Full app needs complete dependency audit (not guesswork)
- Next.js 15 is proven to build (no Turbopack issues)
- Better to have working app now + full restoration next = user value today + certainty tomorrow

## Files Ready for Deployment

- ✅ `package.json` (at root, has build scripts)
- ✅ `next.config.js` (standalone output configured)
- ✅ `tsconfig.json` (strict mode, path aliases)
- ✅ `.gitignore` + `.turbopackignore` (symlink excludes)
- ⏳ `node_modules/` (partially installed, needs completion)

Commit these when full deps resolved.
