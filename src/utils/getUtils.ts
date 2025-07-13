import {
  HEATS_TABLE,
  TIME_TYPE_BEER,
  TIME_TYPE_SAIL,
  TIME_TYPE_SPIN,
} from "./constants";
import {
  calculateTimes,
  removeDuplicateTimeEntries,
} from "./visualizationUtils";
import { splitTimeLogsPerHeat } from "./sortFilterUtils";
import { supabase } from "@/SupabaseClient";
import type { Player, Heat, Team, TimeType, TimeLog } from "@/types";

/**
 * Gets the player name given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player name.
 */
export const getPlayerName = (
  playerId: number | string,
  players: Player[]
): string => {
  if (typeof playerId !== "number") playerId = parseInt(playerId);
  const player = players.find((p) => p.id === playerId);
  return player ? player.name : "";
};

/**
 * Gets the player name with team name given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @param {Array} teams - The list of teams.
 * @returns {string} The player name - team name.
 */
export const getPlayerNameWithTeam = (
  playerId: number | string,
  players: Player[],
  teams: Team[]
): string => {
  if (typeof playerId !== "number") playerId = parseInt(playerId);
  const player = players.find((p) => p.id === playerId);
  const team = getPlayerTeam(playerId, teams)
  return player && team ? `${player.name} - ${team.name}` : "";
}

/**
 * Gets the heat number given the heat ID.
 * @param {number} heatId - The heat ID.
 * @param {Array} heats - The list of heats.
 * @returns {string} The heat number.
 */
export const getHeatNumber = (heatId: number, heats: Heat[]): string => {
  const heat = heats.find((h: Heat) => h.id === heatId);
  return heat ? heat.heat.toString() : "";
};

/**
 * Gets the team name given the team ID.
 * @param {number} teamId - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {string} The team name.
 */
export const getTeamName = (teamId: number, teams: Team[]): string => {
  const team = teams.find((t: Team) => t.id === teamId);
  return team ? team.name : "";
};

/**
 * Gets the player image URL given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player image URL.
 */
export const getPlayerImageUrl = (
  playerId: number,
  players: Player[]
): string => {
  const player = players.find((p: Player) => p.id === playerId);
  return player?.image_url || "";
};

/**
 * Gets the team image URL given the team ID.
 * @param {number} teamId - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {string} The team image URL.
 */
export const getTeamImageUrl = (teamId: number, teams: Team[]): string => {
  const team = teams.find((t: Team) => t.id === teamId);
  return team?.image_url || "";
};

/**
 * Gets the current still active teams.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of active teams.
 */
export const getActiveTeams = (teams: Team[]): Team[] => {
  return teams.filter((t: Team) => t.is_out === false);
};

/**
 * Get player given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {Object} The player.
 */
export const getPlayer = (
  playerId: number,
  players: Player[]
): Player | undefined => {
  return players.find((p: Player) => p.id === playerId);
};

/**
 * Gets the players given the team ID.
 * @param {number} teamId - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of player IDs in the team.
 */
export const getTeamPlayerIds = (
  teamId: number | string,
  teams: Team[]
): number[] => {
  const team = teams.filter((t: Team) => t.id === Number(teamId))[0];
  if (!team) return [];
  return [
    team.player_1_id,
    team.player_2_id,
    team.player_3_id,
    team.player_4_id,
  ].filter((id) => id !== null && id !== undefined) as number[];
};

/**
 * Get current heat
 * @param {Object} alert - The alert object to set error messages (optional).
 * @returns {Object} The current heat.
 */
export const getCurrentHeat = async (alert?: any): Promise<Heat | null> => {
  const { data, error } = await supabase
    .from(HEATS_TABLE)
    .select("*")
    .eq("is_current", true);

  if (error) {
    const err = "Error fetching current heat: " + error.message;
    console.error(err);
    if (!alert) {
      return data?.[0] || null;
    }
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText(err);
  }
  return data?.[0] || null;
};

/**
 * Get the previous player given the team ID and heat ID.
 * @param {number} teamId - The team ID.
 * @param {Object} heat - The heat object.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {number|string} The previous player ID or a message if not found.
 */
export const getPrevPlayerId = (
  teamId: number,
  heat: Heat,
  timeLogs: TimeLog[]
): number | string => {
  const prevNotFound = '"No previous player"';
  if (!teamId || !heat || !timeLogs) return prevNotFound;

  const logs = timeLogs.filter(
    (e: TimeLog) => e.team_id == teamId && e.heat_id == heat.id
  );
  const sortedByTimeDesc = logs.sort((a: TimeLog, b: TimeLog) => {
    const aTime = a.time || "";
    const bTime = b.time || "";
    if (aTime < bTime) return 1;
    if (aTime > bTime) return -1;
    return 0;
  });

  const prevPlayer = !sortedByTimeDesc[0]
    ? prevNotFound
    : sortedByTimeDesc[0].player_id;

  return prevPlayer;
};

/**
 * Get the time type given the time type string.
 * @param {string} timeTypeString - The time type string.
 * @param {Array} timeTypes - The list of time types.
 * @returns {Object|undefined} The time type object or undefined if not found.
 */
export const getTimeType = (
  timeTypeString: string,
  timeTypes: TimeType[]
): TimeType | undefined => {
  return timeTypes.find((e: TimeType) => e.time_eng === timeTypeString);
};

/**
 * Get the time type for beer.
 * @param {Array} timeTypes - The list of time types.
 * @returns {Object|undefined} The time type object for beer or undefined if not found.
 */
export const getTimeTypeBeer = (
  timeTypes: TimeType[]
): TimeType | undefined => {
  return getTimeType(TIME_TYPE_BEER, timeTypes);
};

/**
 * Get the time type for spin.
 * @param {Array} timeTypes - The list of time types.
 * @returns {Object|undefined} The time type object for spin or undefined if not found.
 */
export const getTimeTypeSpinner = (
  timeTypes: TimeType[]
): TimeType | undefined => {
  return getTimeType(TIME_TYPE_SPIN, timeTypes);
};

/**
 * Get the time type for sail.
 * @param {Array} timeTypes - The list of time types.
 * @returns {Object|undefined} The time type object for sail or undefined if not found.
 */
export const getTimeTypeSail = (
  timeTypes: TimeType[]
): TimeType | undefined => {
  return getTimeType(TIME_TYPE_SAIL, timeTypes);
};

/**
 * Get the time type Id given the time type string.
 * @param {string} timeTypeString - The time type string.
 * @param {Array} timeTypes - The list of time types.
 * @return {number|null} The time type ID or null if not found.
 */
export const getTimeTypeId = (
  timeTypeString: string,
  timeTypes: TimeType[]
): number | null => {
  return getTimeType(timeTypeString, timeTypes)?.id || null;
};

/**
 * Get the best intra-heat time from the time logs.
 * @param {Array} timeLogs - The list of time logs. It should be sorted by heat and time as well as only contain a single contestant.
 * @return {Object|null} The best time object or null if multiple contestants are present or no valid time is found.
 */
export const getBestIntraHeatTime = (timeLogs: TimeLog[]): any => {
  const splitTimeLogs = splitTimeLogsPerHeat(timeLogs);

  var bestTime = { duration: 10 ** 1000 }; // Equivalent to Infinity

  splitTimeLogs.forEach((heatTimes) => {
    const times = calculateTimes(heatTimes);
    const topTime = removeDuplicateTimeEntries(times)[0]; // As a single contestant, we can just take the first time

    if (topTime && topTime.duration && topTime.duration < bestTime.duration) {
      bestTime = topTime;
    }
  });

  return bestTime.duration < 10 ** 1000 ? bestTime : null;
};

/**
 * Get the fun fact of a player given their ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string|null} - The fun fact of the player or null if not found.
 */
export const getPlayerFunFact = (
  playerId: number,
  players: Player[]
): string | null => {
  const player = players.find((p: Player) => p.id === playerId);
  return player?.fun_fact || null;
};

/**
 * Gets the team for a player given their ID
 * @param playerId - The player ID
 * @param teams - The list of teams.
 * @returns {Team|null} - The team for the player or null if not found.
 */
export const getPlayerTeam = (
  playerId: number | string,
  teams: Team[]
): Team | null => {
  const team = teams.find((t: Team) =>
    t.player_1_id === playerId ||
    t.player_2_id === playerId ||
    t.player_3_id === playerId ||
    t.player_4_id === playerId
  )
  return team ? team : null
}