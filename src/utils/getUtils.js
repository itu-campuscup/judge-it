import { HEATS_TABLE, TIME_TYPES_TABLE } from "./constants";
import { supabase } from "@/SupabaseClient";

/**
 * Gets the player name given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player name.
 */
export const getPlayerName = (playerId, players) => {
  if (typeof playerId !== "number") playerId = parseInt(playerId);
  const player = players.find((p) => p.id === playerId);
  return player ? player.name : "";
};

/**
 * Gets the heat number given the heat ID.
 * @param {number} heatId - The heat ID.
 * @param {Array} heats - The list of heats.
 * @returns {string} The heat number.
 */
export const getHeatNumber = (heatId, heats) => {
  const heat = heats.find((h) => h.id === heatId);
  return heat ? heat.heat : "";
};

/**
 * Gets the team name given the team ID.
 * @param {number} teamId - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {string} The team name.
 */
export const getTeamName = (teamId, teams) => {
  const team = teams.find((t) => t.id === teamId);
  return team ? team.name : "";
};

/**
 * Gets the player image URL given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player image URL.
 */
export const getPlayerImage = (playerId, players) => {
  const player = players.find((p) => p.id === playerId);
  return player ? player.image_url : "";
};

/**
 * Gets the current still active teams.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of active teams.
 */
export const getActiveTeams = (teams) => {
  return teams.filter((t) => t.is_out === false);
};

/**
 * Get player given the player ID.
 * @param {number} playerId - The player ID.
 * @param {Array} players - The list of players.
 * @returns {Object} The player.
 */
export const getPlayer = (playerId, players) => {
  return players.find((p) => p.id === playerId);
};

/**
 * Gets the players given the team ID.
 * @param {number} teamId - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of players.
 */
export const getTeamPlayerIds = (teamId, teams) => {
  const team = teams.filter((t) => t.id === teamId)[0];
  return [
    team.player_1_id,
    team.player_2_id,
    team.player_3_id,
    team.player_4_id,
  ].filter((id) => id !== null && id !== undefined);
};

/**
 * Get current heat
 * @param {Object} alert - The alert object to set error messages (optional).
 * @returns {Object} The current heat.
 */
export const getCurrentHeat = async (alert) => {
  const { data, error } = await supabase
    .from(HEATS_TABLE)
    .select("*")
    .eq("is_current", true);

  if (error) {
    const err = "Error fetching current heat: " + error.message;
    console.error(err);
    if (!alert) {
      return data[0];
    }
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText(err);
  }
  return data[0];
};

/**
 * Get the previous player given the team ID and heat ID.
 * @param {number} teamId - The team ID.
 * @param {Object} heat - The heat object.
 * @param {Array} timeLogs - The list of time logs.
 * @returns {number|string} The previous player ID or a message if not found.
 */
export const getPrevPlayerId = (teamId, heat, timeLogs) => {
  const prevNotFound = '"No previous player"';
  if ((!teamId, !heat, !timeLogs)) return prevNotFound;

  const logs = timeLogs.filter(
    (e) => e.team_id == teamId && e.heat_id == heat.id
  );
  const sortedByTimeDesc = logs.sort((a, b) => {
    if (a.time < b.time) return 1;
    if (a.time > b.time) return -1;
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
 * @returns {Object} The time type object.
 */
export const getTimeType = (timeTypeString, timeTypes) => {
  console.log("timeTypeString: ", timeTypeString);
  console.log("timeTypes: ", timeTypes);
  console.log("Result: ", timeTypes.find((e) => e.time_eng === timeTypeString));
  return timeTypes.find((e) => e.time_eng === timeTypeString);
};
