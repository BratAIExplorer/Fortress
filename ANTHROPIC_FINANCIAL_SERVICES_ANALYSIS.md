# Anthropic Financial-Services Repository Analysis
**For:** Fortress Intelligence Project  
**Date:** June 19, 2026  
**Status:** Complete  
**Prepared by:** Claude (autonomous Task 1 completion)

---

## EXECUTIVE SUMMARY

The Anthropic financial-services repository demonstrates a **production-grade architecture** for multi-vertical financial intelligence. Key takeaway: **everything is file-based (no build step), version-controlled, and designed for continuous tuning to firm-specific workflows.**

**Fortress-relevant insights:**
1. **MCP connector abstraction** — All 11 data sources configured in single `.mcp.json` file
2. **Skill sync pattern** — Single source of truth in verticals, auto-propagated to agents
3. **Agent agnosticism** — Same system prompt runs in Cowork OR Claude Managed Agents API
4. **Scale pattern** — How to organize 10 agents + 7 verticals + 11 data connectors without chaos

---

## REPOSITORY STRUCTURE

### Top-Level Organization

```
anthropics/financial-services/
├── plugins/                           # All installable components
│   ├── agent-plugins/                 # 10 named agents (self-contained)
│   │   ├── pitch-agent/               # Investment banking pitch desk flow
│   │   ├── gl-reconciler/             # Fund accounting + GL audit
│   │   ├── market-researcher/         # Sector intelligence
│   │   └── [7 more agents]
│   ├── vertical-plugins/              # 7 FSI verticals (source of truth)
│   │   ├── financial-analysis/        # Core: DCF, comps, 3-stmt, deck QC, audit
│   │   ├── investment-banking/        # Deal materials, CIMs, teaser
│   │   ├── equity-research/           # Earnings, initiation, model update
│   │   ├── private-equity/            # Sourcing, DD, IC memo, portfolio
│   │   ├── wealth-management/         # Client review, rebalancing, planning
│   │   ├── fund-admin/                # GL recon, accruals, NAV tie-out
│   │   ├── operations/                # KYC, rules engine
│   │   └── partner-built/             # LSEG, S&P Global
│   └── .mcp.json                      # MCP connectors (11 data sources)
├── managed-agent-cookbooks/           # Headless deployment configs (Managed Agents API)
├── scripts/                           # Version control + deployment automation
└── CLAUDE.md                          # Project instructions (file-based, no build)
```

### Why This Structure Works

**Single Source of Truth:**
- Edit skills in `plugins/vertical-plugins/<vertical>/skills/`
- Run `scripts/sync-agent-skills.py` to propagate to agent bundles
- `scripts/check.py` validates all cross-references before commit
- Git pre-commit hook auto-bumps plugin version

**Two Deployment Paths, One Source:**
- Cowork plugin → Reads from `plugins/agent-plugins/<slug>/`
- Managed Agents API → Reads from `managed-agent-cookbooks/<slug>/agent.yaml`
- Both reference identical system prompt (`agents/<slug>.md`)

---

## DATA CONNECTOR ARCHITECTURE

### MCP Pattern (11 Institutional Data Sources)

**File:** `.mcp.json` (single config file)

```json
{
  "mcpServers": {
    "daloopa": {
      "type": "http",
      "url": "https://mcp.daloopa.com/server/mcp"
    },
    "morningstar": {
      "type": "http",
      "url": "https://mcp.morningstar.com/mcp"
    },
    "factset": {
      "type": "http",
      "url": "https://mcp.factset.com/mcp"
    },
    // ... 8 more providers
  }
}
```

**Key Insight:** Centralized MCP configuration in `financial-analysis` (core vertical) shared across ALL verticals. New vertical doesn't create new data source config — it inherits the 11 connectors.

### Data Source Coverage

| Category | Provider | MCP Endpoint |
|----------|----------|--------------|
| **Equity Research** | Daloopa, Morningstar, FactSet, S&P Capital IQ | Historical financials, analyst estimates, multiples |
| **Credit/Ratings** | Moody's | Credit ratings, spreads, ratings trends |
| **News/Events** | MT Newswires, Aiera | Real-time news, earnings previews, corporate events |
| **Coverage** | LSEG, PitchBook | Bond data, fund analytics, precedent transactions |
| **Fund Data** | Chronograph | Fund performance, holdings, valuations |
| **Document Storage** | Egnyte, Box | Due diligence docs, transaction materials, audit trails |

### Fortress Parallel

**Your current stack:**
- yfinance (equity prices, historical data)
- NSE APIs (India market data)
- PostgreSQL (local cache)

**Anthropic pattern suggests:**
- Create `.mcp.json` for your data sources (yfinance + NSE + future Morningstar)
- Single MCP config, inherited by all skills
- Skills reference connectors via declarative `.mcp.json`, not hardcoded API calls

---

## SKILL ARCHITECTURE PATTERN

### Anatomy of a Professional Skill (DCF Model Example)

**File Structure:**
```
plugins/vertical-plugins/financial-analysis/skills/dcf-model/
├── SKILL.md                  # Complete skill file (8,000+ lines)
└── (no additional files)
```

**SKILL.md Contents (One Unified File):**

1. **Frontmatter** (YAML):
   ```yaml
   ---
   name: dcf-model
   description: Real DCF model creation for equity valuation...
   ---
   ```

2. **Triggering Conditions** (natural language):
   - "Use when users need to value a company using DCF methodology"
   - "Request intrinsic value analysis"
   - "Ask for detailed financial modeling"

3. **Section: Overview** 
   - What the skill does (institutional-quality DCF models following IB standards)
   - What outputs it produces (detailed Excel model with sensitivity analysis)

4. **Section: Tools**
   - Lists what tools the skill uses (MCP servers, web search, xlsx skill, etc.)

5. **Section: Critical Constraints**
   - Office JS vs openpyxl (environment detection)
   - Formulas over hardcodes (non-negotiable)
   - Verify step-by-step with user (don't build end-to-end)
   - Sensitivity table requirements (odd number of rows/cols, center = base case)

6. **Section: DCF Process Workflow** (10 steps)
   - Step 1: Data Retrieval & Validation
   - Step 2: Historical Analysis
   - Step 3-10: Revenue projections, OpEx, FCF, WACC, terminal value, discounting, enterprise-to-equity bridge, sensitivity

7. **Section: Correct Patterns** (what to DO)
   - Scenario block selection pattern
   - Revenue projection pattern
   - FCF formula pattern
   - Cell comment format
   - Assumption table structure
   - Row planning process
   - Sensitivity table implementation

8. **Section: Common Mistakes** (what NOT to do)
   - Simplified sensitivity table approximations
   - Missing cell comments
   - Formula row references off
   - Single row per assumption across scenarios
   - No borders
   - Wrong font colors
   - Operating expenses based on gross profit
   - Top 5 errors summary

9. **Excel File Creation Section**
   - Integration with xlsx skill
   - Formula recalculation via `recalc.py`
   - Number formatting standards
   - Cell comments required on all inputs

10. **Quality Rubric** (evaluation criteria)
    - Realistic revenue/margin assumptions
    - Appropriate CAPM methodology
    - Comprehensive sensitivity analysis
    - Professional model structure
    - Transparent documentation

11. **Input Requirements & Deliverables**
    - Minimum required inputs
    - Two-sheet structure (DCF + WACC)
    - Pre-delivery checklist

---

## AGENT DESIGN PATTERN

### How Agents Reference Skills

**Example: Pitch Agent**

**File:** `plugins/agent-plugins/pitch-agent/agents/pitch-agent.md`

```markdown
# Pitch Agent

This agent orchestrates the end-to-end pitch deck workflow:
1. User provides target company + financials
2. Agent runs /comps (comparable company analysis)
3. Agent runs /dcf (DCF valuation)
4. Agent runs /lbo (LBO model if relevant)
5. Agent generates branded pitch deck with findings

## Skills Used
- comps-analysis
- dcf-model
- lbo-model
- 3-statement-model
- pitch-deck-author

## Available Commands
- /comps
- /dcf
- /lbo
- /3-statement-model
- /pitch-deck

## MCP Connectors
Inherits all 11 data connectors from financial-analysis vertical.
```

**Skills are bundled (copied) into agent plugin:**
```
plugins/agent-plugins/pitch-agent/
├── agents/pitch-agent.md           # System prompt
├── .claude-plugin/plugin.json      # Plugin metadata + version
└── skills/
    ├── comps-analysis/SKILL.md     # Bundled copy from vertical
    ├── dcf-model/SKILL.md
    ├── lbo-model/SKILL.md
    └── ...
```

**Key Pattern: Single Source, Two Copies**
- Edit in `vertical-plugins/financial-analysis/skills/dcf-model/SKILL.md`
- Run `sync-agent-skills.py` → copies to `agent-plugins/pitch-agent/skills/dcf-model/SKILL.md`
- Both Cowork and Managed Agents API read from agent-plugins bundles
- Pre-commit hook validates copies match source

---

## MANAGED AGENTS API PATTERN (Headless Deployment)

**When to use:** If Fortress needs a server-side Claude agent (not Cowork), the Managed Agents API pattern applies.

**File:** `managed-agent-cookbooks/gl-reconciler/agent.yaml`

```yaml
type: agent
model: claude-opus-4-8
name: gl-reconciler
description: GL Reconciliation Agent

instructions: !include ../../plugins/agent-plugins/gl-reconciler/agents/gl-reconciler.md

skills:
  - path: ../../plugins/agent-plugins/gl-reconciler/skills/break-tracing/SKILL.md
  - path: ../../plugins/agent-plugins/gl-reconciler/skills/variance-commentary/SKILL.md

callable_agents:
  - manifest: ./subagents/accrual-agent.yaml
    description: Accrual adjustment subagent

tools:
  - type: mcp
    mcp_server_config: !include ../../plugins/vertical-plugins/financial-analysis/.mcp.json

tools:
  - type: sse
    callback_url: https://your-domain.com/webhooks/agent-events
```

**Deploy with:**
```bash
scripts/deploy-managed-agent.sh gl-reconciler
```

**The script:**
1. Resolves `!include` file references
2. Uploads skills to Claude API
3. Creates leaf-worker subagents
4. POSTs orchestrator agent to `/v1/agents`
5. Returns agent ID for your application

**Fortress relevance:** If you ever need a server-side agent (e.g., Portfolio Tracker rebalance notifications running autonomously), this is the pattern.

---

## SKILL VERSIONING & SYNC PATTERN

### Problem It Solves

Multiple agents use the same skill (e.g., 3 agents use `dcf-model`). How do you edit once and have all 3 agents pick up the change?

### Solution: Sync Script

**Workflow:**
1. Edit skill in vertical source: `plugins/vertical-plugins/financial-analysis/skills/dcf-model/SKILL.md`
2. Run `python3 scripts/sync-agent-skills.py`
   - Reads all `plugins/agent-plugins/*/agents/*.md` to find skill references
   - Copies updated skill to each agent bundle
   - Updates modification timestamps
3. Run `python3 scripts/check.py`
   - Verifies all copies match source
   - Validates cross-file references
   - Fails build if mismatch detected
4. Commit with auto-bumped plugin versions

**Result:** Edit once, deployed everywhere, no drift.

### Fortress Application

**Your 30 trading skills:**
- Today: Likely stored in `C:/Antigravity/trading-repos/` (scattered location)
- **Pattern suggests:** Move to `skills/` directory, create source-of-truth, auto-sync to Portfolio Tracker plugin

---

## INSTALLATION PATTERNS (Two Methods)

### 1. Cowork Installation

```bash
# Add marketplace
Settings → Plugins → Add plugin → https://github.com/anthropics/financial-services

# Or upload individual plugin
Settings → Plugins → Upload → zip of plugins/agent-plugins/pitch-agent/
```

### 2. Claude Code Installation

```bash
# Add marketplace
claude plugin marketplace add anthropics/financial-services

# Install core (contains all MCP connectors)
claude plugin install financial-analysis@claude-for-financial-services

# Install named agents
claude plugin install pitch-agent@claude-for-financial-services
claude plugin install gl-reconciler@claude-for-financial-services

# Install vertical bundles
claude plugin install equity-research@claude-for-financial-services
```

**Fortress parallel:** Once you organize skills, you could distribute them via:
- GitHub marketplace (if open source)
- Internal registry (if proprietary)
- Claude plugins protocol (if using Cowork)

---

## KEY ARCHITECTURAL DECISIONS & RATIONALE

### Decision 1: File-Based (No Build)

**Why:** Git tracks every change, easy to review, no compilation step, version control is built-in.

**Fortress implication:** Your CLAUDE.md and README are the right approach — continue documenting in markdown.

### Decision 2: Single Source of Truth (Vertical Plugins)

**Why:** Edits propagate automatically, sync script validates no drift, pre-commit hook enforces consistency.

**Fortress implication:** Your 30 trading skills should live in ONE directory, versioned, with a sync mechanism to Portfolio Tracker plugin.

### Decision 3: MCP Connectors Centralized

**Why:** 11 data sources configured once, inherited by all verticals, reduces config duplication, easier to add new source (one edit = all agents get it).

**Fortress implication:** When you add FactSet/Morningstar, create `.mcp.json` in core layer, auto-inherit in NSE/US/Malaysia verticals.

### Decision 4: Agents Ship Two Ways

**Why:** Same system prompt in Cowork OR Managed Agents API, user picks deployment model, implementation is identical.

**Fortress implication:** Future institutional customers might want a server-side agent; this pattern lets you provide it without rewriting skills.

### Decision 5: Version Bumping Automated

**Why:** Plugin version auto-increments exactly +0.0.1 per PR, prevents conflicts, signals "this plugin was updated" to already-installed users.

**Fortress implication:** Establish same pattern for your plugins — each merge → +0.0.1 bump, users see notifications.

---

## FORTRESS-SPECIFIC RECOMMENDATIONS

### 1. Short-Term (Month 1): Adopt Sync Pattern

**Today:** Your 30 trading skills are references but unclear where they live.

**Action:**
- Consolidate all 30 skills to `skills/` directory
- Create `MEMORY.md` index (what you already have)
- Write a sync script (Python 50 lines) that copies skills to Portfolio Tracker plugin
- Add pre-commit hook to validate no drift

**Payoff:** When you edit an NSE trading skill, it auto-propagates to Portfolio Tracker plugin. Single source of truth.

### 2. Medium-Term (Month 2): Implement MCP Connector Pattern

**Today:** yfinance hardcoded in API routes.

**Action:**
- Create `.mcp.json` with yfinance + NSE APIs
- Create adapter layer that reads `.mcp.json`
- When Malaysia market added, add 1 line to `.mcp.json`
- All skills inherit the new market automatically

**Payoff:** Scaling to 10+ markets doesn't require touching skill code.

### 3. Long-Term (Month 3): Agent Versioning

**Today:** Fortress 30 and Portfolio Tracker are features, not agents.

**Action:**
- If you formalize them as agents (suggested):
  - `agent-plugins/fortress-30-scanner/` — risk-based screening agent
  - `agent-plugins/portfolio-tracker/` — rebalance + P&L agent
- Each agent bundles relevant skills, inherits MCP connectors
- Versioning automatic via pre-commit hook

**Payoff:** Can distribute Fortress 30 agent independently; institutional buyers can install, customize, deploy.

---

## PATTERNS NOT TO COPY (Context-Specific)

### 1. Managed Agents API (Advanced)

**Anthropic pattern:** Deployable as server-side agent via `/v1/agents` API.

**When it applies to Fortress:** If you need autonomous rebalance decisions running 24/7, Managed Agents pattern is relevant. Not necessary now.

### 2. Partner Plugin Directory

**Anthropic pattern:** LSEG and S&P Global contributed plugins; Anthropic maintains them.

**When it applies to Fortress:** Only if you partner with institutional vendors. Skip for now.

### 3. Microsoft 365 Add-In Tooling

**Anthropic pattern:** `claude-for-msft-365-install/` for deploying agents inside Excel.

**When it applies to Fortress:** Only if you sell B2B to wealth managers in Excel. Cowork is better for indie investors.

---

## IMPLEMENTATION PRIORITY

### Phase 1: Local Consolidation (Week 1)
- Organize 30 skills under `/skills/`
- Create `MEMORY.md` index
- Write 50-line sync script

### Phase 2: MCP Abstraction (Month 2)
- Create `.mcp.json` with yfinance + NSE APIs
- Refactor API routes to read from connector config
- Test with Malaysia market setup

### Phase 3: Agent Formalization (Month 3+)
- Define `fortress-30-scanner` agent
- Define `portfolio-tracker` agent
- Establish versioning + pre-commit validation

---

## SUCCESS METRICS

After implementing Anthropic's patterns:

✅ **Consolidation:** 1 skill → 1 edit → all agents updated (sync script validates)  
✅ **Data abstraction:** 1 MCP config → add Malaysia in 1 line  
✅ **Version control:** Every plugin commit → auto-bumped version  
✅ **No drift:** Pre-commit hook blocks commits if agent bundles diverge from verticals  
✅ **Two deployment paths:** Same agent runs in Cowork OR Managed Agents API (future)  

---

## NEXT STEPS

1. **Review this document** — Ask questions on architecture decisions
2. **Decide on adoption scope** — Sync pattern? MCP abstraction? Both?
3. **Allocate 1 engineer week** for consolidation + script-writing
4. **Start Month 2** with MCP `.mcp.json` for Malaysia integration

---

**File prepared by:** Claude (Task 1 completion)  
**Date:** June 19, 2026  
**For review by:** B (Bharat Samant, founder)
