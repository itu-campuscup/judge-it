import { timeToMilli, formatTime, calcTimeDifference } from './timeUtils';
import { getPlayerNameGivenId, getHeatNumberGivenId, getTeamNameGivenId, getPlayerImageGivenPlayerId } from './getUtils';

/**
 * Filters and sorts time logs for a given year and time type.
 * @param {Array} timeLogs - The list of time logs.
 * @param {Array} heats - The list of heats.
 * @param {number} selectedYear - The selected year.
 * @param {number} timeTypeId - The time type ID.
 * @returns {Array} The sorted time logs for the selected year and time type.
 */
export const filterAndSortTimeLogs = (timeLogs, heats, selectedYear, timeTypeId) => {
  const heatsInYear = heats.filter(heat => new Date(heat.date).getFullYear() === selectedYear);
  const logsForHeats = [];
  for (let heat of heatsInYear) {
    const filteredTimeLogs = timeLogs.filter(tl => tl.heat_id === heat.id && tl.time_type_id === timeTypeId);
    logsForHeats.push(...filteredTimeLogs);
  }
  return logsForHeats.sort((a, b) => timeToMilli(a.time) - timeToMilli(b.time));
};

/**
 * Calculates the chug or sail times for the given logs.
 * @param {Array} logsForHeatsSortByTime - The sorted time logs.
 * @param {Function} getEndTime - The function to get the end time for a log.
 * @returns {Array} The calculated times.
 */
export const calculateTimes = (logsForHeatsSortByTime, getEndTime) => {
  const times = [];
  const endTimeIds = new Set();
  for (let i = 0; i < logsForHeatsSortByTime.length; i++) {
    if (endTimeIds.has(i)) { continue; }
    const curLog = logsForHeatsSortByTime[i];
    const startTime = curLog.time;
    const playerId = curLog.player_id;
    const heatId = curLog.heat_id;
    const teamId = curLog.team_id;
    const endTime = getEndTime(playerId, heatId, i, logsForHeatsSortByTime, endTimeIds);
    if (endTime === null) { continue; }
    const duration = calcTimeDifference(startTime, endTime);
    const formattedTime = formatTime(duration);
    times.push({ playerId, heatId, teamId, formattedTime, duration });
  }
  return times.sort((a, b) => a.duration - b.duration);
};

/**
 * Generates the bar chart data for the top times.
 * @param {Array} topTimes - The top times.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @param {Array} heats - The list of heats.
 * @returns {Array} The bar chart data.
 */
export const generateBarChartData = (topTimes, players, teams, heats) => {
  return topTimes.map(time => ({
    time: time.duration,
    imageUrl: getPlayerImageGivenPlayerId(time.playerId, players),
    playerName: getPlayerNameGivenId(time.playerId, players),
    teamName: getTeamNameGivenId(time.teamId, teams),
    heatNumber: getHeatNumberGivenId(time.heatId, heats),
  }));
};
