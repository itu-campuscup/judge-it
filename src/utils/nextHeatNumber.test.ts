import { describe, expect, test } from "bun:test";
import { nextHeatNumber } from "./nextHeatNumber";

describe("nextHeatNumber", () => {
  test("resets for a new calendar year", () => {
    expect(
      nextHeatNumber(
        [
          { heat: 16, date: "2025-09-06" },
          { heat: 3, date: "2025-09-07" },
        ],
        "2026-01-01",
      ),
    ).toBe(1);
  });

  test("increments only the selected calendar year", () => {
    expect(
      nextHeatNumber(
        [
          { heat: 16, date: "2025-09-06" },
          { heat: 3, date: "2026-09-07" },
        ],
        "2026-09-08",
      ),
    ).toBe(4);
  });
});
