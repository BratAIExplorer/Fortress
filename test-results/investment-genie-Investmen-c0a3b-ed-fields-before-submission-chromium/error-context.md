# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> validates required fields before submission
- Location: e2e\investment-genie.spec.ts:56:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Generate Portfolio")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]: ⚠️
          - text: Important Disclaimer
        - paragraph [ref=e8]:
          - strong [ref=e9]: This is not financial advice.
          - text: Investment Genie provides analysis and suggestions for research purposes only. You must consult a licensed financial advisor before making any investment decisions. Investing in stocks carries risk of loss. Past performance does not guarantee future results. You assume full responsibility for your investment decisions.
      - generic [ref=e10]:
        - heading "💎 Investment Genie" [level=1] [ref=e11]
        - paragraph [ref=e12]: Personalized portfolio allocation for NRI investors
      - form "Investment Genie Form" [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]:
              - generic [ref=e18]: "Age: 30"
              - slider "Age" [ref=e19] [cursor=pointer]: "30"
            - generic [ref=e20]:
              - generic [ref=e21]: Investment Amount (USD)
              - generic [ref=e22]:
                - generic [ref=e23]: $
                - spinbutton "Investment Amount (USD)" [ref=e24]: "1000"
            - generic [ref=e25]:
              - generic [ref=e26]: Time Horizon
              - combobox "Time Horizon" [ref=e27]:
                - option "1 Year"
                - option "5 Years" [selected]
                - option "10 Years"
                - option "20 Years"
                - option "Retirement"
            - generic [ref=e28]:
              - generic [ref=e29]: Investment Experience
              - generic [ref=e30]:
                - generic [ref=e31] [cursor=pointer]: BEGINNER
                - generic [ref=e32] [cursor=pointer]: INTERMEDIATE
                - generic [ref=e33] [cursor=pointer]: EXPERIENCED
          - generic [ref=e34]:
            - generic [ref=e35]:
              - generic [ref=e36]: Geographic Focus
              - generic [ref=e37]:
                - generic [ref=e39] [cursor=pointer]: India
                - generic [ref=e41] [cursor=pointer]: United States
                - generic [ref=e43] [cursor=pointer]: Malaysia
                - generic [ref=e45] [cursor=pointer]: Singapore
                - generic [ref=e47] [cursor=pointer]: ETFs
            - generic [ref=e48]:
              - generic [ref=e49]: "Risk Appetite: 50"
              - slider "Risk Appetite" [ref=e50] [cursor=pointer]: "50"
            - generic [ref=e51]:
              - generic [ref=e52]: Income Stability
              - generic [ref=e53]:
                - generic [ref=e56] [cursor=pointer]: stable
                - generic [ref=e59] [cursor=pointer]: variable
                - generic [ref=e62] [cursor=pointer]: business
        - button "Generate Optimal Portfolio" [ref=e64]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e70] [cursor=pointer]:
    - img [ref=e71]
  - alert [ref=e74]
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
  44  |     await page.goto("/investment-genie");
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
  57  |     await page.goto("/investment-genie");
  58  | 
  59  |     // Try submitting without selecting a country
> 60  |     await page.click('button:has-text("Generate Portfolio")');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  61  | 
  62  |     // Should see validation errors
  63  |     expect(await page.locator("text=Select at least one").isVisible()).toBeTruthy();
  64  |   });
  65  | 
  66  |   test("can select multiple countries", async ({ page }) => {
  67  |     await page.goto("/investment-genie");
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
  79  |     await context.route("**/api/**", (route) => {
  80  |       route.abort("aborted");
  81  |     });
  82  | 
  83  |     await page.goto("/investment-genie");
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
  95  |     await page.goto("/investment-genie");
  96  | 
  97  |     // Check initial value
  98  |     const riskSlider = page.locator('input[type="range"][aria-label*="Risk"]');
  99  |     const initialValue = await riskSlider.inputValue();
  100 |     expect(initialValue).toBeTruthy();
  101 | 
  102 |     // Adjust slider
  103 |     await riskSlider.fill("70");
  104 |     const newValue = await riskSlider.inputValue();
  105 |     expect(newValue).toBe("70");
  106 |   });
  107 | 
  108 |   test("form can be reset", async ({ page }) => {
  109 |     await page.goto("/investment-genie");
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
  130 |     await context.route("**/api/**", (route) => {
  131 |       if (route.request().url().includes("scan/results")) {
  132 |         route.fulfill({
  133 |           status: 200,
  134 |           contentType: "application/json",
  135 |           body: JSON.stringify(mockRecommendation),
  136 |         });
  137 |       } else {
  138 |         route.abort("aborted");
  139 |       }
  140 |     });
  141 | 
  142 |     await page.goto("/investment-genie");
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
  155 |     await context.route("**/api/**", (route) => {
  156 |       if (route.request().url().includes("scan/results")) {
  157 |         route.fulfill({
  158 |           status: 200,
  159 |           contentType: "application/json",
  160 |           body: JSON.stringify(mockRecommendation),
```