import { describe, expect, test } from "bun:test";
import { sailingTimerTransition } from "./sailingTimerTransition";

describe("sailingTimerTransition", () => {
  test("records only the final sailor stop when no new sailor starts", () => {
    expect(sailingTimerTransition("player-4", "player-4")).toEqual([
      "player-4",
    ]);
  });

  test("records a stop and next sailor start during a handoff", () => {
    expect(sailingTimerTransition("player-3", "player-4")).toEqual([
      "player-3",
      "player-4",
    ]);
  });
});
