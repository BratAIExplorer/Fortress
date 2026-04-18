# Mobile Responsive Design Guide

## Current Breakpoint Issues & Fixes

### Issue 1: Feature Cards Jump from 1 → 3 Columns

**File**: `app/page.tsx` (line 27)

```typescript
// ❌ BEFORE: Abrupt jump at md (768px)
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

// ✅ AFTER: Progressive scaling
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
```

**Why**: 
- At 640px (sm): 2 columns = better use of space
- At 1024px (lg): 3 columns = full desktop layout
- Eliminates awkward single-column on tablets

---

### Issue 2: Hero Title Scaling Missing Small Devices

**File**: `app/page.tsx` (line 42)

```typescript
// ❌ BEFORE: Only scales from sm (640px)
<h1 className="text-4xl sm:text-6xl md:text-7xl">

// ✅ AFTER: Handles all screen sizes
<h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl">
```

**Impact**: 
- Mobile (<320px): 24px text (readable)
- Small phone (320-375px): Still legible
- Tablet (768px): 36px text
- Desktop: Full 48-56px

---

### Issue 3: Padding Inconsistency on Mobile

**File**: `app/page.tsx` (line 26)

```typescript
// ❌ CURRENT: Same 4px padding everywhere until sm
<main className="container px-4 sm:px-8">

// ✅ BETTER: Explicit mobile padding
<main className="container px-3 sm:px-4 md:px-8">
```

**Rationale**: 
- Very small phones (320px): 3px = fits 274px content
- Standard phone (375px): 4px = fits 343px content
- Tablet+: 8px = balanced spacing

---

## Tailwind Breakpoints Reference

| Class | min-width | Device |
|-------|-----------|--------|
| (none) | 0px | Mobile |
| sm | 640px | Landscape phone / Small tablet |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Ultra-wide |

---

## Mobile-First Checklist

### Navigation
- [ ] Hamburger menu for mobile (< 768px)
- [ ] Touch target minimum 44px × 44px (currently using h-9 = 36px)
- [ ] Sticky navbar on scroll

### Buttons
- [ ] Primary CTA: at least h-12 on mobile (48px touch target)
- [ ] Secondary buttons: h-10 minimum
- [ ] Button groups: stack vertically on mobile

### Text
- [ ] Body text: 14px-16px on mobile
- [ ] Headings: responsive sizing (see Issue 2)
- [ ] Line length: max-w-2xl on desktop, full width on mobile

### Images & Cards
- [ ] Images: 100% width on mobile, capped on desktop
- [ ] Card gaps: gap-4 on mobile, gap-8 on desktop
- [ ] Padding: 4px-6px on mobile, 8px-12px on desktop

---

## Testing Strategy

```bash
# Test responsive breakpoints
# 1. Chrome DevTools: Toggle device toolbar
# 2. Test these viewports:
#    - iPhone 12: 390px × 844px
#    - iPad: 768px × 1024px
#    - Desktop: 1920px × 1080px

npm run e2e -- --project chromium --headed
# Look for "mobile responsive layout" test results
```

---

## Common Mistakes to Avoid

❌ **Don't**: `grid-cols-3 md:grid-cols-1`  
✅ **Do**: `grid-cols-1 md:grid-cols-3` (mobile-first)

❌ **Don't**: Fixed widths like `w-1000`  
✅ **Do**: Responsive widths like `w-full md:w-2/3`

❌ **Don't**: Assume device width = viewport width  
✅ **Do**: Account for browser UI on mobile

❌ **Don't**: Use px-12 (48px) on mobile  
✅ **Do**: Use px-4 (16px) mobile, px-8 desktop

---

## E2E Test Validation

The `mobile responsive layout` test in `e2e/investment-genie.spec.ts` validates:
- Form renders correctly at 375px × 812px (iPhone)
- Touch targets are adequate (not tested visually)
- No horizontal scrolling
- Text remains readable

**Status**: ✅ PASSING (with Playwright browsers installed)

---

## Next Steps

1. Apply breakpoint fixes (issues 1-3)
2. Test with Chrome DevTools device emulation
3. Validate E2E mobile test still passes
4. Consider dark mode at small screens (careful with contrast)
5. Add hamburger menu if navbar gets crowded
