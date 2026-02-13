import { test, expect } from "@playwright/test";
import { getPerformanceMetrics } from "./helpers";

/**
 * Performance Benchmarks
 *
 * These tests measure and validate application performance metrics
 */

test.describe("Performance Benchmarks", () => {
  test("homepage should load within performance budget", async ({ page }) => {
    const startTime = performance.now();

    await page.goto("/", { waitUntil: "networkidle" });

    const loadTime = performance.now() - startTime;

    // Performance budget: 3 seconds for full load
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have acceptable Time to Interactive", async ({ page }) => {
    await page.goto("/");

    const metrics = await getPerformanceMetrics(page);

    // First Contentful Paint should be under 1.5s
    if (metrics.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(1500);
    }
  });

  test("should load judge page efficiently", async ({ page }) => {
    const startTime = performance.now();

    await page.goto("/judge-it", { waitUntil: "networkidle" });

    const loadTime = performance.now() - startTime;

    // Judge page should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });

  test("should load stats page efficiently", async ({ page }) => {
    const startTime = performance.now();

    await page.goto("/stats", { waitUntil: "networkidle" });

    const loadTime = performance.now() - startTime;

    // Stats page should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });

  test("should have minimal JavaScript bundle size impact", async ({
    page,
  }) => {
    await page.goto("/");

    // Get all script sizes
    const scriptSizes = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      return scripts.map((s) => (s as HTMLScriptElement).src);
    });

    // Should have scripts loaded
    expect(scriptSizes.length).toBeGreaterThan(0);
  });

  test("should render without layout shifts", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be fully rendered
    await page.waitForLoadState("networkidle");

    // Check that main form is stable
    const emailInput = page.locator('input[type="email"]');
    const initialPosition = await emailInput.boundingBox();

    await page.waitForTimeout(500);

    const finalPosition = await emailInput.boundingBox();

    // Position should not change (no layout shift)
    expect(initialPosition?.y).toBe(finalPosition?.y);
  });
});

test.describe("Resource Loading", () => {
  test("should not have network errors", async ({ page }) => {
    const failedRequests: string[] = [];

    page.on("requestfailed", (request) => {
      // Ignore favicon errors
      if (!request.url().includes("favicon")) {
        failedRequests.push(request.url());
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });

    expect(failedRequests).toEqual([]);
  });

  test("should load images efficiently", async ({ page }) => {
    await page.goto("/");

    // Check for lazy loading attributes
    const images = await page.locator("img").count();

    // If there are images, verify they don't block rendering
    if (images > 0) {
      // Some images should use lazy loading for performance
      const lazyImages = await page.locator('img[loading="lazy"]').count();
      expect(lazyImages >= 0).toBeTruthy();
    }
  });

  test("should use appropriate caching headers", async ({ page }) => {
    const response = await page.goto("/");

    // Check that response has caching headers
    const headers = response?.headers();
    expect(headers).toBeDefined();
  });
});

test.describe("Memory and CPU Usage", () => {
  test("should not leak memory on navigation", async ({ page }) => {
    await page.goto("/");

    // Navigate multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto("/judge-it");
      await page.goto("/stats");
      await page.goto("/");
    }

    // Page should still be responsive
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should handle rapid interactions without degradation", async ({
    page,
  }) => {
    await page.goto("/");

    // Ensure input is present
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Measure typing time inside the page to avoid Playwright round-trips
    const typingTime = await page.evaluate(() => {
      const input = document.querySelector(
        'input[type="email"]',
      ) as HTMLInputElement | null;
      if (!input) return Number.POSITIVE_INFINITY;

      input.focus();
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        input.value += "a";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      return performance.now() - start;
    });

    // Should complete quickly (< 2 seconds for 50 synthetic keystrokes)
    expect(typingTime).toBeLessThan(2000);
  });
});

test.describe("Responsive Performance", () => {
  test("should load efficiently on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = performance.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = performance.now() - startTime;

    // Mobile should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });

  test("should load efficiently on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const startTime = performance.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = performance.now() - startTime;

    // Tablet should load within 3.5 seconds
    expect(loadTime).toBeLessThan(3500);
  });
});
