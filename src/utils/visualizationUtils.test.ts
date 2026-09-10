import { describe, expect, test } from "bun:test";
import type { Heat, Player, Team, TimeLog, TimeEntry } from "@/types";
import type { Id } from "convex/_generated/dataModel";
import { getPlayerNameWithTeam, getPlayerTeamAssociations } from "./getUtils";
import {
  generateRadarChartData,
  generateRankableData,
  generateRPMData,
} from "./visualizationUtils";

const id = <
  T extends "players" | "teams" | "heats" | "time_types" | "time_logs",
>(
  value: string,
) => value as Id<T>;


const player = (playerId: string, image_url?: string): Player => ({
  id: id<"players">(playerId),
  name: `Player ${playerId}`,
  image_url,
});

const team = (
  teamId: string,
  name: string,
  roster: string[],
  image_url?: string,
): Team => ({
  id: id<"teams">(teamId),
  name,
  image_url,
  player_1_id: roster[0] ? id<"players">(roster[0]) : undefined,
  player_2_id: roster[1] ? id<"players">(roster[1]) : undefined,
  player_3_id: roster[2] ? id<"players">(roster[2]) : undefined,
  player_4_id: roster[3] ? id<"players">(roster[3]) : undefined,
});

const log = (
  playerId: string,
  teamId: string,
  heatId: string,
  created_at: string,
): TimeLog => ({
  id: id<"time_logs">(`log-${playerId}-${heatId}`),
  player_id: id<"players">(playerId),
  team_id: id<"teams">(teamId),
  heat_id: id<"heats">(heatId),
  time_type_id: id<"time_types">("type"),
  time_seconds: 1,
  time: "12:00:00.000",
  created_at,
});

const heat = (heatId: string, date = "2026-01-01"): Heat => ({
  id: id<"heats">(heatId),
  heat: 1,
  date,
  is_current: false,
});

const result = (
  playerId: string,
  teamId?: string,
  duration = 1000,
): TimeEntry => ({
  playerId: id<"players">(playerId),
  teamId: teamId ? id<"teams">(teamId) : undefined,
  heatId: id<"heats">("heat"),
  duration,
});

describe("rank and comparison visualization data", () => {
  test("uses the explicit result team image and keeps the player's image first", () => {
    const teams = [
      team("old", "Old Team", ["p"], "old.jpg"),
      team("new", "New Team", ["p"], "new.jpg"),
    ];
    const players = [player("p"), player("q", "player.jpg"), player("r")];
    const topTimes = [
      result("p", "old"),
      result("q", "new"),
      result("r", "new"),
    ];

    expect(
      generateRankableData(topTimes, players, teams, [heat("heat")]),
    ).toMatchObject([
      { teamName: "Old Team", imageUrl: "old.jpg" },
      { teamName: "New Team", imageUrl: "player.jpg" },
      { teamName: "New Team", imageUrl: "new.jpg" },
    ]);
    expect(
      generateRPMData(topTimes, players, teams, [heat("heat")]),
    ).toMatchObject([
      { teamName: "Old Team", imageUrl: "old.jpg" },
      { teamName: "New Team", imageUrl: "player.jpg" },
      { teamName: "New Team", imageUrl: "new.jpg" },
    ]);

    expect(
      generateRankableData([result("r")], players, teams, [heat("heat")])[0]
        ?.imageUrl,
    ).toBe("");
  });

  test("uses the same resolved team for comparison naming and radar imagery", () => {
    const teams = [
      team("old", "Old Team", ["p"], "old.jpg"),
      team("new", "New Team", [], "new.jpg"),
    ];
    const players = [player("p")];
    const associations = getPlayerTeamAssociations(
      teams,
      [
        log("p", "new", "new-heat", "2026-09-10T12:00:00.000Z"),
        log("p", "old", "old-heat", "2025-09-10T12:00:00.000Z"),
      ],
      [
        heat("new-heat", "2026-09-10"),
        heat("old-heat", "2025-09-10"),
      ],
    );

    const radar = generateRadarChartData(
      id<"players">("p"),
      {},
      players,
      teams,
      ["Beer"],
      true,
      associations,
    );

    expect(getPlayerNameWithTeam(id<"players">("p"), players, teams, associations)).toBe(
      radar.name,
    );
    expect(radar.name).toBe("Player p - New Team");
    expect(radar.imageUrl).toBe("new.jpg");
  });
});
