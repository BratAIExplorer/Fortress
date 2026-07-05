# Implementation Guide — Portfolio 3-Layer Feature
**Status:** Ready for Implementation  
**Date:** May 26, 2026  
**Priority:** CRITICAL (Blocks Phase 2 completion)  

---

## 📋 WHAT EXISTS TODAY

✅ **Already Built:**
- `/portfolio` page (shows strategies)
- `/portfolio/[id]` detail page (shows holdings, rebalance summary)
- `/portfolio/[id]/edit` page (edit holdings)
- API: GET /portfolio, GET /portfolio/[id], PUT /portfolio/[id]/holdings
- StrategyCard component (cards on portfolio page)
- HoldingsTable component (holdings display)
- RebalanceSummary component (rebalance actions)

❌ **Missing (This Implementation):**
- Delete button on StrategyCard
- DELETE API endpoint with feedback
- StrategyDeleteModal component
- EditStrategyModal component (for allocation % amendments)
- strategy_deletion_feedback database table
- Genie "Approve & Add" flow
- Portfolio link in main navigation

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Database Schema (SQL)

**File:** Create SQL migration file

**Task 1.1: Create strategy_deletion_feedback table**
```sql
CREATE TABLE strategy_deletion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL,
  strategy_name VARCHAR(255),
  
  reasons VARCHAR[] NOT NULL,
  additional_feedback TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deletion_feedback_portfolio_id ON strategy_deletion_feedback(portfolio_id);
CREATE INDEX idx_deletion_feedback_deleted_at ON strategy_deletion_feedback(deleted_at);
```

**Task 1.2: Enhance portfolio_strategies table**
```sql
ALTER TABLE portfolio_strategies ADD COLUMN amendments JSONB DEFAULT '[]';
ALTER TABLE portfolio_strategies ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE portfolio_strategies ADD COLUMN deleted_at TIMESTAMP;
```

**Implementation notes:**
- These can be applied via Drizzle migrations or raw SQL
- Run on VPS PostgreSQL: `npm run drizzle:push`
- Verify: `SELECT COUNT(*) FROM strategy_deletion_feedback;` (should return 0)

---

### Phase 2: API Endpoints

**File:** fortress-app/app/api/portfolio/[strategyId]/route.ts

**Task 2.1: Add DELETE handler**
```typescript
// DELETE /api/portfolio/[strategyId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { strategyId } = await params;
    const body = await req.json().catch(() => ({}));
    const { feedback } = body;

    // Fetch strategy for deletion tracking
    const strategy = await getStrategyById(strategyId, session.user.id);
    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    // Store feedback if provided
    if (feedback?.reasons?.length > 0 || feedback?.additional_feedback) {
      const db = createClient(); // Use your DB client
      await db
        .insertInto("strategy_deletion_feedback")
        .values({
          portfolio_id: strategy.portfolio_id,
          strategy_id: strategyId,
          strategy_name: strategy.name,
          reasons: feedback.reasons || [],
          additional_feedback: feedback.additional_feedback || null,
          created_at: new Date(),
          deleted_at: new Date(),
        })
        .execute();
    }

    // Mark strategy as deleted
    const db = createClient();
    await db
      .updateTable("portfolio_strategies")
      .set({
        is_deleted: true,
        deleted_at: new Date(),
      })
      .where("id", "=", strategyId)
      .execute();

    return NextResponse.json({
      success: true,
      message: feedback?.reasons?.length > 0
        ? "Strategy deleted. Thanks for the feedback!"
        : "Strategy deleted",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete strategy";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

**Task 2.2: Enhance PUT handler (for amendments)**
- Modify existing PUT handler at same route
- Accept `amendments` array in request body
- Store amendments in `amendments` JSONB column
- Example: `{ field: "India", original: 30, final: 35, reason: "Dividend thesis", timestamp }`

**Testing:**
```bash
# Test DELETE with feedback
curl -X DELETE http://localhost:3000/api/portfolio/[strategyId] \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": {
      "reasons": ["not_confident", "market_changed"],
      "additional_feedback": "Market volatility..."
    }
  }'

# Test DELETE without feedback
curl -X DELETE http://localhost:3000/api/portfolio/[strategyId]
```

---

### Phase 3: Components

**File:** fortress-app/components/portfolio/StrategyDeleteModal.tsx (NEW)

**Task 3.1: Create StrategyDeleteModal component**

```typescript
"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StrategyDeleteModalProps {
  strategyId: string;
  strategyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS = [
  { id: "not_confident", label: "Not confident in this allocation" },
  { id: "better_strategy", label: "Found a better strategy elsewhere" },
  { id: "market_changed", label: "Market conditions changed" },
  { id: "need_capital", label: "Need the capital for something else" },
  { id: "too_complex", label: "Portfolio is too complicated" },
  { id: "manual_tracking", label: "Want to track it manually instead" },
  { id: "many_edits", label: "Already made so many changes via Edit" },
  { id: "experimenting", label: "Just experimenting / testing the app" },
  { id: "other", label: "Other (please explain)" },
];

export function StrategyDeleteModal({
  strategyId,
  strategyName,
  isOpen,
  onClose,
  onSuccess,
}: StrategyDeleteModalProps) {
  const router = useRouter();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const canSubmit = selectedReasons.length > 0 || freeText.trim().length > 0;

  const handleDelete = async (withFeedback: boolean) => {
    if (withFeedback && !canSubmit) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${strategyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: withFeedback
            ? {
                reasons: selectedReasons,
                additional_feedback: freeText || null,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete strategy");
      }

      onSuccess();
      onClose();
      // Refresh portfolio page
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      // Show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-white">Delete Strategy?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                "{strategyName}" will be removed from tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Reasons */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">
              Why are you deleting this? (optional)
            </p>
            <div className="space-y-2">
              {REASONS.map((reason) => (
                <label key={reason.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReasons([...selectedReasons, reason.id]);
                      } else {
                        setSelectedReasons(
                          selectedReasons.filter((r) => r !== reason.id)
                        );
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary"
                  />
                  <span className="text-sm text-foreground">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Free text */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Additional feedback (optional)
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Tell us more about your decision..."
              className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3.5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm font-medium text-foreground border border-white/10 rounded-lg hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(false)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm font-medium text-muted-foreground border border-white/10 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Anyway"}
          </button>
          <button
            onClick={() => handleDelete(true)}
            disabled={!canSubmit || isLoading}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600/80 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Task 3.2: Create EditStrategyModal component**
- Similar modal for editing allocation %
- Sliders for India/US/Gold %
- Amendment reason text field
- Submit button calls PUT /api/portfolio/[id]

**Task 3.3: Enhance StrategyCard component**
- Add Edit + Delete buttons (not as Link wrapper, but action buttons)
- Stop on click propagation (don't navigate when clicking buttons)
- Pass strategyId to modals

**Example addition:**
```typescript
<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal();
    }}
    className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20"
  >
    <Pencil className="h-3.5 w-3.5" />
  </button>
  <button 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      openDeleteModal();
    }}
    className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
</div>
```

---

### Phase 4: Navigation

**File:** fortress-app/components/Navigation.tsx (or wherever nav is)

**Task 4.1: Add Portfolio link to main navigation**
```typescript
// Add to nav items:
{
  href: "/portfolio",
  label: "Portfolio",
  icon: <Briefcase className="h-4 w-4" />,
}
```

---

### Phase 5: Integration

**File:** fortress-app/app/investment-genie/results/page.tsx

**Task 5.1: Add "Approve & Add to Portfolio" button to Genie results**
```typescript
<button
  onClick={async () => {
    // Call POST /api/portfolio to create strategy
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layer_type: "FORTRESS",
        name: "From Investment Genie",
        source: "INVESTMENT_GENIE",
        allocation: result.allocation, // from Genie form
        holdings: result.recommendedHoldings, // from Genie result
      }),
    });
    
    if (response.ok) {
      router.push("/portfolio");
    }
  }}
  className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90"
>
  Approve & Add to Portfolio
</button>
```

---

## 📊 TESTING CHECKLIST

### Unit Tests
- [ ] StrategyDeleteModal renders correctly
- [ ] Reason checkboxes toggle correctly
- [ ] Form validation works (disable button when no selection)
- [ ] DELETE API handler processes feedback correctly

### Integration Tests
- [ ] Create strategy from Genie
- [ ] Edit strategy (change allocation %)
- [ ] Delete strategy with feedback
- [ ] Delete strategy without feedback
- [ ] Verify feedback stored in DB

### E2E Tests (Manual)
- [ ] Log in at https://fortressintelligence.space
- [ ] Navigate to /portfolio
- [ ] Click Edit on a strategy → modal opens
- [ ] Click Delete on a strategy → modal opens
- [ ] Select reasons → click "Delete & Send" → success message
- [ ] Check DB: feedback stored correctly
- [ ] Navigate back to /portfolio → strategy gone

---

## 🚀 DEPLOYMENT STEPS

1. **Backup database:** `pg_dump fortress_db > fortress_db_backup.sql`
2. **Run migrations:** `npm run drizzle:push`
3. **Implement components** (Tasks 3.1-3.3)
4. **Add API endpoints** (Tasks 2.1-2.2)
5. **Update navigation** (Task 4.1)
6. **Integrate with Genie** (Task 5.1)
7. **Run all tests**
8. **Commit & push:** `git push origin main`
9. **GitHub Actions CI/CD** runs automatically
10. **Verify on production:** https://fortressintelligence.space/portfolio

---

## ⏱ TIME ESTIMATE

| Task | Estimate |
|------|----------|
| Database schema (1.1-1.2) | 15 min |
| API DELETE handler (2.1) | 30 min |
| StrategyDeleteModal (3.1) | 45 min |
| EditStrategyModal (3.2) | 45 min |
| StrategyCard enhancement (3.3) | 20 min |
| Navigation link (4.1) | 10 min |
| Genie integration (5.1) | 20 min |
| Testing & QA | 60 min |
| **Total** | **245 min (4 hours)** |

---

## ✅ SUCCESS CRITERIA

- [x] Feature spec documented
- [ ] Database tables created
- [ ] All API endpoints working
- [ ] Delete modal renders correctly
- [ ] Edit modal renders correctly
- [ ] Feedback stored in DB
- [ ] All tests passing
- [ ] Deployed to production
- [ ] UX/CX review satisfied
- [ ] CLAUDE.md updated
- [ ] Team notified

---

**Status:** Ready for Implementation  
**Next Step:** Execute Phase 1 (Database) → Phase 2 (API) → Phase 3 (Components) → Phase 4-5 (Integration & Testing)
