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

/**
 * Gets the current still active teams.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of active teams.
 */
export const getActiveTeams = (teams) => {
  return teams.filter(t => t.is_out === false);
};

/**
 * Get player given the player ID.
 * @param {number} id - The player ID.
 * @param {Array} players - The list of players.
 * @returns {Object} The player.
 */
export const getPlayerGivenId = (id, players) => {
  return players.find(p => p.id === id);
};

/**
 * Gets the players given the team ID.
 * @param {number} id - The team ID.
 * @param {Array} teams - The list of teams.
 * @returns {Array} The list of players.
 */
export const getPlayerIdsGivenTeamId = (id, teams) => {
  const team = teams.filter(t => t.id === id)[0];
  return [team.player_1_id, team.player_2_id, team.player_3_id, team.player_4_id].filter(id => id !== null && id !== undefined);
};

/**
 * Get current heat given the context.
 * @param {Object} supabase - The Supabase object.
 * @param {Object} alert - The alert object.
 * @returns {Object} The current heat.
 */
export const getCurrentHeatGivenCtx = async (supabase, alert) => {
  const { data, error } = await supabase
    .from('heats')
    .select('*')
    .eq('is_current', true);
    
  if (error) {
    const err = 'Error fetching current heat: ' + error.message;
    alert.setOpen(true);
    alert.setSeverity('error');
    alert.setText(err);
    console.error(err);
  }
  return data[0];
};
