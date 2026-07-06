# Fortress Intelligence — Deployment Checklist

**Purpose:** Prevent deployment failures by validating code before pushing.

---

## Pre-Push Validation (REQUIRED)

### 1. Build Check (LOCAL)
```bash
cd /path/to/Fortress
npm run build
```

**Must succeed with:**
```
✓ Compiled successfully in X.Xs
✓ Generating static pages (43/43)
```

**If fails:** Fix the error locally. Do NOT push broken code.

### 2. ESLint Check
```bash
npm run lint
```

**Watch for:**
- ❌ `@typescript-eslint/no-explicit-any` errors → Remove `as any` type assertions
- ❌ `prefer-const` errors → Change `let` to `const` for non-reassigned variables
- ❌ `@typescript-eslint/no-unused-vars` → Remove unused variables

### 3. Git Status Check
```bash
git status
```

**Watch for:**
- ❌ `.claude/worktrees/` should NOT appear
- ❌ `.next/` should NOT appear
- ✅ Only source code changes

### 4. Config Files Validation
```bash
ls -la .env.production nginx.conf next.config.js
```

**All three must exist.**

---

## Commit & Push

```bash
git push origin main
```

---

## Post-Push Monitoring

**Check GitHub Actions:** https://github.com/BratAIExplorer/Fortress/actions

**On VPS after ~5 min:**
```bash
ssh root@76.13.179.32
cd /opt/fortress
pm2 logs fortress-app --lines 10
# Should end with: ✓ Ready in XXXms
```

**Public health check:**
```bash
curl https://fortressintelligence.space
# Should return HTTP 200
```

---

## Troubleshooting

**Build fails locally?**
```bash
npm run build 2>&1 | tail -50
npm run lint
```

**App not responding on HTTPS?**
```bash
# SSH to VPS
pm2 logs fortress-app --lines 50
# If no "Ready" message: npm run build && pm2 restart fortress-app
```

---

**App URL:** https://fortressintelligence.space
**Last Updated:** July 6, 2026
