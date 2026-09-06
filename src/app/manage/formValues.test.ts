import { describe, expect, test } from "bun:test";
import type { Id } from "convex/_generated/dataModel";

const playerA = "players_a" as Id<"players">;
const playerB = "players_b" as Id<"players">;

async function loadFormValues() {
  return import("./formValues");
}

describe("management form values", () => {
  test("builds a contestant payload and omits blank optional values", async () => {
    const { buildContestantPayload } = await loadFormValues();

    expect(
      buildContestantPayload({
        name: "  Alice  ",
        imageUrl: "   ",
        funFact: "  Fastest sailor  ",
      }),
    ).toEqual({
      name: "Alice",
      fun_fact: "Fastest sailor",
    });
  });

  test("builds a team payload from selected contestants", async () => {
    const { buildTeamPayload } = await loadFormValues();

    expect(
      buildTeamPayload({
        name: "  Alpha  ",
        imageUrl: " https://example.com/alpha.png ",
        playerIds: [playerA, "", playerB, ""],
      }),
    ).toEqual({
      name: "Alpha",
      image_url: "https://example.com/alpha.png",
      player_1_id: playerA,
      player_2_id: playerB,
      is_out: false,
    });
  });

  test("rejects duplicate contestants in one team", async () => {
    const { buildTeamPayload } = await loadFormValues();

    expect(() =>
      buildTeamPayload({
        name: "Alpha",
        imageUrl: "",
        playerIds: [playerA, playerA, "", ""],
      }),
    ).toThrow("A contestant can only appear once per team");
  });

  test("requires names after trimming whitespace", async () => {
    const { buildContestantPayload, buildTeamPayload } = await loadFormValues();

    expect(() =>
      buildContestantPayload({ name: "   ", imageUrl: "", funFact: "" }),
    ).toThrow("Contestant name is required");
    expect(() =>
      buildTeamPayload({
        name: "   ",
        imageUrl: "",
        playerIds: ["", "", "", ""],
      }),
    ).toThrow("Team name is required");
  });
});
