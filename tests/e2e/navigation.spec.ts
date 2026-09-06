import { test, expect } from "@playwright/test";

test.describe("Judge Page (Unauthenticated)", () => {
  test("should show not logged in message when accessing judge page without auth", async ({
    page,
  }) => {
    await page.goto("/judge-it");
    await page.waitForLoadState("networkidle");

    // Wait a bit for any redirects or dynamic content
    await page.waitForTimeout(1000);

    // Check for the actual text from NotLoggedIn component or auth UI
    const needsLogin = await page
      .getByText(/need to be logged in/i)
      .isVisible()
      .catch(() => false);
    const hasSignIn = await page
      .locator('input[type="email"]')
      .isVisible()
      .catch(() => false);
    const hasHomeButton = await page
      .getByRole("button", { name: /go to home/i })
      .isVisible()
      .catch(() => false);

    expect(needsLogin || hasSignIn || hasHomeButton).toBeTruthy();
  });
});

test.describe("Stats Page (Unauthenticated)", () => {
  test("should show not logged in message when accessing stats page without auth", async ({
    page,
  }) => {
    await page.goto("/stats");
    await page.waitForLoadState("networkidle");

    // Wait a bit for any redirects or dynamic content
    await page.waitForTimeout(1000);

    // Check for the actual text from NotLoggedIn component or auth UI
    const needsLogin = await page
      .getByText(/need to be logged in/i)
      .isVisible()
      .catch(() => false);
    const hasSignIn = await page
      .locator('input[type="email"]')
      .isVisible()
      .catch(() => false);
    const hasHomeButton = await page
      .getByRole("button", { name: /go to home/i })
      .isVisible()
      .catch(() => false);

    expect(needsLogin || hasSignIn || hasHomeButton).toBeTruthy();
  });
});

test.describe("Page Loading Performance", () => {
  test("homepage should load within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should not have console errors on homepage", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out expected errors (like network errors in test environment)
    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes("net::ERR_") &&
        !error.includes("Failed to load resource") &&
        !error.includes("favicon"),
    );

    expect(unexpectedErrors).toEqual([]);
  });
});

test.describe("SEO and Meta Tags", () => {
  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check for viewport meta tag
    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toBeTruthy();

    // Check for charset - meta tags exist in DOM but aren't "visible"
    const charsetCount = await page.locator("meta[charset]").count();
    expect(charsetCount).toBeGreaterThan(0);
  });
});

test.describe("Error Handling", () => {
  test("should handle 404 pages gracefully", async ({ page }) => {
    const response = await page.goto("/non-existent-page");

    // Should return 404 or show not found page
    expect(response?.status()).toBe(404);
  });

  test("should show custom 404 page", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Check if custom 404 content exists
    const notFoundIndicator =
      (await page
        .getByText(/not found/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/404/i)
        .isVisible()
        .catch(() => false));

    expect(notFoundIndicator).toBeTruthy();
  });
});
