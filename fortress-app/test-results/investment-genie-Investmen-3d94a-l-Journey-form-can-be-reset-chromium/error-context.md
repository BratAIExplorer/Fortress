# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> form can be reset
- Location: e2e\investment-genie.spec.ts:93:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "1000"
Received: "5000"
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "Fortress Intelligence" [ref=e5] [cursor=pointer]:
          - /url: /
          - img [ref=e6]
          - generic [ref=e9]: Fortress Intelligence
        - navigation [ref=e10]:
          - link "Fortress 30" [ref=e11] [cursor=pointer]:
            - /url: /fortress-30
          - link "Investment Genie" [ref=e12] [cursor=pointer]:
            - /url: /investment-genie
          - link "Deep Value Scanner" [ref=e13] [cursor=pointer]:
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
          - group "Select market" [ref=e18]:
            - button "India" [pressed] [ref=e19]:
              - generic [ref=e20]: India
            - button "United States" [ref=e21]:
              - generic [ref=e22]: United States
          - link "Sign In" [ref=e24] [cursor=pointer]:
            - /url: /login
    - navigation "Breadcrumb" [ref=e25]:
      - generic [ref=e26]:
        - link "Home" [ref=e28] [cursor=pointer]:
          - /url: /
        - generic [ref=e29]:
          - img [ref=e30]
          - generic [ref=e32]: Investment Genie
    - main [ref=e33]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: ⚠️
            - text: Important Disclaimer
          - paragraph [ref=e39]:
            - strong [ref=e40]: This is not financial advice.
            - text: Investment Genie provides analysis and suggestions for research purposes only. You must consult a licensed financial advisor before making any investment decisions. Investing in stocks carries risk of loss. Past performance does not guarantee future results. You assume full responsibility for your investment decisions.
        - generic [ref=e41]:
          - button "Back" [ref=e42]:
            - img
            - text: Back
          - generic [ref=e43]:
            - heading "💎 Investment Genie" [level=1] [ref=e44]
            - paragraph [ref=e45]: Personalized portfolio allocation for NRI investors
        - form "Investment Genie Form" [ref=e47]:
          - generic [ref=e48]:
            - button "1 Scope & Focus" [ref=e49] [cursor=pointer]:
              - generic [ref=e50]: "1"
              - generic [ref=e51]: Scope & Focus
            - button "2 Risk DNA" [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: "2"
              - generic [ref=e54]: Risk DNA
            - button "3 Asset Vehicles" [ref=e55] [cursor=pointer]:
              - generic [ref=e56]: "3"
              - generic [ref=e57]: Asset Vehicles
          - generic [ref=e58]:
            - generic [ref=e59]:
              - 'heading "Quick Start: Strategy Templates" [level=3] [ref=e60]'
              - generic [ref=e61]:
                - button "🚀 PRESET Aggressive Growth High-risk, high-reward barbell strategy for 10-year horizon Barbell 10-Year Leverage-Ready" [active] [ref=e62] [cursor=pointer]:
                  - generic [ref=e63]:
                    - generic [ref=e64]: 🚀
                    - generic [ref=e65]: PRESET
                  - heading "Aggressive Growth" [level=4] [ref=e66]
                  - paragraph [ref=e67]: High-risk, high-reward barbell strategy for 10-year horizon
                  - generic [ref=e68]:
                    - generic [ref=e69]: Barbell
                    - generic [ref=e70]: 10-Year
                    - generic [ref=e71]: Leverage-Ready
                - button "⚖️ PRESET Balanced Growth Moderate risk with steady income focus, 5-year horizon Moderate 5-Year Income-Focused" [ref=e72] [cursor=pointer]:
                  - generic [ref=e73]:
                    - generic [ref=e74]: ⚖️
                    - generic [ref=e75]: PRESET
                  - heading "Balanced Growth" [level=4] [ref=e76]
                  - paragraph [ref=e77]: Moderate risk with steady income focus, 5-year horizon
                  - generic [ref=e78]:
                    - generic [ref=e79]: Moderate
                    - generic [ref=e80]: 5-Year
                    - generic [ref=e81]: Income-Focused
                - button "🛡️ PRESET Conservative Income Low-risk, dividend-focused approach for capital preservation Safe Retirement Dividend-Focus" [ref=e82] [cursor=pointer]:
                  - generic [ref=e83]:
                    - generic [ref=e84]: 🛡️
                    - generic [ref=e85]: PRESET
                  - heading "Conservative Income" [level=4] [ref=e86]
                  - paragraph [ref=e87]: Low-risk, dividend-focused approach for capital preservation
                  - generic [ref=e88]:
                    - generic [ref=e89]: Safe
                    - generic [ref=e90]: Retirement
                    - generic [ref=e91]: Dividend-Focus
            - generic [ref=e93]:
              - generic [ref=e94]:
                - generic [ref=e95]: Investment Amount (USD)
                - generic [ref=e96]:
                  - generic [ref=e97]: $
                  - spinbutton "Investment Amount (USD)" [ref=e98]: "5000"
              - generic [ref=e99]:
                - generic [ref=e100]: Time Horizon
                - combobox "Time Horizon" [ref=e101]:
                  - option "1 Year"
                  - option "5 Years" [selected]
                  - option "10 Years"
                  - option "20 Years"
                  - option "Retirement"
            - generic [ref=e102]:
              - generic [ref=e103]: Geographic Focus
              - generic [ref=e104]:
                - generic [ref=e106] [cursor=pointer]: India
                - generic [ref=e108] [cursor=pointer]: United States
          - button "Continue →" [ref=e110]
        - generic [ref=e112]:
          - paragraph [ref=e114]: Analyzing Market Pulse...
          - paragraph [ref=e115]: Triangulating signals & generating allocation
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e121] [cursor=pointer]:
    - img [ref=e122]
  - alert [ref=e125]
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
  43  |   const navigateToStep3 = async (page: any) => {
  44  |     // Step 1
  45  |     await page.click('label:has-text("India")');
  46  |     await page.click('button:has-text("Continue →")');
  47  |     // Step 2
  48  |     await page.click('button:has-text("Continue →")');
  49  |     // Step 3
  50  |     await page.click('label:has-text("Stocks")');
  51  |   };
  52  | 
  53  |   test("form renders all fields on step 1", async ({ page }) => {
  54  |     await page.goto("/investment-genie");
  55  |     expect(await page.locator('label:has-text("Age")').first().isVisible()).toBeTruthy();
  56  |     expect(await page.locator("text=Investment Amount").isVisible()).toBeTruthy();
  57  |     expect(await page.locator("text=Time Horizon").isVisible()).toBeTruthy();
  58  |     expect(await page.locator("text=Geographic Focus").isVisible()).toBeTruthy();
  59  |   });
  60  | 
  61  |   test("validates required fields before submission", async ({ page }) => {
  62  |     await page.goto("/investment-genie");
  63  |     await page.click('button:has-text("Continue →")');
  64  |     expect(await page.locator("text=Select at least one").isVisible()).toBeTruthy();
  65  |   });
  66  | 
  67  |   test("can select multiple countries", async ({ page }) => {
  68  |     await page.goto("/investment-genie");
  69  |     await page.click('label:has-text("India")');
  70  |     await page.click('label:has-text("United States")');
  71  |     const continueBtn = page.locator('button:has-text("Continue →")');
  72  |     expect(await continueBtn.isEnabled()).toBeTruthy();
  73  |   });
  74  | 
  75  |   test("displays recommendation after submission", async ({ page, context }) => {
  76  |     await context.route("**/api/**", (route) => route.abort("aborted"));
  77  |     await page.goto("/investment-genie");
  78  |     await navigateToStep3(page);
  79  |     await page.click('button:has-text("Generate Portfolio")');
  80  |   });
  81  | 
  82  |   test("can adjust risk appetite slider", async ({ page }) => {
  83  |     await page.goto("/investment-genie");
  84  |     // Go to step 2 where slider is visible
  85  |     await page.click('label:has-text("India")');
  86  |     await page.click('button:has-text("Continue →")');
  87  |     
  88  |     const riskSlider = page.locator('input[type="range"][aria-label*="Risk"]');
  89  |     await riskSlider.fill("70");
  90  |     expect(await riskSlider.inputValue()).toBe("70");
  91  |   });
  92  | 
  93  |   test("form can be reset", async ({ page }) => {
  94  |     await page.goto("/investment-genie");
  95  |     const amountInput = page.locator('input[type="number"]');
  96  |     await amountInput.fill("5000");
  97  |     const resetBtn = page.locator('button:has-text("Reset")');
  98  |     if (await resetBtn.first().isVisible()) {
  99  |       await resetBtn.first().click();
> 100 |       expect(await amountInput.inputValue()).toBe("1000"); 
      |                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  101 |     }
  102 |   });
  103 | 
  104 |   test("displays all allocation percentages in recommendation", async ({ page, context }) => {
  105 |     await context.route("**/api/**", (route) => {
  106 |       if (route.request().url().includes("scan/results")) {
  107 |         route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockRecommendation) });
  108 |       } else {
  109 |         route.abort("aborted");
  110 |       }
  111 |     });
  112 |     await page.goto("/investment-genie");
  113 |     await navigateToStep3(page);
  114 |     await page.click('button:has-text("Generate Portfolio")');
  115 |     await page.waitForSelector("text=60", { timeout: 5000 }).catch(() => {});
  116 |   });
  117 | 
  118 |   test("displays top picks with allocation", async ({ page, context }) => {
  119 |     await context.route("**/api/**", (route) => {
  120 |       if (route.request().url().includes("scan/results")) {
  121 |         route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockRecommendation) });
  122 |       } else {
  123 |         route.abort("aborted");
  124 |       }
  125 |     });
  126 |     await page.goto("/investment-genie");
  127 |     await navigateToStep3(page);
  128 |     await page.click('button:has-text("Generate Portfolio")');
  129 |     await page.waitForSelector("text=RELIANCE", { timeout: 5000 }).catch(() => {});
  130 |   });
  131 | 
  132 |   test("handles network errors gracefully", async ({ page, context }) => {
  133 |     await context.route("**/api/**", (route) => route.abort("failed"));
  134 |     await page.goto("/investment-genie");
  135 |     await navigateToStep3(page);
  136 |     await page.click('button:has-text("Generate Portfolio")');
  137 |     await page.waitForSelector("text=error|Error|unable|Unable|failed|Failed", { timeout: 3000 }).catch(() => {});
  138 |   });
  139 | 
  140 |   test("mobile responsive layout", async ({ page }) => {
  141 |     await page.setViewportSize({ width: 375, height: 667 });
  142 |     await page.goto("/investment-genie");
  143 |     expect(await page.locator("form").isVisible()).toBeTruthy();
  144 |     const continueBtn = page.locator('button:has-text("Continue →")');
  145 |     expect(await continueBtn.isVisible()).toBeTruthy();
  146 |   });
  147 | });
  148 | 
```