import { describe, expect, test } from "bun:test";
import { shouldRedirectToSignIn } from "./RequireApproval";

describe("RequireApproval redirect", () => {
  test("waits for auth hydration before redirecting", () => {
    expect(shouldRedirectToSignIn(true, false)).toBe(false);
    expect(shouldRedirectToSignIn(false, false)).toBe(true);
    expect(shouldRedirectToSignIn(false, true)).toBe(false);
  });
});
