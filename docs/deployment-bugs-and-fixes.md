# Fortress Intelligence — Deployment Bugs & Fixes

## Bug 1: Port conflict (EADDRINUSE) on redeploy
**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000` — new process can't start.
**Root cause:** Old pm2 process still holding port 3000 when new one starts.
**Fix:** Always `pm2 reload ecosystem.config.js --update-env` (graceful reload, not delete+start). The ecosystem.config.js now manages this cleanly.
**Prevention:** Use `deploy-app.sh` which uses `pm2 reload` with `ecosystem.config.js`.

---

## Bug 2: DATABASE_URL undefined in standalone server
**Symptom:** `❌ Invalid environment variables: DATABASE_URL: expected string, received undefined`
**Root cause:** Next.js standalone server (`node .next/standalone/server.js`) does NOT automatically read `.env.local`. The old `next start` did, but standalone mode doesn't.
**Fix:** Created `start.sh` wrapper that `source`s `.env.local` before starting the node process:
```bash
set -a
source "$(dirname "$0")/.env.local"
set +a
exec node "$(dirname "$0")/.next/standalone/server.js"
```
**Prevention:** Never start the app with `npm start` or `next start` in production. Always use `pm2 start ecosystem.config.js`.

---

## Bug 3: Wrong start command (`next start` vs standalone)
**Symptom:** Warning `"next start" does not work with "output: standalone"` — app starts slowly or fails.
**Root cause:** `next.config.ts` has `output: "standalone"` but `package.json` `start` script was `next start`, and the old deploy script used `npm -- start`.
**Fix:** `ecosystem.config.js` now points to `start.sh` → `node .next/standalone/server.js`.
**Prevention:** `deploy-app.sh` uses `pm2 start ecosystem.config.js`, never `npm start`.

---

## Bug 4: Static assets missing in standalone mode
**Symptom:** CSS/JS 404s after deployment.
**Root cause:** `next build` with `output: standalone` does NOT automatically copy `.next/static/` or `public/` into `.next/standalone/`.
**Fix:** `deploy-app.sh` includes:
```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true
```
**Prevention:** Always include these copy steps after every build.

---

## Bug 5: Duplicate market selector on Fortress 30 page
**Symptom:** Two "India / United States" selectors visible — one in nav, one in page body.
**Root cause:** Navbar has `<MarketSelector>` (React Context-based), fortress-30 page had its own `<MarketSelectorServer>` (URL param-based). They were disconnected.
**Fix:**
- Removed `MarketSelectorServer` from fortress-30 page.
- Updated `MarketSelector` to be URL-aware: when on `/fortress-30`, clicking a market navigates to `/fortress-30?market=X` (updates both context AND URL).
- Default market changed from `NSE` → `US` (since US has live scan data, NSE is coming soon).
**Prevention:** Market selection must be handled in ONE place. `MarketSelector` in nav is the single source of truth. Pages that need URL-based data fetching should use the URL param that the nav writes.

---

## Bug 6: WisdomWidget stuck on "Loading Wisdom..."
**Symptom:** Widget hangs in loading state, never shows content or error.
**Root cause:** `fetch('/api/wisdom')` was failing silently — the `.catch()` only logged to console but never updated state.
**Fix:** Added `error` state — on failure, widget returns `null` (disappears cleanly) instead of hanging.
**Prevention:** Every fetch in a widget must handle the error state and update React state accordingly, not just `console.error`.

---

## Bug 7: UntrustedHost auth error
**Symptom:** `[auth][error] UntrustedHost: Host must be trusted. URL was: http://76.13.179.32/api/auth/session`
**Root cause:** NextAuth requires `NEXTAUTH_URL` to match the request host, and raw IP wasn't trusted.
**Fix:** Added `AUTH_TRUST_HOST=true` to `.env.local`.
**Prevention:** Always set `AUTH_TRUST_HOST=true` in production `.env.local`. Set `NEXTAUTH_URL` to the canonical domain (e.g., `https://fortressintelligence.space`), not the IP.

---

## Correct Deployment Procedure (as of Apr 2026)

```bash
# On the VPS at /opt/fortress:
bash deploy-app.sh
```

This script:
1. `git pull` latest from main
2. `npm install`
3. `npm run build`
4. Copies static assets into standalone directory
5. `pm2 reload ecosystem.config.js --update-env` (zero-downtime reload)
6. `pm2 save` (persists across reboots)

### Prerequisites (one-time setup)
- `.env.local` at `/opt/fortress/.env.local` with all required vars including `AUTH_TRUST_HOST=true`
- `start.sh` is executable (`chmod +x start.sh`)
- `ecosystem.config.js` exists (committed in repo, pulled by deploy script)
