import { describe, expect, test } from "bun:test";
import { getBeerSidePhase } from "./beerSidePhase";

describe("getBeerSidePhase", () => {
  test("restarts at sailing when a contestant begins a second leg", () => {
    expect(getBeerSidePhase(9)).toBe(1);
  });
});
