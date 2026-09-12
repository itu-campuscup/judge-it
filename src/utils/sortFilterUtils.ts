import { Id } from "convex/_generated/dataModel";
import { timeToMilli } from "./timeUtils";
import type { TimeLog } from "@/types";

/**
 * Filters time logs by player ID
 * @param {Array} timeLogs - The list of time logs.
 * @param {Id<"players">} playerId - The player ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByPlayerId = (
  timeLogs: TimeLog[],
  playerId: Id<"players">,
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.player_id === playerId);
};

/**
 * Filters time logs by team ID
 * @param {Array} timeLogs - The list of time logs.
 * @param {Id<"teams">} teamId - The team ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByTeamId = (
  timeLogs: TimeLog[],
  teamId: Id<"teams">,
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.team_id === teamId);
};

/**
 * Sorts time logs by heat ID in ascending order.
 * Note: Returns a new array to avoid in-place mutation.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by heat ID.
 */
export const sortTimeLogsByHeat = (timeLogs: TimeLog[]): TimeLog[] => {
  return [...timeLogs].sort((a: TimeLog, b: TimeLog) => {
    const aHeat = String(a.heat_id ?? "");
    const bHeat = String(b.heat_id ?? "");
    // Performance Optimization: Use direct comparison for non-locale-sensitive IDs
    return aHeat < bHeat ? -1 : aHeat > bHeat ? 1 : 0;
  });
};

/**
 * Sorts time logs by time in ascending order.
 * Note: Returns a new array to avoid in-place mutation.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by time in ascending order.
 */
export const sortTimeLogsByTime = (timeLogs: TimeLog[]): TimeLog[] => {
  return [...timeLogs].sort(
    (a: TimeLog, b: TimeLog) =>
      timeToMilli(a.time || "") - timeToMilli(b.time || ""),
  );
};

/**
 * Performance Optimization: Sorts time logs by heat ID then by time in a single pass.
 * This replaces redundant double-sorts in statistics components.
 * Note: Returns a new array to avoid in-place mutation.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs.
 */
export const sortTimeLogsByHeatAndTime = (timeLogs: TimeLog[]): TimeLog[] => {
  return [...timeLogs].sort((a: TimeLog, b: TimeLog) => {
    const aHeat = String(a.heat_id ?? "");
    const bHeat = String(b.heat_id ?? "");

    // Performance Optimization: Use direct comparison for non-locale-sensitive IDs
    if (aHeat < bHeat) return -1;
    if (aHeat > bHeat) return 1;

    return timeToMilli(a.time || "") - timeToMilli(b.time || "");
  });
};

/**
 * Filters time logs by Time Type Id
 * @param {Array} timeLogs - The list of time logs.
 * @param {Id<"time_types">} timeTypeId - The Time Type ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByTimeType = (
  timeLogs: TimeLog[],
  timeTypeId: Id<"time_types">,
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.time_type_id === timeTypeId);
};

/**
 * Splits time logs into separate arrays based on heat ID.
 * Performance Optimization: Replaced O(N^2) nested loop logic with an O(N) Map grouping.
 * Eliminates duplicate tail group creation and drastically speeds up intra-heat statistics calculations.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} An array of arrays, where each sub-array contains logs for a specific heat.
 */
export const splitTimeLogsPerHeat = (timeLogs: TimeLog[]): TimeLog[][] => {
  if (timeLogs.length === 0) return [];

  const heatMap = new Map<string, TimeLog[]>();
  for (const log of timeLogs) {
    const heatId = String(log.heat_id ?? "");
    let group = heatMap.get(heatId);
    if (!group) {
      group = [];
      heatMap.set(heatId, group);
    }
    group.push(log);
  }

  return Array.from(heatMap.values());
};

/**
 * Filters time logs by heat ID.
 * Accepts Convex `Id<"heats">` or plain string for compatibility.
 * @param {Array} timeLogs - The list of time logs.
 * @param {Id<"heats">} heatId - The heat ID to filter by.
 * @returns {Array} The filtered time logs for the specified heat ID.
 */
export const filterTimeLogsByHeatId = (
  timeLogs: TimeLog[],
  heatId: Id<"heats">,
): TimeLog[] => {
  return timeLogs.filter((log: TimeLog) => log.heat_id === heatId);
};
