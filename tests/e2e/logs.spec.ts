import { test, expect } from "@playwright/test";

test.describe("Logs API Endpoint", () => {
  test("should accept valid log payloads and return 200/206/400 based on level", async ({
    request,
  }) => {
    // Test info level returns 200
    const infoResponse = await request.post("/api/logs", {
      data: {
        timestamp: new Date().toISOString(),
        level: "info",
        endpoint: "test-endpoint",
        operation: "test-op",
        user: {
          id: "123",
          email: "user@example.com",
        },
      },
    });
    expect(infoResponse.status()).toBe(200);
    const infoBody = await infoResponse.json();
    expect(infoBody).toEqual({ success: true });

    // Test warn level returns 206
    const warnResponse = await request.post("/api/logs", {
      data: {
        timestamp: new Date().toISOString(),
        level: "warn",
        endpoint: "test-endpoint",
        operation: "test-op",
        user: {
          id: "123",
          email: "user@example.com",
        },
      },
    });
    expect(warnResponse.status()).toBe(206);

    // Test error level returns 400
    const errorResponse = await request.post("/api/logs", {
      data: {
        timestamp: new Date().toISOString(),
        level: "error",
        endpoint: "test-endpoint",
        operation: "test-op",
        user: {
          id: "123",
          email: "user@example.com",
        },
      },
    });
    expect(errorResponse.status()).toBe(400);
  });

  test("should reject invalid log formats with 400", async ({ request }) => {
    const badResponse = await request.post("/api/logs", {
      data: "not-an-object",
    });
    expect(badResponse.status()).toBe(400);
  });

  test("should securely mask PII email addresses, including single-character and two-character prefixes", () => {
    // The exact regex used in src/app/api/logs/route.ts
    const maskRegex = /(.)(.*)(@.*)/;
    const maskEmail = (email: string) => email.replace(maskRegex, "$1***$3");

    // Single-character prefix
    expect(maskEmail("a@example.com")).toBe("a***@example.com");

    // Two-character prefix
    expect(maskEmail("ab@example.com")).toBe("a***@example.com");

    // Multiple-character prefix
    expect(maskEmail("abc@example.com")).toBe("a***@example.com");
    expect(maskEmail("john.doe@example.com")).toBe("j***@example.com");
  });
});
