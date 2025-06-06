import {
  timeToMilli,
  formatTime,
  calcTimeDifference,
  calcRPM,
} from "./timeUtils";
import {
  getPlayerName,
  getHeatNumber,
  getTeamName,
  getPlayerImage,
  getPlayerFunFact,
  getPlayer,
} from "./getUtils";
import { REVOLUTIONS } from "./constants";

/**
 * Filters and sorts time logs for a given year and time type.
 * @param {Array} timeLogs - The list of time logs.
 * @param {Array} heats - The list of heats.
 * @param {number} selectedYear - The selected year.
 * @param {number} timeTypeId - The time type ID.
 * @returns {Array} The sorted time logs for the selected year and time type.
 */
export const filterAndSortTimeLogs = (
  timeLogs,
  heats,
  selectedYear,
  timeTypeId
) => {
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
  return logsForHeats.sort((a, b) => timeToMilli(a.time) - timeToMilli(b.time));
};

/**
 * Calculates the chug or sail times for the given logs.
 * @param {Array} logsForHeatsSortByTime - The sorted time logs.
 * @returns {Array} The calculated times.
 */
export const calculateTimes = (logsForHeatsSortByTime) => {
  const times = [];
  const endTimeIds = new Set();
  for (let i = 0; i < logsForHeatsSortByTime.length; i++) {
    if (endTimeIds.has(i)) {
      continue;
    }
    const curLog = logsForHeatsSortByTime[i];
    const startTime = curLog.time;
    const playerId = curLog.player_id;
    const heatId = curLog.heat_id;
    const teamId = curLog.team_id;
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
 * @description Maintains
 */
export const removeDuplicateTimeEntries = (timeEntries) => {
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
  playerId,
  heatId,
  startIdx,
  logsForHeatsSortByTime,
  endTimeIds
) => {
  for (let i = startIdx + 1; i < logsForHeatsSortByTime.length; i++) {
    const curLog = logsForHeatsSortByTime[i];
    if (
      curLog.player_id === playerId &&
      curLog.heat_id === heatId &&
      !endTimeIds.has(i)
    ) {
      endTimeIds.add(i);
      return curLog.time;
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
export const generateRankableData = (topTimes, players, teams, heats) => {
  return topTimes.map((time) => ({
    time: time.duration,
    imageUrl: getPlayerImage(time.playerId, players),
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
export const generateRPMData = (topTimes, players, teams, heats) => {
  const chartData = generateRankableData(topTimes, players, teams, heats);
  return chartData.map((data) => {
    const rpm = calcRPM(data.time);
    return {
      ...data,
      rpm: rpm,
    };
  });
};

/**
 * Generates radar chart data with player information including images and team names.
 * @param {number} playerId - The player ID.
 * @param {Object} bestTimes - Object containing best times for each activity type.
 * @param {Array} players - The list of players.
 * @param {Object} performanceScales - Performance scale constants for each activity.
 * @param {Array} timeTypes - Available time type constants.
 * @returns {Object} The radar chart data including player name, fun fact, image URL, and performance data.
 */
export const generateRadarChartData = (
  playerId,
  bestTimes,
  players,
  performanceScales,
  timeTypes
) => {
  const playerName = getPlayerName(playerId, players);
  const funFact = getPlayerFunFact(playerId, players);
  const imageUrl = getPlayerImage(playerId, players);

  const timeToPercentage = (time, minTime, maxTime) => {
    if (time <= 0) return 0;
    if (time <= minTime) return 100;
    if (time >= maxTime) return 0;
    return Math.round(100 - ((time - minTime) / (maxTime - minTime)) * 100);
  };

  const radarData = timeTypes.map((timeType) => ({
    subject: timeType,
    Performance: timeToPercentage(
      bestTimes[timeType] || 0,
      performanceScales[timeType.toUpperCase()]?.MIN_TIME || 0,
      performanceScales[timeType.toUpperCase()]?.MAX_TIME || 100000
    ),
    fullMark: 100,
  }));

  return {
    playerName,
    funFact,
    imageUrl,
    data: radarData,
  };
};
