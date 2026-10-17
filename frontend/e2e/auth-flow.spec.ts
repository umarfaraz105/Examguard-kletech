import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    // Validation messages should appear
    await expect(page.locator('text=/required/i').first()).toBeVisible({ timeout: 2000 });
  });

  test('should accept input in email and password fields', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe('admin@example.com');
  });

  // Note: Full E2E tests require backend server running
  // These tests are placeholders and should be expanded when backend is available
  test.skip('should login as admin and redirect to dashboard', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test.skip('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');

    await page.waitForURL('/login');
    await expect(page.locator('h1')).toContainText('Login');
  });
});
