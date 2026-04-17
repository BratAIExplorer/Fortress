# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> can adjust risk appetite slider
- Location: e2e\investment-genie.spec.ts:94:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.inputValue: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="range"][aria-label*="Risk"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - link "Fortress Intelligence" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e7]
          - generic [ref=e10]: Fortress Intelligence
        - navigation [ref=e11]:
          - link "Fortress 30" [ref=e12] [cursor=pointer]:
            - /url: /fortress-30
          - link "V5 Extension" [ref=e13] [cursor=pointer]:
            - /url: /v5-extension
          - link "Intelligence" [ref=e14] [cursor=pointer]:
            - /url: /intelligence
            - img
            - text: Intelligence
          - link "Market Pulse" [ref=e15] [cursor=pointer]:
            - /url: /macro
            - img
            - text: Market Pulse
          - link "Guide" [ref=e16] [cursor=pointer]:
            - /url: /guide
            - img
            - text: Guide
          - link "Member Login" [ref=e17] [cursor=pointer]:
            - /url: /admin
      - generic [ref=e18]:
        - generic [ref=e21]: Public Beta Access
        - heading "We don't predict prices. We publish frameworks." [level=1] [ref=e22]:
          - text: We don't predict prices.
          - text: We publish frameworks.
        - paragraph [ref=e23]: The Educational Intelligence Layer for Indian Markets. Bridging the gap between raw screener data and blind tipster faith.
        - generic [ref=e24]:
          - link "Explore V5 Extension" [ref=e25] [cursor=pointer]:
            - /url: /v5-extension
            - text: Explore V5 Extension
            - img
          - link "Fortress 30 List" [ref=e26] [cursor=pointer]:
            - /url: /fortress-30
          - link "Our Constitution" [ref=e27] [cursor=pointer]:
            - /url: /constitution
          - link "How It Works" [ref=e28] [cursor=pointer]:
            - /url: /intelligence
            - img
            - text: How It Works
      - generic [ref=e31]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - img [ref=e36]
            - generic [ref=e40]: Beyond Screeners
          - paragraph [ref=e42]: Screeners dump 500 results on you. We filter the noise and isolate the signal using our 5-Layer Protection framework.
        - generic [ref=e44]:
          - generic [ref=e45]:
            - img [ref=e47]
            - generic [ref=e50]: Anti-Tipster
          - paragraph [ref=e52]: We never tell you to buy. We explain why a business passed our quality checks. The final decision is always yours.
        - generic [ref=e54]:
          - generic [ref=e55]:
            - img [ref=e57]
            - generic [ref=e59]: Education First
          - paragraph [ref=e61]: Every stock in the Fortress 30 comes with a 'Why' thesis. Learn the logic behind the list, don't just copy it.
      - generic [ref=e63]:
        - paragraph [ref=e64]: © 2026 Fortress Intelligence. All rights reserved.
        - paragraph [ref=e65]: Not a SEBI registered investment advisor. For educational purposes only.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e71] [cursor=pointer]:
    - img [ref=e72]
  - alert [ref=e75]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | // Mock API responses for testing
  4   | const mockRecommendation = {
  5   |   sessionId: "session-test-123",
  6   |   recommendation: {
  7   |     allocation: {
  8   |       equity: 60,
  9   |       fixedIncome: 30,
  10  |       cash: 10,
  11  |       alternatives: 0,
  12  |     },
  13  |     confidence: 75,
  14  |     rationale: "Balanced approach for 5-year horizon",
  15  |     timeHorizon: "5-10 years",
  16  |   },
  17  |   topPicks: [
  18  |     {
  19  |       symbol: "RELIANCE.NS",
  20  |       sector: "energy",
  21  |       allocationPercent: 12,
  22  |       reasoning: "Defensive dividend play",
  23  |       riskScore: 45,
  24  |     },
  25  |     {
  26  |       symbol: "INFY.NS",
  27  |       sector: "tech",
  28  |       allocationPercent: 10,
  29  |       reasoning: "Global tech exposure",
  30  |       riskScore: 40,
  31  |     },
  32  |   ],
  33  |   macroContext: {
  34  |     vixLevel: "medium",
  35  |     marketMomentum: "positive",
  36  |     dominantTrend: "tech",
  37  |   },
  38  |   suggestedActions: ["Rebalance quarterly"],
  39  |   riskWarnings: [],
  40  | };
  41  | 
  42  | test.describe("Investment Genie Full Journey", () => {
  43  |   test("form renders all fields", async ({ page }) => {
  44  |     await page.goto("/");
  45  | 
  46  |     // Check all fields are visible
  47  |     expect(await page.locator("text=Age").isVisible()).toBeTruthy();
  48  |     expect(await page.locator("text=Investment Amount").isVisible()).toBeTruthy();
  49  |     expect(await page.locator("text=Time Horizon").isVisible()).toBeTruthy();
  50  |     expect(await page.locator("text=Investment Experience").isVisible()).toBeTruthy();
  51  |     expect(await page.locator("text=Geographic Focus").isVisible()).toBeTruthy();
  52  |     expect(await page.locator("text=Risk Appetite").isVisible()).toBeTruthy();
  53  |     expect(await page.locator("text=Income Stability").isVisible()).toBeTruthy();
  54  |   });
  55  | 
  56  |   test("validates required fields before submission", async ({ page }) => {
  57  |     await page.goto("/");
  58  | 
  59  |     // Try submitting without selecting a country
  60  |     await page.click('button:has-text("Generate Portfolio")');
  61  | 
  62  |     // Should see validation errors
  63  |     expect(await page.locator("text=Select at least one").isVisible()).toBeTruthy();
  64  |   });
  65  | 
  66  |   test("can select multiple countries", async ({ page }) => {
  67  |     await page.goto("/");
  68  | 
  69  |     // Select India and US
  70  |     await page.click('label:has-text("India")');
  71  |     await page.click('label:has-text("United States")');
  72  | 
  73  |     const submitBtn = page.locator('button:has-text("Generate Portfolio")');
  74  |     expect(await submitBtn.isEnabled()).toBeTruthy();
  75  |   });
  76  | 
  77  |   test("displays recommendation after submission", async ({ page, context }) => {
  78  |     // Mock API responses
  79  |     await context.route("**/api/investment/scan-results", (route) => {
  80  |       route.abort("aborted");
  81  |     });
  82  | 
  83  |     await page.goto("/");
  84  | 
  85  |     // Select country and submit
  86  |     await page.click('label:has-text("India")');
  87  |     const submitBtn = page.locator('button:has-text("Generate Portfolio")');
  88  |     await submitBtn.click();
  89  | 
  90  |     // Even if API fails, form validation passes
  91  |     // (In real test, API would be mocked to return data)
  92  |   });
  93  | 
  94  |   test("can adjust risk appetite slider", async ({ page }) => {
  95  |     await page.goto("/");
  96  | 
  97  |     // Check initial value
  98  |     const riskSlider = page.locator('input[type="range"][aria-label*="Risk"]');
> 99  |     const initialValue = await riskSlider.inputValue();
      |                                           ^ Error: locator.inputValue: Test timeout of 30000ms exceeded.
  100 |     expect(initialValue).toBeTruthy();
  101 | 
  102 |     // Adjust slider
  103 |     await riskSlider.fill("70");
  104 |     const newValue = await riskSlider.inputValue();
  105 |     expect(newValue).toBe("70");
  106 |   });
  107 | 
  108 |   test("form can be reset", async ({ page }) => {
  109 |     await page.goto("/");
  110 | 
  111 |     // Fill form
  112 |     await page.click('label:has-text("India")');
  113 |     const amountInput = page.locator('input[type="number"]');
  114 |     await amountInput.fill("5000");
  115 | 
  116 |     // Reset (if reset button exists)
  117 |     const resetBtn = page.locator('button:has-text("Reset")');
  118 |     if (await resetBtn.isVisible()) {
  119 |       await resetBtn.click();
  120 |       const resetValue = await amountInput.inputValue();
  121 |       expect(resetValue).toBe("1000"); // Back to default
  122 |     }
  123 |   });
  124 | 
  125 |   test("displays all allocation percentages in recommendation", async ({
  126 |     page,
  127 |     context,
  128 |   }) => {
  129 |     // Route to mock successful response
  130 |     await context.route("**/api/investment/**", (route) => {
  131 |       if (route.request().url().includes("scan-results")) {
  132 |         route.fulfill({
  133 |           status: 200,
  134 |           contentType: "application/json",
  135 |           body: JSON.stringify(mockRecommendation),
  136 |         });
  137 |       } else {
  138 |         route.continue();
  139 |       }
  140 |     });
  141 | 
  142 |     await page.goto("/");
  143 | 
  144 |     // Submit form
  145 |     await page.click('label:has-text("India")');
  146 |     await page.click('button:has-text("Generate Portfolio")');
  147 | 
  148 |     // Wait for recommendation to display
  149 |     await page.waitForSelector("text=60", { timeout: 5000 }).catch(() => {
  150 |       // If not found, that's okay for now (mocking might not be complete)
  151 |     });
  152 |   });
  153 | 
  154 |   test("displays top picks with allocation", async ({ page, context }) => {
  155 |     await context.route("**/api/investment/**", (route) => {
  156 |       if (route.request().url().includes("scan-results")) {
  157 |         route.fulfill({
  158 |           status: 200,
  159 |           contentType: "application/json",
  160 |           body: JSON.stringify(mockRecommendation),
  161 |         });
  162 |       } else {
  163 |         route.continue();
  164 |       }
  165 |     });
  166 | 
  167 |     await page.goto("/");
  168 | 
  169 |     // Submit form
  170 |     await page.click('label:has-text("India")');
  171 |     await page.click('button:has-text("Generate Portfolio")');
  172 | 
  173 |     // Wait for picks to display
  174 |     await page.waitForSelector("text=RELIANCE", { timeout: 5000 }).catch(() => {
  175 |       // Mocking might not be complete
  176 |     });
  177 |   });
  178 | 
  179 |   test("can add picks to watchlist", async ({ page, context }) => {
  180 |     await context.route("**/api/investment/**", (route) => {
  181 |       if (route.request().url().includes("scan-results")) {
  182 |         route.fulfill({
  183 |           status: 200,
  184 |           contentType: "application/json",
  185 |           body: JSON.stringify(mockRecommendation),
  186 |         });
  187 |       } else {
  188 |         route.continue();
  189 |       }
  190 |     });
  191 | 
  192 |     await page.goto("/");
  193 | 
  194 |     // Submit form
  195 |     await page.click('label:has-text("India")');
  196 |     await page.click('button:has-text("Generate Portfolio")');
  197 | 
  198 |     // Look for watchlist button
  199 |     const watchlistBtn = page.locator(
```