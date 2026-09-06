# End-to-End Testing Guide

> **⚠️ Important:** This E2E testing suite is not complete.
> It currently covers unauthenticated user flows and basic navigation.
> Thus if the tests pass it does **not guarantee** that all protected features are working correctly.

This directory contains E2E tests using [Playwright](https://playwright.dev/).

## Test Structure

```
tests/
├── e2e/
│   ├── homepage.spec.ts       # Homepage and authentication UI tests
│   ├── navigation.spec.ts     # Page navigation and routing tests
│   ├── forms.spec.ts          # Form validation and interaction tests
│   ├── auth.spec.ts           # Authenticated user flow tests
│   ├── performance.spec.ts    # Performance benchmarks
│   ├── visual.spec.ts         # Visual regression tests
│   └── helpers.ts             # Test utilities and fixtures
└── README.md
```

## Running Tests

### Prerequisites

Install Playwright browsers (only needed once):

```bash
bunx playwright install --with-deps
```

### Commands

```bash
# Run all tests (headless)
bun run test

# Run tests with UI mode (interactive)
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Debug tests
bun run test:debug

# View test report
bun run test:report

# Update visual snapshots
bun run test:update-snapshots

# Run specific test file
bunx playwright test auth.spec.ts

# Run tests matching pattern
bunx playwright test -g "authentication"
```

## Test Coverage

### 🏠 Homepage Tests (`homepage.spec.ts`)

- Sign in form display
- Page title verification
- Toggle between sign in/sign up
- Pending approval page
- Header component presence
- Accessibility checks
- Responsive design (mobile, tablet)

### 🧭 Navigation Tests (`navigation.spec.ts`)

- Protected routes (judge-it, stats)
- Page loading performance
- Console error monitoring
- SEO and meta tags
- 404 error handling

### 📝 Form Tests (`forms.spec.ts`)

- Email validation
- Password requirements
- Submit button states
- Form switching behavior
- Alert components
- Theme and styling

## CI/CD Integration

Tests run automatically on:

- PR to main/develop
- Pushes to main/develop

### GitHub Actions Workflow

The CI pipeline includes:

1. **Lint** - Code quality checks
2. **Build** - Application build verification
3. **E2E Tests** - Full Playwright test suite

Test reports are uploaded as artifacts and retained for 30 days.

## Writing New Tests

### Example Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("should do something", async ({ page }) => {
    await page.goto("/my-page");
    
    await expect(page.getByText("Hello")).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic locators**: Prefer `getByRole`, `getByText`, `getByLabel`
2. **Wait for elements**: Use `waitForSelector` or `expect().toBeVisible()`
3. **Test user flows**: Focus on what users actually do
4. **Keep tests independent**: Each test should work in isolation
5. **Use descriptive names**: Test names should explain what they verify

## Configuration

Configuration is in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: http://localhost:3000
- **Retries**: 2 on CI, 0 locally
- **Parallel**: Disabled on CI for stability

## Debugging

### View trace for failed tests

```bash
bunx playwright show-trace test-results/.../trace.zip
```

### Run specific test file

```bash
bunx playwright test homepage.spec.ts
```

### Run specific test

```bash
bunx playwright test -g "should display sign in form"
```

## Environment Variables

Required variables:

- `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL

Tests automatically load `.env.local` for configuration.

## Test Utilities

### Helper Functions (`helpers.ts`)

```typescript
import { signUp, signIn, signOut, clearStorage } from "./helpers";

// Sign up new user
await signUp(page, "test@example.com", "password");

// Sign in existing user
await signIn(page, "test@example.com", "password");

// Sign out
await signOut(page);

// Clear storage
await clearStorage(page);

// Get performance metrics
const metrics = await getPerformanceMetrics(page);
```

### Test Fixtures

Pre-configured test users and data available in `helpers.ts`:
- `TEST_USERS.approved` - Approved user account
- `TEST_USERS.unapproved` - Unapproved user account
- `TEST_USERS.new` - Dynamically generated new user
- `TEST_DATA` - Sample players, teams, heats data

## Known Limitations

1. **Database Fixtures**: Tests use live database - no isolated test DB yet
2. **Real-time Updates**: Full WebSocket testing coverage pending
3. **Authenticated Flows**: Require manual user approval in Convex Dashboard

## Visual Regression Testing

### First Time Setup

```bash
# Generate baseline screenshots
bun run test:update-snapshots
```

This creates baseline images in `tests/e2e/*-snapshots/` directories.

### Updating Baselines

When intentional visual changes are made:

```bash
# Update all snapshots
bun run test:update-snapshots

# Update specific test
bunx playwright test visual.spec.ts --update-snapshots
```

### Reviewing Failures

When visual tests fail:

1. Check `test-results/` for diff images
2. Review in Playwright HTML report: `bun run test:report`
3. Accept changes if intentional: `bun run test:update-snapshots`

## Performance Benchmarks

Performance budgets are defined in `performance.spec.ts`:

- **Homepage load**: < 3 seconds
- **Judge page load**: < 4 seconds  
- **Stats page load**: < 4 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Mobile load**: < 4 seconds
- **Tablet load**: < 3.5 seconds

Failures indicate performance regressions that need investigation.

## Future Improvements

- [x] Add authenticated user flow tests
- [x] Add performance benchmarks
- [x] Add visual regression testing
- [ ] Add database fixture setup/teardown
- [ ] Add API testing alongside E2E tests
- [ ] Add load testing for concurrent users
- [ ] Add accessibility audit automation

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
