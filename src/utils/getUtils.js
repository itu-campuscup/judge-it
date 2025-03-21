/**
 * Gets the player name given the player ID.
 * @param {number} id - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player name.
 */
export const getPlayerNameGivenId = (id, players) => {
  const player = players.find(p => p.id === id);
  return player ? player.name : '';
};

/**
 * Gets the heat number given the heat ID.
 * @param {number} id - The heat ID.
 * @param {Array} heats - The list of heats.
 * @returns {string} The heat number.
 */
export const getHeatNumberGivenId = (id, heats) => {
  const heat = heats.find(h => h.id === id);
  return heat ? heat.heat : '';
};

/**
 * Gets the team name given the team ID.
 * @param {number} id - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {string} The team name.
 */
export const getTeamNameGivenId = (id, teams) => {
  const team = teams.find(t => t.id === id);
  return team ? team.name : '';
};

/**
 * Gets the player image URL given the player ID.
 * @param {number} id - The player ID.
 * @param {Array} players - The list of players.
 * @returns {string} The player image URL.
 */
export const getPlayerImageGivenPlayerId = (id, players) => {
  const player = players.find(p => p.id === id);
  return player ? player.image_url : '';
};
