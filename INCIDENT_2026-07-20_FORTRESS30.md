# Incident: Fortress 30 "No scan data yet" / fake data — 2026-07-20

**Status:** Partially closed. Infra bugs fixed and verified live. One large
open finding (mock scan data) requires a separate follow-up task.

**Reported symptom:** `/fortress-30` showed "No India scan data yet" despite
Session 19 (2026-07-19) claiming the scanner cron jobs were fixed.

---

## Bug 1 — PostgreSQL was down
**Cause:** `systemctl` showed `postgresql.service` as `inactive` and
`disabled` (would not survive a reboot). App and cron were both healthy;
every DB query failed with `ECONNREFUSED`.
**Fix:** `systemctl start postgresql`. Added a systemd drop-in
(`/etc/systemd/system/postgresql.service.d/override.conf`, `Restart=on-failure`)
so a future crash self-heals instead of requiring manual intervention.
**Verify:** `systemctl is-active postgresql && systemctl is-enabled postgresql`
should both return non-error state.

## Bug 2 — `fortress_user` had no table grants
**Cause:** `scans`/`scan_results` tables were created under a different
Postgres role at some point; `fortress_user` (the app's connection role)
had never been granted access. Surfaced as `permission denied for table
scans` once Postgres was back up.
**Fix:** `GRANT ALL PRIVILEGES ON ALL TABLES/SEQUENCES IN SCHEMA public TO
fortress_user`, plus `ALTER DEFAULT PRIVILEGES` so future migrations don't
repeat this.
**Verify:** any authenticated query against `scans`/`scan_results` should
succeed as `fortress_user`, not just as `postgres`.

## Bug 3 — `.env.production` was tracked in git despite being gitignored
**Cause:** Force-committed at some point before the `.gitignore` rule
existed, never untracked. Every `git pull` on the VPS reset the file to
the committed version — silently wiping `CRON_SECRET` (and any other
manual server-side fix) added after that commit. This is the actual
reason CRON_SECRET kept vanishing across multiple "fixed" sessions.
**Fix:** `git rm --cached .env.production` + commit (669978fb). Recreated
the file with real production values directly on the VPS afterward (the
untrack operation deletes the working-tree copy on any machine that later
pulls the removal commit — recreate before assuming it's still there).
**Verify:** `git status` on the VPS should show `.env.production` as
untracked; `git log -- .env.production` should show no commits after
669978fb touching it.

## Bug 4 — Next.js standalone build reads its own copy of `.env.production`
**Cause:** PM2 runs `.next/standalone/server.js`. Next's standalone output
reads `.env.production` from `.next/standalone/`, not the project root.
Every edit to the root file was invisible to the running app until a
manual `cp` synced it — this is why fixes "didn't take" even after a
correct-looking file edit and restart.
**Fix:** `cp .env.production .next/standalone/.env.production` added as a
**required step on every deploy**, not just once.
**Verify:** diff the two files after any deploy; they must match.

## Bug 5 — PM2 process registration had drifted from `ecosystem.config.js`
**Cause:** `fortress-cron` was, at some point, started manually via
`pm2 start cron-scheduler-wrapper.js`, a side-script not declared in
`ecosystem.config.js` (which declares `cron-scheduler.js`). Every
`pm2 restart`/`--update-env` since then resurrected the stale wrapper
registration, and the wrapper — not `ecosystem.config.js` — was the only
place `.env.production` actually got loaded into the process. Once the
wrapper file was deleted, plain `cron-scheduler.js` had no env-loading
logic and CRON_SECRET was silently never set.
**Fix:** Removed `cron-scheduler-wrapper.js` entirely. Moved env-loading
into `ecosystem.config.js` itself (commit 354ef547) — the one file PM2
actually parses — so `CRON_SECRET` is explicit in the `fortress-cron`
app's `env` block and can't drift again. `pm2 delete` both apps and
`pm2 start ecosystem.config.js` fresh to clear the stale registration,
then `pm2 save`.
**Verify:** `pm2 describe fortress-cron | grep "script path"` must show
`cron-scheduler.js`, never a wrapper. Restart count (`↺`) should stay near
0 after a clean start.

## Bug 6 — NSE universe file never existed
**Cause:** `lib/scanners/nifty500-static.csv` was referenced in code
(`lib/scanners/universe.ts`) but never actually generated/committed —
neither in the repo nor on the VPS. `getNSEUniverse()` fell through its
static-file → live-fetch → hardcoded-fallback chain every time, landing on
a 49-name hardcoded Nifty 50 list. Live fetch from NSE's archive is
blocked by Akamai bot protection from both the dev machine and the VPS
(confirmed directly — 403).
**Fix:** Sourced a real 501-constituent Nifty 500 list via a Wayback
Machine snapshot (2024-02-26) of NSE's archive CSV and committed it as
`lib/scanners/nifty500-static.csv` (commit 5d3f53e0).
**Verify:** `wc -l lib/scanners/nifty500-static.csv` → ~501; a completed
NSE scan's `total_scanned` in the `scans` table should be ~500, not 49.
**Staleness risk:** NSE reconstitutes the Nifty 500 roughly twice a year.
Regenerate every 6 months (see `Reference/OutoftheBox/fetch_nifty500.py`,
though the live NSE fetch will likely still be blocked — repeat the
Wayback Machine CDX-API approach if so:
`http://archive.org/wayback/available?url=archives.nseindia.com/content/indices/ind_nifty500list.csv`).

## Bug 7 (UX, not infra) — DB outages rendered identically to "no scan yet"
**Cause:** `getLiveF30Stocks`/`getLiveF30Candidates` in `app/actions.ts`
caught DB errors and returned `[]`, indistinguishable from a healthy scan
that simply hasn't run. This is what let Bug 1/2 go unnoticed as "the
cron isn't configured" instead of "the database is down."
**Fix:** DB failures now throw; `app/fortress-30/page.tsx` catches and
passes `dbError` to `Fortress30Grid`, which renders a distinct red
"System issue — data temporarily unavailable" banner (commit 6b3ce718).
**Verify:** stop Postgres in a staging environment and confirm the UI
shows the red banner, not the grey "No scan data yet" placeholder.

## NOT a bug we introduced, but found — mock scan data (OPEN)
`MASSIVE_API_KEY` is unset in production. `app/api/scan/run/route.ts`
silently falls back to a 16-ticker hardcoded dictionary plus a flat
MB-70/₹100 placeholder for every other ticker whenever the key is
missing — meaning **every scan result shown in Fortress 30, on both
markets, has been synthetic**, not computed. Massive's API additionally
has **no NSE coverage** (confirmed: 404 on `RELIANCE.NS`), so setting the
key would only fix US, not India.
**Recommended fix (not yet implemented):** point the scanner at the
`yahoo-finance2`-based scoring logic already working in
`app/api/analysis/gem-score/route.ts` (real, live, NSE-capable via `.NS`
auto-detection) instead of the Massive-only `scoreTicker`. Needs to be
scoped as its own task — touches the scoring engine for both markets.

---

## New monitoring in place
- **Postgres auto-restart:** systemd `Restart=on-failure` — self-heals a
  crash without waiting for someone to notice.
- **UI outage banner:** DB failures are now visually distinct from empty
  scans on `/fortress-30` (per market).
- **Last-scan timestamp:** `/fortress-30` now shows "Last scanned: [date,
  time] UTC" per market, sourced from `scans.run_at`, so staleness is
  visible without checking the DB directly.

## Still open / recommended next steps
1. **Mock scan data (above)** — the highest-priority follow-up; current
   Fortress 30 rankings are not real.
2. **External uptime monitoring** — an outside service (e.g. UptimeRobot)
   hitting `/api/scan/results` would catch a scenario none of today's
   fixes cover: the whole VPS becoming unreachable, which no in-app
   banner or systemd unit can detect from inside the box.
3. **Rotate `DATABASE_URL` credentials** — `fortress_password` has been
   sitting in git history (via the now-untracked `.env.production`)
   across multiple prior commits. Untracking stops future exposure but
   doesn't erase history; consider rotating the password and scrubbing
   history if this repo is ever made public.
4. Re-run `nifty500-static.csv` regeneration in ~6 months (see Bug 6).
