// filepath: c:\projects\judge-it\src\utils\visualizationUtils.ts
import {
  timeToMilli,
  formatTime,
  calcTimeDifference,
  calcRPM,
  milliToSecs,
} from "./timeUtils";
import {
  getPlayerName,
  getHeatNumber,
  getTeamName,
  getPlayerImageUrl,
  getPlayerFunFact,
  getPlayer,
  getTeamImageUrl,
  getPlayerNameWithTeam,
  getPlayerImageWithFallback,
} from "./getUtils";
import { REVOLUTIONS, PERFORMANCE_SCALES } from "./constants";
import type { TimeLog, Heat, Player, TimeTypeKey, Team } from "../types";

/**
 * Filters and sorts time logs for a given year and time type.
 */
export const filterAndSortTimeLogs = (
  timeLogs: TimeLog[],
  heats: Heat[],
  selectedYear: number,
  timeTypeId: number
): TimeLog[] => {
  const heatsInYear = heats.filter(
    (heat) => new Date(heat.date).getFullYear() === selectedYear
  );
  const logsForHeats = [];
  for (let heat of heatsInYear) {
    const filteredTimeLogs = timeLogs.filter(
      (tl) => tl.heat_id === heat.id && tl.time_type_id === timeTypeId
    );
    logsForHeats.push(...filteredTimeLogs);
  }
  return logsForHeats.sort(
    (a, b) => timeToMilli(a.time || "") - timeToMilli(b.time || "")
  );
};

/**
 * Calculates the chug or sail times for the given logs.
 */
export const calculateTimes = (logsForHeatsSortByTime: TimeLog[]) => {
  const times: any[] = [];
  const endTimeIds = new Set<number>();
  for (let i = 0; i < logsForHeatsSortByTime.length; i++) {
    if (endTimeIds.has(i)) {
      continue;
    }
    const curLog = logsForHeatsSortByTime[i];
    const startTime = curLog.time || "";
    const playerId = curLog.player_id;
    const heatId = curLog.heat_id;
    const teamId = curLog.team_id || 0;
    const endTime = getEndTime(
      playerId,
      heatId,
      i,
      logsForHeatsSortByTime,
      endTimeIds
    );
    if (endTime === null) {
      continue;
    }
    const duration = calcTimeDifference(startTime, endTime);
    const formattedTime = formatTime(duration);
    times.push({ playerId, heatId, teamId, formattedTime, duration });
  }
  return times.sort((a, b) => a.duration - b.duration);
};

/**
 * Remove time entries which have same player ID.
 * @param {Array} timeEntries - The list of filtered time entries.
 * @returns {Array} The list of time entries without duplicates.
 */
export const removeDuplicateTimeEntriesAll = (timeEntries: any[]): any[] => {
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
export const removeDuplicateTimeEntries = (timeEntries: any[]): any[] => {
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
 * Get end time of a players activity in a heat.
 * @param {number} playerId - The player ID.
 * @param {number} heatId - The heat ID.
 * @param {number} startIdx - The start index of the given activity.
 * @param {Array} logsForHeatsSortByTime - The sorted time logs.
 * @param {Set} endTimeIds - The set of end time IDs.
 * @returns {string|null} The end time id or null if not found.
 */
export const getEndTime = (
  playerId: number,
  heatId: number,
  startIdx: number,
  logsForHeatsSortByTime: TimeLog[],
  endTimeIds: Set<number>
): string | null => {
  for (let i = startIdx + 1; i < logsForHeatsSortByTime.length; i++) {
    const curLog = logsForHeatsSortByTime[i];
    if (
      curLog.player_id === playerId &&
      curLog.heat_id === heatId &&
      !endTimeIds.has(i)
    ) {
      endTimeIds.add(i);
      return curLog.time || null;
    }
  }
  return null;
};

/**
 * Generates the chart data for the top times.
 * @param {Array} topTimes - The top times.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @param {Array} heats - The list of heats.
 * @returns {Array} The bar chart data.
 */
export const generateRankableData = (
  topTimes: any[],
  players: Player[],
  teams: any[],
  heats: Heat[]
): any[] => {
  return topTimes.map((time: any) => ({
    time: time.duration,
    imageUrl: getPlayerImageWithFallback(time.playerId, players, teams),
    playerName: getPlayerName(time.playerId, players),
    teamName: getTeamName(time.teamId, teams),
    heatNumber: getHeatNumber(time.heatId, heats),
  }));
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
  topTimes: any[],
  players: Player[],
  teams: any[],
  heats: Heat[]
): any[] => {
  const chartData = generateRankableData(topTimes, players, teams, heats);
  return chartData.map((data: any) => {
    const rpm = calcRPM(data.time, REVOLUTIONS);
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
  playerOrTeamId: number,
  bestTimes: Record<string, number>,
  players: Player[],
  teams: Team[],
  timeTypes: string[],
  isPlayer: boolean = true
) => {
  const name = isPlayer
    ? getPlayerNameWithTeam(playerOrTeamId, players, teams)
    : getTeamName(playerOrTeamId, teams);
  const funFact = isPlayer ? getPlayerFunFact(playerOrTeamId, players) : "";
  const imageUrl = isPlayer
    ? getPlayerImageWithFallback(playerOrTeamId, players, teams)
    : getTeamImageUrl(playerOrTeamId, teams);

  const timeToPercentage = (
    time: number,
    minTime: number,
    maxTime: number
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
        `Invalid time for ${timeType}: ${timeInSeconds}. Expected a number.`
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
