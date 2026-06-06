import { REVOLUTIONS } from "./constants";
import type { Heat } from "../types";

/**
 * Converts a time string to milliseconds.
 * Performance Optimization: Replaced split() with indexOf/substring to avoid unnecessary array allocations.
 * @param {string} time - The time string in the format "HH:MM:SS.mmm".
 * @returns {number} The time in milliseconds.
 */
export const timeToMilli = (time: string): number => {
  if (!time) return 0;

  const hEnd = time.indexOf(":");
  if (hEnd === -1) return 0;
  const mEnd = time.indexOf(":", hEnd + 1);
  if (mEnd === -1) return 0;
  const sEnd = time.indexOf(".", mEnd + 1);

  const hours = parseInt(time.substring(0, hEnd), 10);
  const minutes = parseInt(time.substring(hEnd + 1, mEnd), 10);
  const seconds = parseInt(
    time.substring(mEnd + 1, sEnd === -1 ? time.length : sEnd),
    10,
  );
  const millis =
    sEnd === -1 ? 0 : parseInt(time.substring(sEnd + 1, sEnd + 4), 10);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis;
};

/**
 * Converts a time in milliseconds to seconds and rounds it down to the nearest integer.
 * @param {number} time - The time in milliseconds.
 * @param {number | undefined} fixed - The number of decimal places to round to. If -1 or undefined, returns the actual time.
 * @returns {number | string} The time in seconds as number (if fixed is -1) or string (if fixed >= 0).
 */
export const milliToSecs = (
  time: number,
  fixed: undefined | number,
): number | string => {
  const actualTime = time / 1000;
  if (fixed === -1 || fixed === undefined) {
    return actualTime;
  }
  return fixed < 0 ? Math.floor(actualTime) : actualTime.toFixed(fixed);
};

/**
 * Converts time in milliseconds to RPM.
 * @param {number} time - The time in milliseconds.
 * @param {number} fixed - The number of decimal places to round to. If -1 or undefined, returns the actual RPM.
 * @returns {number | string} The RPM as number (if fixed is -1) or string (if fixed >= 0).
 */
export const calcRPM = (time: number, fixed: number): number | string => {
  const actualRPM = (REVOLUTIONS / (milliToSecs(time, -1) as number)) * 60;
  if (fixed === -1 || fixed === undefined) {
    return actualRPM;
  }
  return fixed < 0 ? Math.floor(actualRPM) : actualRPM.toFixed(fixed);
};

/**
 * Formats a time in milliseconds to a string in the format "MM:SS.mmm".
 * @param {number} time - The time in milliseconds.
 * @returns {string} The formatted time string.
 */
export const formatTime = (time: number): string => {
  const ct = time / 1000;
  const minutes = Math.floor(ct / 60);
  const seconds = Math.floor(ct % 60);
  const milliseconds = Math.floor((ct % 1) * 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}:${String(milliseconds).padStart(3, "0")}`;
};

/**
 * Calculates the time difference between two time strings.
 * @param {string} startTime - The start time string in the format "HH:MM:SS.mmm".
 * @param {string} endTime - The end time string in the format "HH:MM:SS.mmm".
 * @returns {number} The time difference in milliseconds.
 */
export const calcTimeDifference = (
  startTime: string,
  endTime: string,
): number => {
  const start = timeToMilli(startTime);
  const end = timeToMilli(endTime);
  return end - start;
};

/**
 * Gives the unique years given an array of heats.
 * @param {Array} heats - The array of heats.
 * @returns {Array} The unique years - sorted by year in descending order.
 */
export const getUniqueYearsGivenHeats = (heats: Heat[]): number[] => {
  return [
    ...new Set(heats.map((heat) => new Date(heat.date).getFullYear())),
  ].sort((a, b) => b - a);
};
