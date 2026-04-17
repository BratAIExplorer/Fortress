# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> mobile responsive layout
- Location: e2e\investment-genie.spec.ts:262:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
        - button [ref=e12]:
          - img
      - generic [ref=e13]:
        - generic [ref=e16]: Public Beta Access
        - heading "We don't predict prices. We publish frameworks." [level=1] [ref=e17]:
          - text: We don't predict prices.
          - text: We publish frameworks.
        - paragraph [ref=e18]: The Educational Intelligence Layer for Indian Markets. Bridging the gap between raw screener data and blind tipster faith.
        - generic [ref=e19]:
          - link "Explore V5 Extension" [ref=e20] [cursor=pointer]:
            - /url: /v5-extension
            - text: Explore V5 Extension
            - img
          - link "Fortress 30 List" [ref=e21] [cursor=pointer]:
            - /url: /fortress-30
          - link "Our Constitution" [ref=e22] [cursor=pointer]:
            - /url: /constitution
          - link "How It Works" [ref=e23] [cursor=pointer]:
            - /url: /intelligence
            - img
            - text: How It Works
      - generic [ref=e26]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - img [ref=e31]
            - generic [ref=e35]: Beyond Screeners
          - paragraph [ref=e37]: Screeners dump 500 results on you. We filter the noise and isolate the signal using our 5-Layer Protection framework.
        - generic [ref=e39]:
          - generic [ref=e40]:
            - img [ref=e42]
            - generic [ref=e45]: Anti-Tipster
          - paragraph [ref=e47]: We never tell you to buy. We explain why a business passed our quality checks. The final decision is always yours.
        - generic [ref=e49]:
          - generic [ref=e50]:
            - img [ref=e52]
            - generic [ref=e54]: Education First
          - paragraph [ref=e56]: Every stock in the Fortress 30 comes with a 'Why' thesis. Learn the logic behind the list, don't just copy it.
      - generic [ref=e58]:
        - paragraph [ref=e59]: © 2026 Fortress Intelligence. All rights reserved.
        - paragraph [ref=e60]: Not a SEBI registered investment advisor. For educational purposes only.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e66] [cursor=pointer]:
    - img [ref=e67]
```

# Test source

```ts
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
> 269 |     expect(await page.locator("form").isVisible()).toBeTruthy();
      |                                                    ^ Error: expect(received).toBeTruthy()
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
  296 |     await page.click('label:has-text("India")');
  297 |     await page.click('button:has-text("Generate Portfolio")');
  298 | 
  299 |     // Reload page
  300 |     await page.reload();
  301 | 
  302 |     // Session data should be retrievable (check localStorage/sessionStorage)
  303 |     const sessionData = await page.evaluate(() =>
  304 |       sessionStorage.getItem("investmentGenieSession")
  305 |     );
  306 | 
  307 |     if (sessionData) {
  308 |       const parsed = JSON.parse(sessionData);
  309 |       expect(parsed.sessionId || parsed.id).toBeTruthy();
  310 |     }
  311 |   });
  312 | });
  313 | 
```