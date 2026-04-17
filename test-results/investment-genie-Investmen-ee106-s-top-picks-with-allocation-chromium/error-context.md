# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investment-genie.spec.ts >> Investment Genie Full Journey >> displays top picks with allocation
- Location: e2e\investment-genie.spec.ts:154:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - heading "Something went wrong!" [level=2] [ref=e4]
      - paragraph [ref=e5]: We apologize for the inconvenience. An unexpected error has occurred.
      - button "Try again" [ref=e6]
  - region "Notifications alt+T"
  - generic [ref=e11] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e12]:
      - img [ref=e13]
    - generic [ref=e16]:
      - button "Open issues overlay" [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: "3"
          - generic [ref=e20]: "4"
        - generic [ref=e21]:
          - text: Issue
          - generic [ref=e22]: s
      - button "Collapse issues badge" [ref=e23]:
        - img [ref=e24]
  - alert [ref=e26]
```