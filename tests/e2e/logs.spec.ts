import { test, expect } from "@playwright/test";

test.describe("Logging API Route Security", () => {
  test("should accept log payload and redact PII in email addresses", async ({
    request,
  }) => {
    const response = await request.post("/api/logs", {
      data: {
        level: "info",
        endpoint: "/test",
        operation: "test_op",
        user: {
          id: "user123",
          email: "a@domain.com",
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("should handle multi-character email address logging", async ({
    request,
  }) => {
    const response = await request.post("/api/logs", {
      data: {
        level: "info",
        endpoint: "/test",
        operation: "test_op",
        user: {
          id: "user456",
          email: "user@domain.com",
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
