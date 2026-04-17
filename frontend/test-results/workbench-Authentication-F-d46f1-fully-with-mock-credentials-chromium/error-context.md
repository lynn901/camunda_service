# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench.spec.ts >> Authentication Flow >> should login successfully with mock credentials
- Location: tests/e2e/workbench.spec.ts:20:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[id="username"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input[id="username"]')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test.use({ locale: 'zh-CN' });
  5  | 
  6  |   test('should redirect to login when not authenticated', async ({ page }) => {
  7  |     // Navigate to workbench
  8  |     await page.goto('/workbench/todo');
  9  |     
  10 |     // Ant Design Pro should redirect to login if no currentUser
  11 |     // Increased timeout for slow container initial loads
  12 |     await expect(page).toHaveURL(/.*\/user\/login/, { timeout: 15000 });
  13 |     
  14 |     // Instead of checking specific text that might be localized or late-rendered,
  15 |     // let's check for the existence of ANY input fields which indicates the form is there.
  16 |     const inputs = page.locator('input');
  17 |     await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  18 |   });
  19 | 
  20 |   test('should login successfully with mock credentials', async ({ page }) => {
  21 |     await page.goto('/user/login');
  22 |     
  23 |     // Wait for the page to load by looking for the username field
> 24 |     await expect(page.locator('input[id="username"]')).toBeVisible({ timeout: 10000 });
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  25 | 
  26 |     // Enter mock credentials
  27 |     await page.fill('input[id="username"]', 'admin');
  28 |     await page.fill('input[id="password"]', 'admin');
  29 |     
  30 |     // Click login button
  31 |     const loginButton = page.locator('button[type="submit"]');
  32 |     await loginButton.click();
  33 |     
  34 |     // Should be redirected to home or workbench
  35 |     await expect(page).toHaveURL(/.*\/workbench\/todo/, { timeout: 20000 });
  36 |   });
  37 | });
  38 | 
```