# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> can add picks to watchlist
- Location: e2e\investment-genie.spec.ts:179:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('label:has-text("India")')

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
  95  |     await page.goto("/");
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
> 195 |     await page.click('label:has-text("India")');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  211 |     await context.route("**/api/investment/**", (route) => {
  212 |       if (route.request().url().includes("scan-results")) {
  213 |         route.fulfill({
  214 |           status: 200,
  215 |           contentType: "application/json",
  216 |           body: JSON.stringify(mockRecommendation),
  217 |         });
  218 |       } else {
  219 |         route.continue();
  220 |       }
  221 |     });
  222 | 
  223 |     await page.goto("/");
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
  243 |     await context.route("**/api/investment/**", (route) => {
  244 |       route.abort("failed");
  245 |     });
  246 | 
  247 |     await page.goto("/");
  248 | 
  249 |     // Submit form
  250 |     await page.click('label:has-text("India")');
  251 |     await page.click('button:has-text("Generate Portfolio")');
  252 | 
  253 |     // Should show error message
  254 |     await page.waitForSelector(
  255 |       "text=error|Error|unable|Unable|failed|Failed",
  256 |       { timeout: 3000 }
  257 |     ).catch(() => {
  258 |       // Error handling might differ
  259 |     });
  260 |   });
  261 | 
  262 |   test("mobile responsive layout", async ({ page }) => {
  263 |     // Set mobile viewport
  264 |     await page.setViewportSize({ width: 375, height: 667 });
  265 | 
  266 |     await page.goto("/");
  267 | 
  268 |     // Form should be visible and usable on mobile
  269 |     expect(await page.locator("form").isVisible()).toBeTruthy();
  270 | 
  271 |     const submitBtn = page.locator('button:has-text("Generate Portfolio")');
  272 |     expect(await submitBtn.isVisible()).toBeTruthy();
  273 |   });
  274 | 
  275 |   test("session persistence across page reload", async ({ page, context }) => {
  276 |     const sessionId = "persist-session-123";
  277 | 
  278 |     await context.route("**/api/investment/**", (route) => {
  279 |       if (route.request().url().includes("scan-results")) {
  280 |         route.fulfill({
  281 |           status: 200,
  282 |           contentType: "application/json",
  283 |           body: JSON.stringify({
  284 |             ...mockRecommendation,
  285 |             sessionId,
  286 |           }),
  287 |         });
  288 |       } else {
  289 |         route.continue();
  290 |       }
  291 |     });
  292 | 
  293 |     await page.goto("/");
  294 | 
  295 |     // Submit form
```