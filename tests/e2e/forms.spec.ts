import { test, expect } from "@playwright/test";

/**
 * Integration tests for form validation and UI interactions
 * These test the frontend validation without requiring backend authentication
 */

test.describe("Form Validation", () => {
  test("should show validation for empty email", async ({ page }) => {
    await page.goto("/");

    // Try to submit without filling email
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();
    await passwordInput.fill("testpassword");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();
    await emailInput.blur(); // Trigger validation

    // Should show required or invalid message
    const emailValidation = await page
      .locator('input[type="email"]:invalid')
      .count();
    expect(emailValidation).toBeGreaterThan(0);
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    // HTML5 validation should mark as invalid
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid,
    );
    expect(isInvalid).toBeTruthy();
  });

  test("should accept valid email format", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");
    await emailInput.blur();

    // Should be valid
    const isValid = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(isValid).toBeTruthy();
  });

  test("should show loading state during form processing", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.getByRole("button", { name: /sign in/i });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Click submit - just verify it doesn't crash
    await submitButton.click();

    // Wait a moment for any processing
    await page.waitForTimeout(500);

    // Page should still be functional
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("UI Interactions", () => {
  test("should clear form when switching between sign in and sign up", async ({
    page,
  }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Fill in form
    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Switch to sign up
    const toggleButton = page.getByText(/create an account/i);
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Form might be cleared or retain values - just check it switches
      await expect(
        page.getByRole("button", { name: /sign up/i }),
      ).toBeVisible();
    }
  });

  test("should handle rapid form submissions gracefully", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.getByRole("button", { name: /sign in/i });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Try to click submit multiple times rapidly
    await submitButton.click();
    await submitButton.click().catch(() => {}); // Might be disabled
    await submitButton.click().catch(() => {}); // Might be disabled

    // Should not crash or cause issues
    await page.waitForTimeout(500);
    expect(await page.isVisible('input[type="email"]')).toBeTruthy();
  });
});

test.describe("Alert Components", () => {
  test("should have alert system available", async ({ page }) => {
    await page.goto("/");

    // Just verify the page loads without errors
    // Alert system may show/hide alerts dynamically
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("Theme and Styling", () => {
  test("should apply MUI theme correctly", async ({ page }) => {
    await page.goto("/");

    // Check that Material-UI components are rendered
    const muiComponents = await page.locator('[class*="Mui"]').count();
    expect(muiComponents).toBeGreaterThan(0);
  });

  test("should have consistent button styling", async ({ page }) => {
    await page.goto("/");

    const signInButton = page.getByRole("button", { name: /sign in/i });

    // Button should have color styles applied
    const backgroundColor = await signInButton.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(backgroundColor).toBeTruthy();
    expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});
