import { timeToMilli } from "./timeUtils";
import type { TimeLog } from "@/types";

/**
 * Filters time logs by player ID
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} playerId - The player ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByPlayerId = (
  timeLogs: TimeLog[],
  playerId: number
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.player_id === playerId);
};

/**
 * Filters time logs by team ID
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} teamId - The team ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByTeamId = (
  timeLogs: TimeLog[],
  teamId: number
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.team_id === teamId);
};

/**
 * Sorts time logs by heat ID in ascending order.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by heat ID.
 */
export const sortTimeLogsByHeat = (timeLogs: TimeLog[]): TimeLog[] => {
  return timeLogs.sort((a: TimeLog, b: TimeLog) => a.heat_id - b.heat_id);
};

/**
 * Sorts time logs by time in ascending order.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by time in ascending order.
 */
export const sortTimeLogsByTime = (timeLogs: TimeLog[]): TimeLog[] => {
  return timeLogs.sort(
    (a: TimeLog, b: TimeLog) =>
      timeToMilli(a.time || "") - timeToMilli(b.time || "")
  );
};

/**
 * Filters time logs by Time Type Id
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} timeTypeId - The time type ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByTimeType = (
  timeLogs: TimeLog[],
  timeTypeId: number
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.time_type_id === timeTypeId);
};

/**
 * Splits time logs into separate arrays based on heat ID.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} An array of arrays, where each sub-array contains logs for a specific heat.
 */
export const splitTimeLogsPerHeat = (timeLogs: TimeLog[]): TimeLog[][] => {
  const heatSplitLogs: TimeLog[][] = [];

  for (let i = 0; i < timeLogs.length; i++) {
    const lst: TimeLog[] = [];
    const heatId = timeLogs[i].heat_id;
    for (let j = i; j < timeLogs.length; j++) {
      if (timeLogs[j].heat_id === heatId) {
        lst.push(timeLogs[j]);
      } else {
        i = j - 1;
        break;
      }
    }
    heatSplitLogs.push(lst);
  }

  return heatSplitLogs;
};

/**
 * Filters time logs by heat ID.
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} heatId - The heat ID to filter by.
 * @returns {Array} The filtered time logs for the specified heat ID.
 */
export const filterTimeLogsByHeatId = (
  timeLogs: TimeLog[],
  heatId: number
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.heat_id === heatId);
};
