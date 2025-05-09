/**
 * Converts a time string to milliseconds.
 * @param {string} time - The time string in the format "HH:MM:SS.mmm".
 * @returns {number} The time in milliseconds.
 */
export const timeToMilli = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const [secs, millis] = seconds.split('.');
  const millisValue = parseInt(millis ? millis.substring(0, 3) : '0');
  return (parseInt(hours) * 60 * 60 * 1000) + (parseInt(minutes) * 60 * 1000) + (parseInt(secs) * 1000) + millisValue;
};

/**
 * Converts a time in milliseconds to seconds and rounds it down to the nearest integer.
 * @param {number} time - The time in milliseconds.
 * @returns {number} The time in seconds.
 */
export const milliToSecs = (time) => { return Math.floor(time / 1000); };

/**
 * Formats a time in milliseconds to a string in the format "MM:SS.mmm".
 * @param {number} time - The time in milliseconds.
 * @returns {string} The formatted time string.
 */
export const formatTime = (time) => {
  const ct = time / 1000;
  const minutes = Math.floor(ct / 60);
  const seconds = Math.floor(ct % 60);
  const milliseconds = Math.floor((ct % 1) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
};

/**
 * Calculates the time difference between two time strings.
 * @param {string} startTime - The start time string in the format "HH:MM:SS.mmm".
 * @param {string} endTime - The end time string in the format "HH:MM:SS.mmm".
 * @returns {number} The time difference in milliseconds.
 */
export const calcTimeDifference = (startTime, endTime) => {
  const start = timeToMilli(startTime);
  const end = timeToMilli(endTime);
  return end - start;
};

/**
 * Gives the unique years given an array of heats.
 * @param {Array} heats - The array of heats.
 * @returns {Array} The unique years.
 */
export const getUniqueYearsGivenHeats = (heats) => {
  // return [...new Set(heats.map(heat => new Date(heats.date).getFullYear()))];
  return [...new Set(heats.map(heat => new Date(heat.date).getFullYear()))];
};
