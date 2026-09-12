import { describe, test, expect } from "bun:test";
import {
  splitTimeLogsPerHeat,
  sortTimeLogsByHeatAndTime,
} from "./sortFilterUtils";
import type { TimeLog } from "@/types";
import { Id } from "convex/_generated/dataModel";

describe("sortFilterUtils", () => {
  describe("splitTimeLogsPerHeat", () => {
    test("returns empty array for empty input", () => {
      expect(splitTimeLogsPerHeat([])).toEqual([]);
    });

    test("groups logs by heat ID in O(N) single pass without creating duplicate groups", () => {
      const logs: TimeLog[] = [
        {
          id: "1" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p1" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:10.000",
        },
        {
          id: "2" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p2" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:11.000",
        },
        {
          id: "3" as Id<"time_logs">,
          heat_id: "heat_2" as Id<"heats">,
          player_id: "p3" as Id<"players">,
          team_id: "t2" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:12.000",
        },
        {
          id: "4" as Id<"time_logs">,
          heat_id: "heat_2" as Id<"heats">,
          player_id: "p4" as Id<"players">,
          team_id: "t2" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:13.000",
        },
      ];

      const result = splitTimeLogsPerHeat(logs);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
      expect(result[0][0].heat_id).toBe("heat_1" as Id<"heats">);
      expect(result[1][0].heat_id).toBe("heat_2" as Id<"heats">);
    });

    test("handles non-contiguous heat IDs correctly", () => {
      const logs: TimeLog[] = [
        {
          id: "1" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p1" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:10.000",
        },
        {
          id: "2" as Id<"time_logs">,
          heat_id: "heat_2" as Id<"heats">,
          player_id: "p2" as Id<"players">,
          team_id: "t2" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:11.000",
        },
        {
          id: "3" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p3" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:12.000",
        },
      ];

      const result = splitTimeLogsPerHeat(logs);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2); // heat_1 has logs 1 & 3
      expect(result[1]).toHaveLength(1); // heat_2 has log 2
    });
  });

  describe("sortTimeLogsByHeatAndTime", () => {
    test("sorts by heat ID and then time", () => {
      const logs: TimeLog[] = [
        {
          id: "1" as Id<"time_logs">,
          heat_id: "heat_2" as Id<"heats">,
          player_id: "p1" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:12.000",
        },
        {
          id: "2" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p2" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:15.000",
        },
        {
          id: "3" as Id<"time_logs">,
          heat_id: "heat_1" as Id<"heats">,
          player_id: "p3" as Id<"players">,
          team_id: "t1" as Id<"teams">,
          time_type_id: "tt1" as Id<"time_types">,
          time: "00:00:10.000",
        },
      ];

      const sorted = sortTimeLogsByHeatAndTime(logs);
      expect(sorted[0].id).toBe("3" as Id<"time_logs">);
      expect(sorted[1].id).toBe("2" as Id<"time_logs">);
      expect(sorted[2].id).toBe("1" as Id<"time_logs">);
    });
  });
});
