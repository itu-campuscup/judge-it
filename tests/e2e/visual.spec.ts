import { test, expect } from "@playwright/test";

// Skip visual regression tests on CI — snapshots are platform-specific
// (currently only chromium-win32 baselines exist).
test.skip(
  !!process.env.CI,
  "Visual snapshots are platform-specific, skipped on CI",
);

/**
 * Visual Regression Tests
 *
 * These tests capture screenshots and compare them against baseline images
 * to detect unintended visual changes.
 *
 * First run: Creates baseline screenshots
 * Subsequent runs: Compares against baseline and highlights differences
 */

test.describe("Visual Regression - Homepage", () => {
  test("should match homepage design", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts and images to load
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("should match sign in form", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const signInForm = page.locator("form, main").first();
    await expect(signInForm).toHaveScreenshot("sign-in-form.png", {
      animations: "disabled",
    });
  });

  test("should match mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("should match tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Pending Approval", () => {
  test("should match pending approval page", async ({ page }) => {
    await page.goto("/pending-approval");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("pending-approval.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Protected Pages", () => {
  test("should match judge page (unauthenticated)", async ({ page }) => {
    await page.goto("/judge-it");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("judge-it-unauth.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("should match stats page (unauthenticated)", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("stats-unauth.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Form States", () => {
  test("should match form with valid input", async ({ page }) => {
    await page.goto("/");

    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="password"]').fill("password123");

    const form = page.locator("form, main").first();
    await expect(form).toHaveScreenshot("form-filled.png", {
      animations: "disabled",
    });
  });

  test("should match form with validation error", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    // Wait for validation to show
    await page.waitForTimeout(300);

    const form = page.locator("form, main").first();
    await expect(form).toHaveScreenshot("form-validation-error.png", {
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - 404 Page", () => {
  test("should match 404 page design", async ({ page }) => {
    await page.goto("/non-existent-page");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("404-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Component States", () => {
  test("should match button hover state", async ({ page }) => {
    await page.goto("/");

    const submitButton = page.getByRole("button", { name: /sign in/i });
    await submitButton.hover();
    await page.waitForTimeout(200);

    await expect(submitButton).toHaveScreenshot("button-hover.png", {
      animations: "disabled",
    });
  });

  test("should match input focus state", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.focus();
    await page.waitForTimeout(200);

    await expect(emailInput).toHaveScreenshot("input-focus.png", {
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Dark Mode", () => {
  test("should match dark mode if supported", async ({ page }) => {
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Accessibility Features", () => {
  test("should match high contrast mode", async ({ page }) => {
    // Emulate forced colors (high contrast mode)
    await page.emulateMedia({ forcedColors: "active" });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("homepage-high-contrast.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("should match reduced motion preference", async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("homepage-reduced-motion.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
