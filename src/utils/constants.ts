// filepath: c:\projects\judge-it\src\utils\constants.ts
import type { JudgeType, TimeTypeKey } from "../types";

/**
 * @constant {Array<string>} MEDAL_EMOJIS
 * @description Array of emojis representing medals for top 5 ranks.
 * The first three are gold, silver, and bronze medals, followed by the numbers 4 and 5.
 */
export const MEDAL_EMOJIS: string[] = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

/**
 * @constant {TimeTypeKey} TIME_TYPE_BEER
 * @description Constant representing the time type for beer.
 * This is used to filter and sort time logs related to beer chugging.
 */
export const TIME_TYPE_BEER: TimeTypeKey = "Beer";

/**
 * @constant {TimeTypeKey} TIME_TYPE_SAIL
 * @description Constant representing the time type for sailing.
 * This is used to filter and sort time logs related to sailing.
 */
export const TIME_TYPE_SAIL: TimeTypeKey = "Sail";

/**
 * @constant {TimeTypeKey} TIME_TYPE_SPIN
 * @description Constant representing the time type for spinning.
 * This is used to filter and sort time logs related to spinning.
 */
export const TIME_TYPE_SPIN: TimeTypeKey = "Spin";

/**
 * @constant {number} REVOLUTIONS
 * @description Constant representing the number of revolutions participants need to complete.
 * This is used to calculate RPM (Revolutions Per Minute) based on the time taken for these revolutions.
 */
export const REVOLUTIONS: number = 10;

/**
 * @constant {string} TIME_LOGS_TABLE
 * @description Constant representing the name of the time logs table in the database.
 * This is used for querying and inserting time logs related to participants' activities.
 */
export const TIME_LOGS_TABLE: string = "time_logs";

/**
 * @constant {string} TIME_TYPES_TABLE
 * @description Constant representing the name of the time types table in the database.
 * This is used for querying and managing different types of time logs.
 */
export const TIME_TYPES_TABLE: string = "time_types";

/**
 * @constant {string} TEAMS_TABLE
 * @description Constant representing the name of the teams table in the database.
 * This is used for querying and managing teams participating in the event.
 */
export const TEAMS_TABLE: string = "teams";

/**
 * @constant {string} PLAYERS_TABLE
 * @description Constant representing the name of the players table in the database.
 * This is used for querying and managing players participating in the event.
 */
export const PLAYERS_TABLE: string = "players";

/**
 * @constant {string} HEATS_TABLE
 * @description Constant representing the name of the heats table in the database.
 * This is used for querying and managing heats in the event.
 */
export const HEATS_TABLE: string = "heats";

/**
 * @constant {JudgeType} MAIN_JUDGE
 * @description Constant representing the main judge type.
 * This is used to identify the main judge in the event during heat start.
 */
export const MAIN_JUDGE: JudgeType = "main";

/**
 * @constant {JudgeType} PARTICIPANTS_JUDGE
 * @description Constant representing the participants judge type.
 * This is used to identify the judge placed on the participants' side.
 */
export const PARTICIPANTS_JUDGE: JudgeType = "participants";

/**
 * @constant {JudgeType} BEER_JUDGE
 * @description Constant representing the beer judge type.
 * This is used to identify the judge placed on the beer side.
 */
export const BEER_JUDGE: JudgeType = "beer";

/**
 * @constant {string} CAMPUSCUP_LIGHT_BLUE
 * @description Constant representing the light blue color used in the Campus Cup theme.
 * This is used for styling and branding purposes in the application.
 */
export const CAMPUSCUP_LIGHT_BLUE: string = "#093fbd";

/**
 * Performance scales for converting times to percentages for radar charts
 * Each activity has a min/max time range for meaningful comparison
 */
export const PERFORMANCE_SCALES = {
  BEER: { min: 2, max: 120 }, // 2 seconds (very fast) to 120 seconds (slow)
  SPIN: { min: 5, max: 60 }, // 5 seconds (very fast) to 60 seconds (slow)
  SAIL: { min: 10, max: 120 }, // 10 seconds (very fast) to 120 seconds (slow)
} as const;
