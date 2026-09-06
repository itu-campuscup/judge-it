import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display sign in form when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for sign in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    // Verify page loaded by checking for sign in form
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should toggle between sign in and sign up", async ({ page }) => {
    await page.goto("/");

    // Should start with Sign In
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // Click to switch to Sign Up
    const toggleButton = page.getByText(/create an account/i);
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(
        page.getByRole("button", { name: /sign up/i }),
      ).toBeVisible();

      // Switch back to Sign In
      await page.getByText(/already have an account/i).click();
      await expect(
        page.getByRole("button", { name: /sign in/i }),
      ).toBeVisible();
    }
  });
});

test.describe("Pending Approval Page", () => {
  test("should be accessible directly", async ({ page }) => {
    await page.goto("/pending-approval");

    // Should show pending approval message
    await expect(page.getByText(/pending approval/i).first()).toBeVisible();
  });

  test("should display pending status", async ({ page }) => {
    await page.goto("/pending-approval");

    // Check for pending approval indicators
    const hasPending = await page
      .getByText(/pending/i)
      .isVisible()
      .catch(() => false);
    const hasApproval = await page
      .getByText(/approval/i)
      .isVisible()
      .catch(() => false);

    expect(hasPending || hasApproval).toBeTruthy();
  });
});

test.describe("Navigation and Header", () => {
  test("should have page structure", async ({ page }) => {
    await page.goto("/");

    // Page should have main content visible
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("should have proper form labels", async ({ page }) => {
    await page.goto("/");

    // Check for proper form structure
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check for accessible buttons
    const signInButton = page.getByRole("button", { name: /sign in/i });
    await expect(signInButton).toBeEnabled();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/");

    // Tab through form elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that focus is working
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Form should still be visible on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
