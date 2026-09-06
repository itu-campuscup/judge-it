/**
 * Test fixtures and helpers for E2E tests
 */

import type { Page } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  approved: boolean;
}

/**
 * Test users for authentication flows
 */
export const TEST_USERS: Record<string, TestUser> = {
  approved: {
    email: "test-approved@example.com",
    password: "TestPassword123!",
    approved: true,
  },
  unapproved: {
    email: "test-unapproved@example.com",
    password: "TestPassword123!",
    approved: false,
  },
  new: {
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
    approved: false,
  },
};

/**
 * Test data for fixtures
 */
export const TEST_DATA = {
  players: [
    {
      name: "Test Player 1",
      image_url: "/test-player-1.jpg",
      fun_fact: "Test fact 1",
    },
    {
      name: "Test Player 2",
      image_url: "/test-player-2.jpg",
      fun_fact: "Test fact 2",
    },
  ],
  teams: [
    {
      name: "Test Team Alpha",
      image_url: "/test-team-alpha.jpg",
      is_out: false,
    },
    {
      name: "Test Team Beta",
      image_url: "/test-team-beta.jpg",
      is_out: false,
    },
  ],
  heats: [
    {
      name: "Test Heat 1",
      heat: 1,
      date: new Date().toISOString(),
      is_current: true,
    },
  ],
};

/**
 * Sign up a new user
 */
export async function signUp(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Switch to sign up mode if needed
  const signUpToggle = page.getByText(/create an account/i);
  if (await signUpToggle.isVisible().catch(() => false)) {
    await signUpToggle.click();
    await page.waitForTimeout(500);
  }

  // Fill in form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit
  await page.getByRole("button", { name: /sign up/i }).click();

  // Wait for response (either success or error)
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
}

/**
 * Sign in an existing user
 */
export async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Fill in form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for navigation or response
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page): Promise<void> {
  // Look for sign out button in header/menu
  const signOutButton = page.getByRole("button", { name: /sign out/i });
  if (await signOutButton.isVisible()) {
    await signOutButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Check if user is on pending approval page
 */
export async function isPendingApproval(page: Page): Promise<boolean> {
  const pending = await page
    .getByText(/pending approval/i)
    .isVisible()
    .catch(() => false);
  const waiting = await page
    .getByText(/waiting for admin/i)
    .isVisible()
    .catch(() => false);

  return pending || waiting;
}

/**
 * Check if user has access to dashboard
 */
export async function hasAccessToDashboard(page: Page): Promise<boolean> {
  const judgeLink = await page
    .getByRole("link", { name: /judge/i })
    .isVisible()
    .catch(() => false);
  const statsLink = await page
    .getByRole("link", { name: /stats/i })
    .isVisible()
    .catch(() => false);

  return judgeLink || statsLink;
}

/**
 * Wait for Convex to sync (real-time updates)
 */
export async function waitForConvexSync(
  page: Page,
  ms: number = 1000,
): Promise<void> {
  await page.waitForTimeout(ms);
}

/**
 * Clear browser storage (cookies, localStorage, etc.)
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore if storage is not accessible
      console.debug("Storage clear failed:", e);
    }
  });
}

/**
 * Performance metrics helper
 */
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

export async function getPerformanceMetrics(
  page: Page,
): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType("paint");

    return {
      loadTime: perfData.loadEventEnd - perfData.loadEventStart,
      domContentLoaded:
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      firstPaint: paintEntries.find((p) => p.name === "first-paint")?.startTime,
      firstContentfulPaint: paintEntries.find(
        (p) => p.name === "first-contentful-paint",
      )?.startTime,
    };
  });

  return metrics;
}
