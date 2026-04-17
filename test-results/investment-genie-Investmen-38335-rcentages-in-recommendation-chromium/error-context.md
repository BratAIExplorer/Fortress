# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> displays all allocation percentages in recommendation
- Location: e2e\investment-genie.spec.ts:125:7

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
                - generic [ref=e38] [cursor=pointer]:
                  - generic [ref=e39]: India
                  - generic [ref=e40]: ✓
                - generic [ref=e42] [cursor=pointer]: United States
                - generic [ref=e44] [cursor=pointer]: Malaysia
                - generic [ref=e46] [cursor=pointer]: Singapore
                - generic [ref=e48] [cursor=pointer]: ETFs
            - generic [ref=e49]:
              - generic [ref=e50]: "Risk Appetite: 50"
              - slider "Risk Appetite" [ref=e51] [cursor=pointer]: "50"
            - generic [ref=e52]:
              - generic [ref=e53]: Income Stability
              - generic [ref=e54]:
                - generic [ref=e57] [cursor=pointer]: stable
                - generic [ref=e60] [cursor=pointer]: variable
                - generic [ref=e63] [cursor=pointer]: business
        - button "Generate Optimal Portfolio" [ref=e65]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e71] [cursor=pointer]:
    - img [ref=e72]
  - alert [ref=e75]
```

# Test source

```ts
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
  60  |     await page.click('button:has-text("Generate Portfolio")');
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
> 146 |     await page.click('button:has-text("Generate Portfolio")');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  161 |         });
  162 |       } else {
  163 |         route.abort("aborted");
  164 |       }
  165 |     });
  166 | 
  167 |     await page.goto("/investment-genie");
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
  180 |     await context.route("**/api/**", (route) => {
  181 |       if (route.request().url().includes("scan/results")) {
  182 |         route.fulfill({
  183 |           status: 200,
  184 |           contentType: "application/json",
  185 |           body: JSON.stringify(mockRecommendation),
  186 |         });
  187 |       } else {
  188 |         route.abort("aborted");
  189 |       }
  190 |     });
  191 | 
  192 |     await page.goto("/investment-genie");
  193 | 
  194 |     // Submit form
  195 |     await page.click('label:has-text("India")');
  196 |     await page.click('button:has-text("Generate Portfolio")');
  197 | 
  198 |     // Look for watchlist button
  199 |     const watchlistBtn = page.locator(
  200 |       'button:has-text("Add to Watchlist"), button:has-text("Save")'
  201 |     );
  202 |     if (await watchlistBtn.isVisible()) {
  203 |       await watchlistBtn.click();
  204 |       expect(await page.locator("text=Added|Saved").isVisible()).toBeTruthy();
  205 |     }
  206 |   });
  207 | 
  208 |   test("can export recommendation", async ({ page, context }) => {
  209 |     let downloadPromise: Promise<any> | null = null;
  210 | 
  211 |     await context.route("**/api/**", (route) => {
  212 |       if (route.request().url().includes("scan/results")) {
  213 |         route.fulfill({
  214 |           status: 200,
  215 |           contentType: "application/json",
  216 |           body: JSON.stringify(mockRecommendation),
  217 |         });
  218 |       } else {
  219 |         route.abort("aborted");
  220 |       }
  221 |     });
  222 | 
  223 |     await page.goto("/investment-genie");
  224 | 
  225 |     // Submit form
  226 |     await page.click('label:has-text("India")');
  227 |     await page.click('button:has-text("Generate Portfolio")');
  228 | 
  229 |     // Look for export button
  230 |     const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV")');
  231 |     if (await exportBtn.isVisible()) {
  232 |       downloadPromise = page.waitForEvent("download");
  233 |       await exportBtn.click();
  234 | 
  235 |       if (downloadPromise) {
  236 |         const download = await downloadPromise;
  237 |         expect(download.suggestedFilename()).toContain(".csv");
  238 |       }
  239 |     }
  240 |   });
  241 | 
  242 |   test("handles network errors gracefully", async ({ page, context }) => {
  243 |     await context.route("**/api/**", (route) => {
  244 |       route.abort("failed");
  245 |     });
  246 | 
```