/**
 * @constant {Array} MEDAL_EMOJIS
 * @description Array of emojis representing medals for top 5 ranks.
 * The first three are gold, silver, and bronze medals, followed by the numbers 4 and 5.
 */
export const MEDAL_EMOJIS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

/**
 * @constant {string} TIME_TYPE_BEER
 * @description Constant representing the time type for beer.
 * This is used to filter and sort time logs related to beer chugging.
 */
export const TIME_TYPE_BEER = "Beer";

/**
 * @constant {string} TIME_TYPE_SAIL
 * @description Constant representing the time type for sailing.
 * This is used to filter and sort time logs related to sailing.
 */
export const TIME_TYPE_SAIL = "Sail";

/**
 * @constant {string} TIME_TYPE_SPIN
 * @description Constant representing the time type for spinning.
 * This is used to filter and sort time logs related to spinning.
 */
export const TIME_TYPE_SPIN = "Spin";

/**
 * @constant {number} REVOLUTIONS
 * @description Constant representing the number of revolutions participants need to complete.
 * This is used to calculate RPM (Revolutions Per Minute) based on the time taken for these revolutions.
 */
export const REVOLUTIONS = 10;

/**
 * @constant {string} TIME_LOGS_TABLE
 * @description Constant representing the name of the time logs table in the database.
 * This is used for querying and inserting time logs related to participants' activities.
 */
export const TIME_LOGS_TABLE = "time_logs";

/**
 * @constant {string} TIME_TYPES_TABLE
 * @description Constant representing the name of the time types table in the database.
 * This is used for querying and managing different types of time logs.
 */
export const TIME_TYPES_TABLE = "time_types";

/**
 * @constant {string} TEAMS_TABLE
 * @description Constant representing the name of the teams table in the database.
 * This is used for querying and managing teams participating in the event.
 */
export const TEAMS_TABLE = "teams";

/**
 * @constant {string} PLAYERS_TABLE
 * @description Constant representing the name of the players table in the database.
 * This is used for querying and managing players participating in the event.
 */
export const PLAYERS_TABLE = "players";

/**
 * @constant {string} HEATS_TABLE
 * @description Constant representing the name of the heats table in the database.
 * This is used for querying and managing heats in the event.
 */
export const HEATS_TABLE = "heats";

/**
 * @constant {string} MAIN_JUDGE
 * @description Constant representing the main judge type.
 * This is used to identify the main judge in the event during heat start.
 */
export const MAIN_JUDGE = "main";

/**
 * @constant {string} PARTICIPANTS_JUDGE
 * @description Constant representing the participants judge type.
 * This is used to identify the judge placed on the participants' side.
 */
export const PARTICIPANTS_JUDGE = "participants";

/**
 * @constant {string} BEER_JUDGE
 * @description Constant representing the beer judge type.
 * This is used to identify the judge placed on the beer side.
 */
export const BEER_JUDGE = "beer";

/**
 * @constant {string} CAMPUSCUP_LIGHT_BLUE
 * @description Constant representing the light blue color used in the Campus Cup theme.
 * This is used for styling and branding purposes in the application.
 */
export const CAMPUSCUP_LIGHT_BLUE = "#093fbd";
