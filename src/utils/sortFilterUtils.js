import { timeToMilli } from "./timeUtils";

/**
 * Filters time logs by player ID
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} playerId - The player ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByPlayerId = (timeLogs, playerId) => {
  return timeLogs.filter((log) => log.player_id === playerId);
};

/**
 * Sorts time logs by heat ID.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by heat ID.
 */
export const sortTimeLogsByHeat = (timeLogs) => {
  return timeLogs.sort((a, b) => a.heat_id - b.heat_id);
};

/**
 * Sorts time logs by time.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} The sorted time logs by time.
 */
export const sortTimeLogsByTime = (timeLogs) => {
  return timeLogs.sort((a, b) => timeToMilli(a.time) - timeToMilli(b.time));
};

/**
 * Filters time logs by Time Type Id
 * @param {Array} timeLogs - The list of time logs.
 * @param {number} timeTypeId - The time type ID to filter by.
 * @returns {Array} The filtered time logs.
 */
export const filterTimeLogsByTimeType = (timeLogs, timeTypeId) => {
  return timeLogs.filter((log) => log.time_type_id === timeTypeId);
};

/**
 * Splits time logs into separate arrays based on heat ID.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {Array} An array of arrays, where each sub-array contains logs for a specific heat.
 */
export const splitTimeLogsPerHeat = (timeLogs) => {
  const heatSplitLogs = [];

  for (let i = 0; i < timeLogs.length; i++) {
    const lst = [];
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
