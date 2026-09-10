// filepath: c:\projects\judge-it\src\utils\visualizationUtils.ts
import {
  timeToMilli,
  formatTime,
  calcTimeDifference,
  calcRPM,
  milliToSecs,
} from "./timeUtils";
import {
  getTeamName,
  getPlayerFunFact,
  getTeamImageUrl,
  getPlayerNameWithTeam,
  getPlayerImageWithFallback,
  type PlayerTeamAssociations,
} from "./getUtils";
import { REVOLUTIONS, PERFORMANCE_SCALES } from "./constants";
import type { TimeLog, Heat, Player, Team } from "../types";
import { Id } from "convex/_generated/dataModel";

/**
 * Filters and sorts time logs for a given year and time type.
 * Performance: Optimized from O(H*L) to O(H+L) using a Set for heat ID lookups.
 */
export const filterAndSortTimeLogs = (
  timeLogs: TimeLog[],
  heats: Heat[],
  selectedYear: number,
  timeTypeId: string,
): TimeLog[] => {
  const heatIdsInYear = new Set(
    heats
      .filter((heat) => new Date(heat.date).getFullYear() === selectedYear)
      .map((heat) => heat.id),
  );

  return timeLogs
    .filter(
      (tl) => tl.time_type_id === timeTypeId && heatIdsInYear.has(tl.heat_id),
    )
    .sort((a, b) => timeToMilli(a.time || "") - timeToMilli(b.time || ""));
};

interface TimeEntry {
  playerId: Id<"players">;
  teamId?: Id<"teams">;
  heatId: Id<"heats">;
  timeSeconds?: number;
  startTime?: string;
  endTime?: string;
  formattedTime?: string;
  duration?: number;
}

/**
 * Calculates the chug or sail times for the given logs.
 * Performance Optimization: Refactored from O(N^2) to O(N) using a Map to pair start/end logs.
 */
export const calculateTimes = (
  logsForHeatsSortByTime: TimeLog[],
): TimeEntry[] => {
  const times: TimeEntry[] = [];
  // Use a Map to track pending start logs: "playerId-heatId" -> { startTime, teamId }
  const pendingStarts = new Map<
    string,
    { startTime: string; teamId?: Id<"teams"> }
  >();

  for (const log of logsForHeatsSortByTime) {
    const key = `${log.player_id}-${log.heat_id}`;
    const startTimeData = pendingStarts.get(key);

    if (startTimeData) {
      // If we have a pending start for this player/heat, this log is the end time
      const duration = calcTimeDifference(
        startTimeData.startTime,
        log.time || "",
      );
      const formattedTime = formatTime(duration);
      times.push({
        playerId: log.player_id,
        heatId: log.heat_id,
        teamId: startTimeData.teamId,
        formattedTime,
        duration,
      });
      // Clear the pending start after pairing
      pendingStarts.delete(key);
    } else {
      // Otherwise, this log is the start time
      pendingStarts.set(key, {
        startTime: log.time || "",
        teamId: log.team_id,
      });
    }
  }

  return times.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
};

/**
 * Remove time entries which have same player ID.
 * @param {Array} timeEntries - The list of filtered time entries.
 * @returns {Array} The list of time entries without duplicates.
 */
export const removeDuplicateTimeEntriesAll = (
  timeEntries: TimeEntry[],
): TimeEntry[] => {
  const playerIds = new Set();
  const filteredEntries = [];
  for (const entry of timeEntries) {
    const playerId = entry.playerId;
    if (playerIds.has(playerId)) {
      continue;
    }
    playerIds.add(playerId);
    filteredEntries.push(entry);
  }
  return filteredEntries;
};

/**
 * Remove time entries which have same player ID.
 * @param {Array} timeEntries - The list of filtered time entries.
 * @returns {Array} The list of time entries without duplicates.
 */
export const removeDuplicateTimeEntries = (
  timeEntries: TimeEntry[],
): TimeEntry[] => {
  const playerIds = new Set();
  const filteredEntries = [];
  for (const entry of timeEntries) {
    const playerId = entry.playerId;
    if (playerIds.has(playerId)) {
      continue;
    }
    if (filteredEntries.length >= 5) {
      break;
    }
    playerIds.add(playerId);
    filteredEntries.push(entry);
  }
  return filteredEntries;
};

/**
 * Generates the chart data for the top times.
 * Performance Optimization: Pre-computes lookup Maps for players, teams, and heats
 * to achieve O(1) entity resolution per entry instead of nested array .find() scans,
 * reducing total time complexity from O(N * (P + T + H)) to O(N + P + T + H).
 *
 * @param {Array} topTimes - The top times.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @param {Array} heats - The list of heats.
 * @returns {Array} The bar chart data.
 */
export const generateRankableData = (
  topTimes: TimeEntry[],
  players: Player[],
  teams: Team[],
  heats: Heat[],
): Array<{
  time: number;
  imageUrl: string;
  playerName: string;
  teamName: string;
  heatNumber: string;
}> => {
  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));
  const teamMap = new Map<string, Team>(teams.map((t) => [t.id, t]));
  const heatMap = new Map<string, Heat>(heats.map((h) => [h.id, h]));

  return topTimes.map((time) => {
    const player = playerMap.get(time.playerId);
    const team = time.teamId ? teamMap.get(time.teamId) : undefined;
    const imageUrl = player?.image_url || team?.image_url || "";
    const playerName = player ? player.name : "";
    const teamName = team ? team.name : "";
    const heat = heatMap.get(time.heatId);
    const heatNumber = heat ? heat.heat.toString() : "";

    return {
      time: time.duration ?? 0,
      imageUrl,
      playerName,
      teamName,
      heatNumber,
    };
  });
};

/**
 * Generates the chart and RPM data for the top times.
 * @param {Array} topTimes - The top times.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @param {Array} heats - The list of heats.
 * @returns {Array} The chart data with RPM.
 */
export const generateRPMData = (
  topTimes: TimeEntry[],
  players: Player[],
  teams: Team[],
  heats: Heat[],
): Array<{
  time: number;
  imageUrl: string;
  playerName: string;
  teamName: string;
  heatNumber: string;
  rpm: number;
}> => {
  const chartData = generateRankableData(topTimes, players, teams, heats);
  return chartData.map((data) => {
    const rpm = Number(calcRPM(data.time, REVOLUTIONS));
    return {
      ...data,
      rpm: rpm,
    };
  });
};

/**
 * Generates radar chart data with player or team information.
 * @param {number} playerOrTeamId - The ID of the player or team.
 * @param {Object} bestTimes - The best times for different time types.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @param {Array} timeTypes - The list of time types.
 * @param {boolean} isPlayer - Whether the ID belongs to a player or a team (default is true).
 * @returns {Object} The radar chart data including player/team name, fun fact, image URL, and radar data.
 */
export const generateRadarChartData = (
  playerOrTeamId: string,
  bestTimes: Record<string, number>,
  players: Player[],
  teams: Team[],
  timeTypes: string[],
  isPlayer: boolean = true,
  playerTeamAssociations?: PlayerTeamAssociations,
) => {
  const name = isPlayer
    ? getPlayerNameWithTeam(
        playerOrTeamId as Id<"players">,
        players,
        teams,
        playerTeamAssociations,
      )
    : getTeamName(playerOrTeamId as Id<"teams">, teams);
  const funFact = isPlayer
    ? getPlayerFunFact(playerOrTeamId as Id<"players">, players)
    : "";
  const imageUrl = isPlayer
    ? getPlayerImageWithFallback(
        playerOrTeamId as Id<"players">,
        players,
        teams,
        playerTeamAssociations,
      )
    : getTeamImageUrl(playerOrTeamId as Id<"teams">, teams);

  const timeToPercentage = (
    time: number,
    minTime: number,
    maxTime: number,
  ): number => {
    if (time <= 0) return 0;
    if (time <= minTime) return 100;
    if (time >= maxTime) return 0;
    return Math.round(100 - ((time - minTime) / (maxTime - minTime)) * 100);
  };

  const radarData = timeTypes.map((timeType) => {
    const time = bestTimes[timeType] || 0;
    const scaleKey = timeType.toUpperCase() as keyof typeof PERFORMANCE_SCALES;
    const minTime = PERFORMANCE_SCALES[scaleKey]?.min || 0;
    const maxTime = PERFORMANCE_SCALES[scaleKey]?.max || 100000;

    const timeInSeconds = milliToSecs(time, -1);
    if (typeof timeInSeconds !== "number") {
      console.error(
        `Invalid time for ${timeType}: ${timeInSeconds}. Expected a number.`,
      );
      return {
        subject: timeType,
        Performance: 0,
        fullMark: 100,
      };
    }
    const performance = timeToPercentage(timeInSeconds, minTime, maxTime);

    return {
      subject: timeType,
      Performance: performance,
      fullMark: 100,
    };
  });

  return {
    name: name,
    funFact,
    imageUrl,
    data: radarData,
  };
};
